"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { useReadContracts } from "wagmi";
import { getFazaBondAddress, FAZABOND_ABI, getLocalBonds, type LocalBondSummary } from "@/lib/contract";
import type { BondSummary } from "@/components/BondCard";

interface UseBondsResult {
  bonds: BondSummary[];
  isLoading: boolean;
  refetch: () => void;
}

export function useBonds(count: number, chainId?: number): UseBondsResult {
  const targetChainId = chainId === 5042002 ? 5042002 : 5042;
  const contractAddr = getFazaBondAddress(targetChainId);

  // Read locally saved user bonds
  const [localBonds, setLocalBonds] = useState<LocalBondSummary[]>([]);
  const reloadLocal = useCallback(() => {
    setLocalBonds(getLocalBonds(targetChainId));
  }, [targetChainId]);

  useEffect(() => {
    reloadLocal();
    const handleUpdate = () => reloadLocal();
    window.addEventListener("faza_local_update", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("faza_local_update", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [reloadLocal]);

  // Read onchain if count > 0
  const contracts = contractAddr && count > 0
    ? Array.from({ length: count }, (_, i) => ({
        address: contractAddr as `0x${string}`,
        abi: FAZABOND_ABI,
        functionName: "getBond" as const,
        args: [BigInt(i)] as const,
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

  const parsedBonds: BondSummary[] = useMemo(() => {
    return (data ?? [])
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
          isOnchain: true,
        } satisfies BondSummary];
      })
      .reverse();
  }, [data]);

  // Merge:
  // 1. Pending locally created bonds (shown at top immediately)
  // 2. Confirmed onchain bonds (newest first)
  const bonds = useMemo(() => {
    const onchainIds = new Set(parsedBonds.map((b) => b.id));
    const pendingLocal = localBonds.filter((b) => !onchainIds.has(b.id));
    return [...pendingLocal, ...parsedBonds];
  }, [parsedBonds, localBonds]);

  return {
    bonds,
    isLoading: !data && count > 0,
    refetch: () => {
      reloadLocal();
      refetch();
    },
  };
}

