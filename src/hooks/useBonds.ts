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
      const res = r.result as any;
      const creator = (res.creator ?? res[0]) as `0x${string}`;
      const joiner = (res.joiner ?? res[1]) as `0x${string}`;
      const stake = (res.stake ?? res[2] ?? 0n) as bigint;
      const deadline = Number(res.deadline ?? res[3] ?? 0);
      const title = (res.title ?? res[4] ?? "") as string;
      const creatorIn = Boolean(res.creatorIn ?? res[5]);
      const joinerIn = Boolean(res.joinerIn ?? res[6]);
      const settled = Boolean(res.settled ?? res[7]);
      if (!creator || creator === "0x0000000000000000000000000000000000000000") return [];
      return [{
        id: i,
        creator,
        joiner,
        stake: stake.toString(),
        deadline,
        title,
        creatorIn,
        joinerIn,
        settled,
      } satisfies BondSummary];
    })
    .reverse();

  return { bonds, isLoading, refetch };
}
