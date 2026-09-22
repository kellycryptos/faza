"use client";

import { useReadContracts } from "wagmi";
import { activeChain } from "@/lib/arc";
import { FAZAOTC_ABI, FAZAOTC_ADDRESS, type DealSummary } from "@/lib/otc-contract";

export function useDeals(count: number) {
  const ids = Array.from({ length: count }, (_, i) => i);

  const { data, isLoading, refetch } = useReadContracts({
    contracts: ids.map((i) => ({
      address: FAZAOTC_ADDRESS || undefined,
      abi: FAZAOTC_ABI,
      functionName: "getDeal" as const,
      args: [BigInt(i)] as [bigint],
      chainId: activeChain.id,
    })),
    query: { enabled: count > 0 && !!FAZAOTC_ADDRESS },
  });

  const deals: DealSummary[] = (data ?? []).flatMap((r, i) => {
    if (r.status !== "success" || !r.result) return [];
    const d = r.result as {
      seller: `0x${string}`; buyer: `0x${string}`; termsHash: `0x${string}`;
      asset: `0x${string}`; size: bigint; priceUsdc: bigint; stake: bigint;
      deadline: bigint; sellerAttested: boolean; buyerAttested: boolean;
      sellerDone: boolean; buyerDone: boolean; settled: boolean; state: number;
    };
    if (d.seller === "0x0000000000000000000000000000000000000000") return [];
    const deal: DealSummary = {
      id: i,
      seller: d.seller, buyer: d.buyer, termsHash: d.termsHash,
      asset: d.asset, size: d.size.toString(), priceUsdc: d.priceUsdc.toString(),
      stake: d.stake.toString(), deadline: Number(d.deadline),
      sellerAttested: d.sellerAttested, buyerAttested: d.buyerAttested,
      sellerDone: d.sellerDone, buyerDone: d.buyerDone,
      settled: d.settled, state: Number(d.state),
    };
    return [deal];
  }).reverse();

  return { deals, isLoading, refetch };
}
