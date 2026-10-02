"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { useReadContracts } from "wagmi";
import {
  getFazaOtcAddress,
  FAZAOTC_ABI,
  getDealsForNetwork,
  getLocalDeals,
  type DealSummary,
  type LocalDealSummary,
} from "@/lib/otc-contract";

export function useDeals(count: number, chainId?: number) {
  const targetChainId = chainId === 5042002 ? 5042002 : 5042;
  const contractAddr = getFazaOtcAddress(targetChainId);
  const baselineDeals = useMemo(() => getDealsForNetwork(targetChainId), [targetChainId]);

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

  const { data, refetch } = useReadContracts({
    contracts,
    query: {
      enabled: contracts.length > 0 && !!contractAddr,
      refetchInterval: 5000,
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
      } satisfies DealSummary];
    }).reverse();
  }, [data]);

  // Merge:
  // 1. Pending locally created deals (shown at top immediately)
  // 2. Confirmed onchain deals (newest first)
  // 3. Baseline curated deals (ensuring at least 10 items visible)
  const deals = useMemo(() => {
    const onchainIds = new Set(parsedDeals.map((d) => d.id));
    const pendingLocal = localDeals.filter((d) => !onchainIds.has(d.id));
    const allKnownIds = new Set([...parsedDeals.map((d) => d.id), ...pendingLocal.map((d) => d.id)]);
    const remainingBaseline = baselineDeals.filter((d) => !allKnownIds.has(d.id));
    return [...pendingLocal, ...parsedDeals, ...remainingBaseline];
  }, [parsedDeals, localDeals, baselineDeals]);

  return {
    deals,
    isLoading: false, // Instant zero-delay presentation: baseline & local deals are immediately ready
    refetch: () => {
      reloadLocal();
      refetch();
    },
  };
}

