"use client";

import { useReadContracts } from "wagmi";
import { getFazaBondAddress, FAZABOND_ABI } from "@/lib/contract";
import type { BondSummary } from "@/components/BondCard";

interface UseBondsResult {
  bonds: BondSummary[];
  isLoading: boolean;
  refetch: () => void;
}

export function useBonds(count: number, chainId?: number): UseBondsResult {
  const targetChainId = chainId === 5042002 ? 5042002 : 5042;
  const contractAddr = getFazaBondAddress(targetChainId);

  const contracts = contractAddr
    ? Array.from({ length: count }, (_, i) => ({
        address: contractAddr as `0x${string}`,
        abi: FAZABOND_ABI,
        functionName: "getBond" as const,
        args: [BigInt(i)] as const,
        chainId: targetChainId,
      }))
    : [];

  const { data, isLoading, refetch } = useReadContracts({
    contracts,
    query: { enabled: count > 0 && !!contractAddr },
  });

  const bonds: BondSummary[] = (data ?? [])
    .flatMap((r, i) => {
      if (r.status !== "success" || !r.result) return [];
      const b = r.result as {
        creator: `0x${string}`; joiner: `0x${string}`;
        stake: bigint; deadline: bigint; title: string;
        creatorIn: boolean; joinerIn: boolean; settled: boolean;
      };
      return [{
        id: i,
        creator: b.creator, joiner: b.joiner,
        stake: b.stake.toString(), deadline: Number(b.deadline),
        title: b.title, creatorIn: b.creatorIn, joinerIn: b.joinerIn,
        settled: b.settled,
      } satisfies BondSummary];
    })
    .reverse();

  return { bonds, isLoading, refetch };
}
