"use client";

import { useReadContracts } from "wagmi";
import { getFazaOtcAddress, FAZAOTC_ABI, type DealSummary } from "@/lib/otc-contract";

export function useDeals(count: number, chainId?: number) {
  const contractAddr = getFazaOtcAddress(chainId);
  const ids = Array.from({ length: count }, (_, i) => i);

  const { data, isLoading, refetch } = useReadContracts({
    contracts: ids.map((i) => ({
      address: contractAddr || undefined,
      abi: FAZAOTC_ABI,
      functionName: "getDeal" as const,
      args: [BigInt(i)] as [bigint],
      chainId,
    })),
    query: { enabled: count > 0 && !!contractAddr },
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
    return [{
      id: i, seller: d.seller, buyer: d.buyer, termsHash: d.termsHash,
      asset: d.asset, size: d.size.toString(), priceUsdc: d.priceUsdc.toString(),
      stake: d.stake.toString(), deadline: Number(d.deadline),
      sellerAttested: d.sellerAttested, buyerAttested: d.buyerAttested,
      sellerDone: d.sellerDone, buyerDone: d.buyerDone,
      settled: d.settled, state: Number(d.state),
    } satisfies DealSummary];
  }).reverse();

  return { deals, isLoading, refetch };
}
