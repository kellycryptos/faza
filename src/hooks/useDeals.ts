"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { useReadContracts } from "wagmi";
import { createPublicClient, http } from "viem";
import { arcMainnet, arcTestnet } from "@/lib/arc";
import {
  getFazaOtcAddress,
  FAZAOTC_ABI,
  getLocalDeals,
  type DealSummary,
  type LocalDealSummary,
} from "@/lib/otc-contract";

export function useDeals(count: number, chainId?: number) {
  const targetChainId = chainId === 5042002 ? 5042002 : 5042;
  const contractAddr = getFazaOtcAddress(targetChainId);

  // Read locally saved user deals
  const [localDeals, setLocalDeals] = useState<LocalDealSummary[]>([]);
  const reloadLocal = useCallback(() => {
    setLocalDeals(getLocalDeals(targetChainId));
  }, [targetChainId]);

  useEffect(() => {
    reloadLocal();
    const handleUpdate = () => reloadLocal();
    window.addEventListener("faza_local_deal_update", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("faza_local_deal_update", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [reloadLocal]);

  const ids = Array.from({ length: count }, (_, i) => i);

  const contracts = contractAddr && count > 0
    ? ids.map((i) => ({
        address: contractAddr,
        abi: FAZAOTC_ABI,
        functionName: "getDeal" as const,
        args: [BigInt(i)] as [bigint],
        chainId: targetChainId,
      }))
    : [];

  const { data, refetch: wagmiRefetch } = useReadContracts({
    contracts,
    query: {
      enabled: contracts.length > 0 && !!contractAddr,
      refetchInterval: 8000,
    },
  });

  const parsedDeals: DealSummary[] = useMemo(() => {
    return (data ?? []).flatMap((r, i) => {
      if (r.status !== "success" || !r.result) return [];
      const d = r.result as any;
      const seller = (d.seller ?? d[0]) as `0x${string}`;
      const buyer = (d.buyer ?? d[1]) as `0x${string}`;
      const termsHash = (d.termsHash ?? d[2]) as `0x${string}`;
      const asset = (d.asset ?? d[3]) as `0x${string}`;
      const size = (d.size ?? d[4] ?? 0n) as bigint;
      const priceUsdc = (d.priceUsdc ?? d[5] ?? 0n) as bigint;
      const stake = (d.stake ?? d[6] ?? 0n) as bigint;
      const deadline = Number(d.deadline ?? d[7] ?? 0);
      const sellerAttested = Boolean(d.sellerAttested ?? d[8]);
      const buyerAttested = Boolean(d.buyerAttested ?? d[9]);
      const sellerDone = Boolean(d.sellerDone ?? d[10]);
      const buyerDone = Boolean(d.buyerDone ?? d[11]);
      const settled = Boolean(d.settled ?? d[12]);
      const state = Number(d.state ?? d[13] ?? 0);

      if (!seller || seller === "0x0000000000000000000000000000000000000000") return [];
      return [{
        id: i,
        seller,
        buyer,
        termsHash,
        asset,
        size: size.toString(),
        priceUsdc: priceUsdc.toString(),
        stake: stake.toString(),
        deadline,
        sellerAttested,
        buyerAttested,
        sellerDone,
        buyerDone,
        settled,
        state,
        isOnchain: true,
      } satisfies DealSummary];
    }).reverse();
  }, [data]);

  // Direct RPC fallback to guarantee deals render even if Wagmi query stalls
  const [directDeals, setDirectDeals] = useState<DealSummary[]>([]);
  const [directLoading, setDirectLoading] = useState(false);

  const fetchDirect = useCallback(async () => {
    if (!contractAddr) return;
    try {
      setDirectLoading(true);
      const chain = targetChainId === 5042002 ? arcTestnet : arcMainnet;
      const client = createPublicClient({
        chain,
        transport: http(chain.rpcUrls.default.http[0], { timeout: 30_000, retryCount: 3 }),
      });

      const total = count > 0 ? count : Number(await client.readContract({
        address: contractAddr,
        abi: FAZAOTC_ABI,
        functionName: "dealCount",
      }));

      if (total <= 0) {
        setDirectDeals([]);
        return;
      }

      const calls = Array.from({ length: total }, (_, i) => ({
        address: contractAddr,
        abi: FAZAOTC_ABI,
        functionName: "getDeal" as const,
        args: [BigInt(i)] as const,
      }));

      const results = await client.multicall({ contracts: calls });
      const list: DealSummary[] = [];
      for (let i = 0; i < results.length; i++) {
        const r = results[i];
        if (r.status !== "success" || !r.result) continue;
        const d = r.result as any;
        const seller = (d.seller ?? d[0]) as `0x${string}`;
        const buyer = (d.buyer ?? d[1]) as `0x${string}`;
        const termsHash = (d.termsHash ?? d[2]) as `0x${string}`;
        const asset = (d.asset ?? d[3]) as `0x${string}`;
        const size = (d.size ?? d[4] ?? 0n) as bigint;
        const priceUsdc = (d.priceUsdc ?? d[5] ?? 0n) as bigint;
        const stake = (d.stake ?? d[6] ?? 0n) as bigint;
        const deadline = Number(d.deadline ?? d[7] ?? 0);
        const sellerAttested = Boolean(d.sellerAttested ?? d[8]);
        const buyerAttested = Boolean(d.buyerAttested ?? d[9]);
        const sellerDone = Boolean(d.sellerDone ?? d[10]);
        const buyerDone = Boolean(d.buyerDone ?? d[11]);
        const settled = Boolean(d.settled ?? d[12]);
        const state = Number(d.state ?? d[13] ?? 0);

        if (!seller || seller === "0x0000000000000000000000000000000000000000") continue;
        list.push({
          id: i,
          seller,
          buyer,
          termsHash,
          asset,
          size: size.toString(),
          priceUsdc: priceUsdc.toString(),
          stake: stake.toString(),
          deadline,
          sellerAttested,
          buyerAttested,
          sellerDone,
          buyerDone,
          settled,
          state,
          isOnchain: true,
        });
      }
      setDirectDeals(list.reverse());
    } catch (err) {
      console.warn("[Faza] Direct deal fetch fallback:", err);
    } finally {
      setDirectLoading(false);
    }
  }, [contractAddr, targetChainId, count]);

  useEffect(() => {
    fetchDirect();
  }, [fetchDirect]);

  // Use parsed wagmi deals if present, otherwise direct RPC deals
  const effectiveOnchainDeals = parsedDeals.length > 0 ? parsedDeals : directDeals;

  // Merge:
  // 1. Pending locally created deals (shown at top immediately)
  // 2. Confirmed onchain deals (newest first)
  const deals = useMemo(() => {
    const onchainIds = new Set(effectiveOnchainDeals.map((d) => d.id));
    const pendingLocal = localDeals.filter((d) => !onchainIds.has(d.id));
    return [...pendingLocal, ...effectiveOnchainDeals];
  }, [effectiveOnchainDeals, localDeals]);

  const isLoading =
    effectiveOnchainDeals.length === 0 &&
    (directLoading || (!data && count > 0));

  return {
    deals,
    isLoading,
    refetch: () => {
      reloadLocal();
      fetchDirect();
      wagmiRefetch();
    },
  };
}

