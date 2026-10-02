"use client";

import { useReadContracts } from "wagmi";
import { getFazaOtcAddress, FAZAOTC_ABI, MAINNET_GENESIS_DEAL, type DealSummary } from "@/lib/otc-contract";

export function useDeals(count: number, chainId?: number) {
  const targetChainId = chainId === 5042002 ? 5042002 : 5042;
  const isMainnet = targetChainId === 5042;
  const contractAddr = getFazaOtcAddress(targetChainId);

  // On Mainnet, query at least 1 deal (Genesis Deal 0) even if count hasn't loaded yet
  const effectiveCount = (isMainnet && count === 0) ? 1 : count;
  const ids = Array.from({ length: effectiveCount }, (_, i) => i);

  const { data, isLoading, refetch } = useReadContracts({
    contracts: ids.map((i) => ({
      address: contractAddr || undefined,
      abi: FAZAOTC_ABI,
      functionName: "getDeal" as const,
      args: [BigInt(i)] as [bigint],
      chainId: targetChainId,
    })),
    query: {
      enabled: effectiveCount > 0 && !!contractAddr,
      refetchInterval: 8000,
    },
  });

  const parsedDeals: DealSummary[] = (data ?? []).flatMap((r, i) => {
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

  // On mainnet, if onchain read hasn't completed yet or returned empty while count is 0 or 1,
  // ensure Genesis Deal #0 is immediately visible
  const deals = (isMainnet && parsedDeals.length === 0 && count <= 1)
    ? [MAINNET_GENESIS_DEAL]
    : parsedDeals;

  return { deals, isLoading: isLoading && deals.length === 0, refetch };
}
