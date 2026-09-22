"use client";

import { useReadContracts } from "wagmi";
import { activeChain } from "@/lib/arc";
import { FAZABOND_ABI, FAZABOND_ADDRESS } from "@/lib/contract";
import type { BondSummary } from "@/components/BondCard";

interface UseBondsResult {
  bonds: BondSummary[];
  isLoading: boolean;
  refetch: () => void;
}

/**
 * Read bonds 0..count-1 from the contract.
 * We first read bondCount, then batch all getBond calls.
 */
export function useBonds(count: number): UseBondsResult {
  const contracts = FAZABOND_ADDRESS
    ? Array.from({ length: count }, (_, i) => ({
        address: FAZABOND_ADDRESS as `0x${string}`,
        abi: FAZABOND_ABI,
        functionName: "getBond" as const,
        args: [BigInt(i)] as const,
        chainId: activeChain.id,
      }))
    : [];

  const { data, isLoading, refetch } = useReadContracts({
    contracts,
    query: { enabled: count > 0 && !!FAZABOND_ADDRESS },
  });

  const bonds: BondSummary[] = (data ?? [])
    .flatMap((r, i) => {
      if (r.status !== "success" || !r.result) return [];
      const b = r.result as {
        creator: `0x${string}`;
        joiner: `0x${string}`;
        stake: bigint;
        deadline: bigint;
        title: string;
        creatorIn: boolean;
        joinerIn: boolean;
        settled: boolean;
      };
      const bond: BondSummary = {
        id: i,
        creator: b.creator,
        joiner: b.joiner,
        stake: b.stake.toString(),
        deadline: Number(b.deadline),
        title: b.title,
        creatorIn: b.creatorIn,
        joinerIn: b.joinerIn,
        settled: b.settled,
      };
      return [bond];
    })
    .reverse(); // newest first

  return { bonds, isLoading, refetch };
}
