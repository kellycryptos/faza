"use client";

import { useReadContracts } from "wagmi";
import { getFazaBondAddress, FAZABOND_ABI, MAINNET_GENESIS_BOND } from "@/lib/contract";
import type { BondSummary } from "@/components/BondCard";

interface UseBondsResult {
  bonds: BondSummary[];
  isLoading: boolean;
  refetch: () => void;
}

export function useBonds(count: number, chainId?: number): UseBondsResult {
  const targetChainId = chainId === 5042002 ? 5042002 : 5042;
  const isMainnet = targetChainId === 5042;
  const contractAddr = getFazaBondAddress(targetChainId);

  // On Mainnet, query at least 1 bond (Genesis Bond 0) even if count hasn't loaded yet
  const effectiveCount = (isMainnet && count === 0) ? 1 : count;

  const contracts = contractAddr
    ? Array.from({ length: effectiveCount }, (_, i) => ({
        address: contractAddr as `0x${string}`,
        abi: FAZABOND_ABI,
        functionName: "getBond" as const,
        args: [BigInt(i)] as const,
        chainId: targetChainId,
      }))
    : [];

  const { data, isLoading, refetch } = useReadContracts({
    contracts,
    query: {
      enabled: effectiveCount > 0 && !!contractAddr,
      refetchInterval: 8000,
    },
  });

  const parsedBonds: BondSummary[] = (data ?? [])
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

  // On mainnet, if onchain read hasn't completed yet or returned empty while count is 0 or 1,
  // ensure Genesis Bond #0 is immediately visible rather than rendering an empty list
  const bonds = (isMainnet && parsedBonds.length === 0 && count <= 1)
    ? [MAINNET_GENESIS_BOND]
    : parsedBonds;

  return { bonds, isLoading: isLoading && bonds.length === 0, refetch };
}
