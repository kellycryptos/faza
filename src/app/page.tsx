"use client";

import { useState, useMemo, useEffect } from "react";
import { useReadContract, useAccount, useSwitchChain, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CreateForm } from "@/components/CreateForm";
import { BondCard } from "@/components/BondCard";
import { OtcCreateForm } from "@/components/OtcCreateForm";
import { DealCard } from "@/components/DealCard";
import { useBonds } from "@/hooks/useBonds";
import { useDeals } from "@/hooks/useDeals";
import {
  getChain, getExplorerAddress, isSupportedChain, arcMainnet, arcTestnet, formatUsdc,
} from "@/lib/arc";

import { FAZABOND_ABI, FAZABOND_ADDRESS, getFazaBondAddress } from "@/lib/contract";
import { FAZAOTC_ABI, FAZAOTC_ADDRESS, getFazaOtcAddress } from "@/lib/otc-contract";
import { ProtocolGuide } from "@/components/ProtocolGuide";
import { useNetwork } from "@/context/NetworkContext";
import { BorderBeam } from "border-beam";

type Tab = "bond" | "otc";
type FilterBond = "all" | "mine" | "open" | "ready";
type FilterDeal = "all" | "mine" | "open" | "ready";

const sectionCap: React.CSSProperties = {
  fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em",
  textTransform: "uppercase", color: "var(--subtle)", margin: 0,
};

function FeedSection({
  label, loading, empty, deployed, children,
}: {
  label: string; loading: boolean; empty: string; deployed: boolean; children: React.ReactNode;
}) {
  return (
    <section>
      <p style={{ ...sectionCap, marginBottom: "0.75rem" }}>{label}</p>
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
          {[1, 2].map((i) => (
            <div key={i} style={{
              background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: "var(--radius-card)", height: 80, opacity: 0.5,
              animation: "pulse 1.5s ease-in-out infinite",
            }} />
          ))}
        </div>
      ) : !deployed ? (
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-card)", padding: "2rem",
          textAlign: "center",
        }}>
          <p style={{ color: "var(--subtle)", fontSize: "0.9rem" }}>{empty}</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
          {children}
          {(children as React.ReactNode[])?.length === 0 && (
            <div style={{
              background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: "var(--radius-card)", padding: "2.5rem",
              textAlign: "center",
            }}>
              <p style={{ color: "var(--muted)", fontSize: "0.9rem", marginBottom: "0.75rem" }}>{empty}</p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function ClaimBanner({
  bondContractAddr,
  otcContractAddr,
  chainId,
}: {
  bondContractAddr?: `0x${string}`;
  otcContractAddr?: `0x${string}`;
  chainId: number;
}) {
  const { address } = useAccount();
  const { data: bondClaimable, refetch: refetchBondClaimable } = useReadContract({
    address: bondContractAddr || undefined,
    abi: FAZABOND_ABI,
    functionName: "claimable",
    args: address ? [address] : undefined,
    chainId,
    query: { enabled: !!address && !!bondContractAddr, refetchInterval: 8000 },
  });

  const { data: otcClaimable, refetch: refetchOtcClaimable } = useReadContract({
    address: otcContractAddr || undefined,
    abi: FAZAOTC_ABI,
    functionName: "claimable",
    args: address ? [address] : undefined,
    chainId,
    query: { enabled: !!address && !!otcContractAddr, refetchInterval: 8000 },
  });

  const bondAmt = (bondClaimable as bigint) ?? 0n;
  const otcAmt = (otcClaimable as bigint) ?? 0n;
  const total = bondAmt + otcAmt;

  const { writeContract: writeBondClaim, data: bondTxHash, isPending: bondClaimPending } = useWriteContract();
  const { isLoading: bondWaiting, isSuccess: bondSuccess } = useWaitForTransactionReceipt({ hash: bondTxHash });

  const { writeContract: writeOtcClaim, data: otcTxHash, isPending: otcClaimPending } = useWriteContract();
  const { isLoading: otcWaiting, isSuccess: otcSuccess } = useWaitForTransactionReceipt({ hash: otcTxHash });

  useEffect(() => {
    if (bondSuccess) refetchBondClaimable();
  }, [bondSuccess, refetchBondClaimable]);

  useEffect(() => {
    if (otcSuccess) refetchOtcClaimable();
  }, [otcSuccess, refetchOtcClaimable]);

  if (!address || total <= 0n) return null;

  return (
    <div
      id="claimable-section"
      style={{
        background: "linear-gradient(135deg, rgba(46, 230, 166, 0.12) 0%, rgba(20, 32, 48, 0.6) 100%)",
        border: "1px solid rgba(46, 230, 166, 0.4)",
        borderRadius: "var(--radius-card)",
        padding: "1.1rem 1.4rem",
        marginBottom: "1.5rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "1rem",
        boxShadow: "0 8px 32px rgba(46, 230, 166, 0.08)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: "rgba(46, 230, 166, 0.18)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.2rem",
            flexShrink: 0,
          }}
        >
          🎁
        </div>
        <div>
          <div style={{ fontSize: "0.92rem", fontWeight: 700, color: "var(--ink)", display: "flex", alignItems: "center", gap: 8 }}>
            Unclaimed Funds Available:
            <span style={{ fontSize: "0.92rem", color: "var(--accent)", fontWeight: 800 }}>
              {formatUsdc(total)}
            </span>
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 2 }}>
            You have settled stakes or refunds waiting in contract escrow ready to withdraw.
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        {bondAmt > 0n && bondContractAddr && (
          <button
            onClick={() =>
              writeBondClaim({
                address: bondContractAddr,
                abi: FAZABOND_ABI,
                functionName: "claim",
                chainId,
              })
            }
            disabled={bondClaimPending || bondWaiting}
            style={{
              background: "var(--accent)",
              color: "#050B14",
              border: "none",
              borderRadius: "var(--radius-btn)",
              padding: "0.5rem 1rem",
              fontSize: "0.8rem",
              fontWeight: 700,
              cursor: bondClaimPending || bondWaiting ? "not-allowed" : "pointer",
              opacity: bondClaimPending || bondWaiting ? 0.7 : 1,
            }}
          >
            {bondWaiting ? "Withdrawing…" : bondClaimPending ? "Confirming…" : `Withdraw Bond Stake (${formatUsdc(bondAmt)})`}
          </button>
        )}
        {otcAmt > 0n && otcContractAddr && (
          <button
            onClick={() =>
              writeOtcClaim({
                address: otcContractAddr,
                abi: FAZAOTC_ABI,
                functionName: "claim",
                chainId,
              })
            }
            disabled={otcClaimPending || otcWaiting}
            style={{
              background: "var(--accent)",
              color: "#050B14",
              border: "none",
              borderRadius: "var(--radius-btn)",
              padding: "0.5rem 1rem",
              fontSize: "0.8rem",
              fontWeight: 700,
              cursor: otcClaimPending || otcWaiting ? "not-allowed" : "pointer",
              opacity: otcClaimPending || otcWaiting ? 0.7 : 1,
            }}
          >
            {otcWaiting ? "Withdrawing…" : otcClaimPending ? "Confirming…" : `Withdraw OTC Stake (${formatUsdc(otcAmt)})`}
          </button>
        )}
      </div>
    </div>
  );
}

export default function HomePage() {
  const { address, chainId: walletChainId } = useAccount();
  const { switchChain } = useSwitchChain();
  const { network, chainId: effectiveChainId, isMainnet, isTestnet, setNetwork } = useNetwork();
  const onArc = isSupportedChain(walletChainId);
  const chain = getChain(effectiveChainId);

  const [tab, setTab] = useState<Tab>("bond");
  const [composing, setComposing] = useState(false);
  const [bondFilter, setBondFilter] = useState<FilterBond>("all");
  const [dealFilter, setDealFilter] = useState<FilterDeal>("all");
  const [search, setSearch] = useState("");
  const [bondSeed, setBondSeed] = useState(0);
  const [dealSeed, setDealSeed] = useState(0);

  const bondContractAddr = getFazaBondAddress(effectiveChainId) ?? FAZABOND_ADDRESS;
  const otcContractAddr = getFazaOtcAddress(effectiveChainId) ?? FAZAOTC_ADDRESS;

  const { data: bondCountRaw, refetch: refetchBondCount } = useReadContract({
    address: bondContractAddr || undefined, abi: FAZABOND_ABI,
    functionName: "bondCount", chainId: effectiveChainId,
    query: { enabled: !!bondContractAddr, refetchInterval: 8000 },
  });
  const { data: dealCountRaw, refetch: refetchDealCount } = useReadContract({
    address: otcContractAddr || undefined, abi: FAZAOTC_ABI,
    functionName: "dealCount", chainId: effectiveChainId,
    query: { enabled: !!otcContractAddr, refetchInterval: 8000 },
  });

  // On Mainnet, initialize count to at least 1 so pre-render and initial client load display Genesis Bond & Deal immediately
  const defaultBondCount = isMainnet ? 1 : 0;
  const defaultDealCount = isMainnet ? 1 : 0;

  const bondCount = (bondCountRaw !== undefined ? Number(bondCountRaw) : defaultBondCount) + (bondSeed > 0 ? 0 : 0);
  const dealCount = (dealCountRaw !== undefined ? Number(dealCountRaw) : defaultDealCount) + (dealSeed > 0 ? 0 : 0);
  const { bonds, isLoading: bondsLoading, refetch: refetchBonds } = useBonds(bondCount, effectiveChainId);
  const { deals, isLoading: dealsLoading, refetch: refetchDeals } = useDeals(dealCount, effectiveChainId);

  const handleBondCreated = () => { setComposing(false); refetchBondCount(); refetchBonds(); setBondSeed(s => s + 1); };
  const handleDealCreated = () => { setComposing(false); refetchDealCount(); refetchDeals(); setDealSeed(s => s + 1); };

  const now = Math.floor(Date.now() / 1000);
  const ZERO = "0x0000000000000000000000000000000000000000";

  const filteredBonds = useMemo(() => {
    let list = bonds;
    const q = search.trim().toLowerCase();
    if (q) list = list.filter(b =>
      b.title.toLowerCase().includes(q) ||
      b.creator.toLowerCase().includes(q) ||
      b.id.toString().includes(q)
    );
    if (bondFilter === "mine") list = list.filter(b => address && (b.creator.toLowerCase() === address.toLowerCase() || b.joiner.toLowerCase() === address.toLowerCase()));
    if (bondFilter === "open") list = list.filter(b => (!b.joiner || b.joiner === ZERO) && !b.settled && now < b.deadline);
    if (bondFilter === "ready") list = list.filter(b => b.joiner && b.joiner !== ZERO && !b.settled && now >= b.deadline);
    return list;
  }, [bonds, search, bondFilter, address, now]);

  const filteredDeals = useMemo(() => {
    let list = deals;
    const q = search.trim().toLowerCase();
    if (q) list = list.filter(d =>
      d.seller.toLowerCase().includes(q) ||
      (d.buyer && d.buyer.toLowerCase().includes(q)) ||
      d.id.toString().includes(q)
    );
    if (dealFilter === "mine") list = list.filter(d => address && (d.seller.toLowerCase() === address.toLowerCase() || (d.buyer && d.buyer.toLowerCase() === address.toLowerCase())));
    if (dealFilter === "open") list = list.filter(d => (!d.buyer || d.buyer === ZERO) && !d.settled && now < d.deadline);
    if (dealFilter === "ready") list = list.filter(d => d.buyer && d.buyer !== ZERO && !d.settled && now >= d.deadline);
    return list;
  }, [deals, search, dealFilter, address, now]);

  const myPendingCheckInCount = useMemo(() => {
    if (!address) return 0;
    return bonds.filter((b) => {
      const isCreator = b.creator.toLowerCase() === address.toLowerCase();
      const isJoiner = b.joiner && b.joiner.toLowerCase() === address.toLowerCase();
      const hasJoiner = b.joiner && b.joiner !== ZERO;
      if (!hasJoiner || b.settled || now >= b.deadline) return false;
      return (isCreator && !b.creatorIn) || (isJoiner && !b.joinerIn);
    }).length;
  }, [bonds, address, now]);

  const myPendingDealActionCount = useMemo(() => {
    if (!address) return 0;
    return deals.filter((d) => {
      const isSeller = d.seller.toLowerCase() === address.toLowerCase();
      const isBuyer = d.buyer && d.buyer.toLowerCase() === address.toLowerCase();
      const hasBuyer = d.buyer && d.buyer !== ZERO;
      if (!hasBuyer || d.settled || now >= d.deadline) return false;
      return (isSeller && !d.sellerDone) || (isBuyer && !d.buyerDone);
    }).length;
  }, [deals, address, now]);

  const explorerBond = bondContractAddr ? getExplorerAddress(bondContractAddr, effectiveChainId) : null;
  const explorerOtc = otcContractAddr ? getExplorerAddress(otcContractAddr, effectiveChainId) : null;
  const chainLabel = isTestnet ? "Arc Testnet (Sandbox · 5042002)" : "Arc Mainnet (Live · 5042)";

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 1.25rem 5rem" }}>

      {/* Testnet Sandbox Banner — clearly labels sandbox mode, visible without wallet */}
      {isTestnet && (
        <div style={{
          background: "rgba(245, 166, 35, 0.09)",
          border: "1px solid rgba(245, 166, 35, 0.4)",
          borderRadius: "var(--radius-card)",
          padding: "0.85rem 1.25rem",
          marginBottom: "1.25rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "0.75rem",
          boxShadow: "0 4px 20px rgba(245, 166, 35, 0.08)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{
              fontSize: "0.68rem", fontWeight: 800, letterSpacing: "0.08em",
              textTransform: "uppercase", background: "rgba(245, 166, 35, 0.2)",
              color: "var(--amber)", padding: "2px 8px", borderRadius: 4,
              border: "1px solid rgba(245, 166, 35, 0.4)",
            }}>
              TESTNET SANDBOX
            </span>
            <div>
              <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--ink)" }}>
                Viewing Arc Testnet Sandbox (Chain ID 5042002)
              </div>
              <div style={{ fontSize: "0.74rem", color: "var(--muted)", marginTop: 2 }}>
                All bonds, deals, and contracts shown are in sandbox test mode. Real funds are not at risk.
              </div>
            </div>
          </div>
          <button
            onClick={() => setNetwork("mainnet")}
            style={{
              background: "var(--accent)", color: "#050B14", border: "none",
              borderRadius: "var(--radius-btn)", padding: "0.45rem 1rem",
              fontSize: "0.78rem", fontWeight: 700, cursor: "pointer",
            }}
          >
            Switch to Arc Mainnet (Live) ↗
          </button>
        </div>
      )}

      {/* Network Switch Prompt if wallet connected to an unsupported chain */}
      {address && !onArc && (
        <div style={{
          background: "rgba(255, 73, 74, 0.1)",
          border: "1px solid rgba(255, 73, 74, 0.35)",
          borderRadius: "var(--radius-card)",
          padding: "0.85rem 1.25rem",
          marginBottom: "1rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "0.75rem",
        }}>
          <div>
            <div style={{ fontSize: "0.84rem", fontWeight: 700, color: "var(--ink)" }}>
              ⚠️ Unsupported network connected
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 2 }}>
              Faza is live on Arc Mainnet. Switch your wallet to mainnet (primary) or testnet (sandbox).
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              onClick={() => {
                setNetwork("mainnet");
                switchChain({ chainId: arcMainnet.id });
              }}
              style={{
                background: "var(--accent)", color: "#050B14", border: "none",
                borderRadius: "var(--radius-btn)", padding: "0.4rem 0.9rem",
                fontSize: "0.78rem", fontWeight: 700, cursor: "pointer",
              }}
            >
              Switch to Arc Mainnet (Primary)
            </button>
            <button
              onClick={() => {
                setNetwork("testnet");
                switchChain({ chainId: arcTestnet.id });
              }}
              style={{
                background: "var(--surface)", color: "var(--muted)", border: "1px solid var(--border)",
                borderRadius: "var(--radius-btn)", padding: "0.4rem 0.9rem",
                fontSize: "0.78rem", fontWeight: 600, cursor: "pointer",
              }}
            >
              Switch to Arc Testnet
            </button>
          </div>
        </div>
      )}

      {/* Unclaimed Funds Section */}
      <ClaimBanner
        bondContractAddr={bondContractAddr}
        otcContractAddr={otcContractAddr}
        chainId={effectiveChainId}
      />

      {/* Hero */}
      <div style={{
        position: "relative", textAlign: "center",
        padding: "4rem 1rem 3rem",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%,-60%)",
          width: 600, height: 400,
          background: "radial-gradient(ellipse at center, rgba(18,52,90,0.55) 0%, transparent 70%)",
          pointerEvents: "none", zIndex: 0,
        }} />

        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
          <span style={{ fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--accent)" }}>FAZA</span>

          <h1 className="display" style={{
            fontSize: "clamp(2rem,6vw,3.2rem)", fontWeight: 800,
            color: "var(--ink)", letterSpacing: "-0.04em",
            maxWidth: "16ch", margin: 0,
          }}>
            Show up, or forfeit the stake.
          </h1>

          <p style={{ color: "var(--muted)", fontSize: "clamp(0.9rem,2vw,1.05rem)", maxWidth: "48ch", lineHeight: 1.6, margin: 0 }}>
            Two wallets lock USDC on Arc. Both check in before the deadline and the stake returns. One ghosts and the other takes both.
          </p>

          <div style={{
            display: "flex", gap: 0, marginTop: "1.5rem",
            border: "1px solid var(--border)", borderRadius: "var(--radius-card)",
            overflow: "hidden", background: "var(--surface)",
          }}>
            {[
              { n: "USDC", label: "Stake in" },
              { n: "Onchain", label: "Check in" },
              { n: "After deadline", label: "Settle" },
            ].map((s, i) => (
              <div key={i} style={{
                padding: "0.9rem 1.4rem",
                borderRight: i < 2 ? "1px solid var(--border)" : undefined,
                display: "flex", flexDirection: "column", gap: 2, flex: 1,
              }}>
                <span className="tabular" style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--ink)" }}>{s.n}</span>
                <span style={{ fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--subtle)" }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tab bar + Network view selector */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", alignItems: "center", flexWrap: "wrap" }}>
        {/* Product Tabs */}
        <div style={{ display: "flex", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 3, gap: 2 }}>
          {(["bond", "otc"] as Tab[]).map((t) => (
            <button key={t} onClick={() => { setTab(t); setComposing(false); setSearch(""); }}
              style={{
                background: tab === t ? "var(--border-strong)" : "transparent",
                color: tab === t ? "var(--ink)" : "var(--muted)",
                border: "none", borderRadius: 8, padding: "0.35rem 0.9rem",
                fontSize: "0.82rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Inter', sans-serif",
              }}
            >
              {t === "bond" ? "Show-up bonds" : "OTC deals"}
            </button>
          ))}
        </div>

        {/* Search */}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search…"
          style={{
            background: "var(--surface-muted)", border: "1px solid var(--border)",
            borderRadius: 8, padding: "0.35rem 0.75rem",
            color: "var(--ink)", fontSize: "0.82rem", fontFamily: "'Inter', sans-serif",
            outline: "none", width: 130,
          }}
        />

        <div style={{ flex: 1 }} />
        <BorderBeam
          size="pulse-inner"
          colorVariant={isTestnet ? "sunset" : "ocean"}
          borderRadius={8}
          active={!composing}
          style={{ display: "inline-flex" }}
        >
          <button
            onClick={() => setComposing(v => !v)}
            style={{
              background: isTestnet ? "var(--amber)" : "var(--accent)",
              color: "#050B14",
              border: "none", borderRadius: "var(--radius-btn)",
              padding: "0.45rem 1rem", fontSize: "0.82rem",
              fontFamily: "'Inter', sans-serif", fontWeight: 700, cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {composing ? "Cancel" : tab === "bond" ? (isTestnet ? "New testnet bond" : "New bond") : (isTestnet ? "New testnet deal" : "New deal")}
          </button>
        </BorderBeam>
      </div>

      {/* Filter pills */}
      <div style={{ display: "flex", gap: "0.4rem", marginBottom: "1.1rem", flexWrap: "wrap" }}>
        {tab === "bond" ? (
          (["all", "mine", "open", "ready"] as FilterBond[]).map((f) => (
            <button key={f} onClick={() => setBondFilter(f)}
              style={{
                background: bondFilter === f ? (isTestnet ? "var(--amber)" : "var(--accent)") : "var(--surface)",
                color: bondFilter === f ? "#050B14" : "var(--muted)",
                border: bondFilter === f ? "none" : "1px solid var(--border)",
                borderRadius: "var(--radius-pill)", padding: "3px 12px",
                fontSize: "0.75rem", fontWeight: 700, cursor: "pointer",
                textTransform: "capitalize",
              }}
            >
              {f === "mine" ? "My bonds" : f === "ready" ? "Ready to settle" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))
        ) : (
          (["all", "mine", "open", "ready"] as FilterDeal[]).map((f) => (
            <button key={f} onClick={() => setDealFilter(f)}
              style={{
                background: dealFilter === f ? (isTestnet ? "var(--amber)" : "var(--accent)") : "var(--surface)",
                color: dealFilter === f ? "#050B14" : "var(--muted)",
                border: dealFilter === f ? "none" : "1px solid var(--border)",
                borderRadius: "var(--radius-pill)", padding: "3px 12px",
                fontSize: "0.75rem", fontWeight: 700, cursor: "pointer",
                textTransform: "capitalize",
              }}
            >
              {f === "mine" ? "My deals" : f === "ready" ? "Ready to settle" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))
        )}
      </div>

      {/* Compose panel */}
      {composing && (
        <div style={{
          background: "var(--surface)", border: isTestnet ? "1px solid rgba(245, 166, 35, 0.35)" : "1px solid var(--border)",
          borderRadius: "var(--radius-card)", padding: "1.5rem", marginBottom: "1.25rem",
        }}>
          {tab === "bond"
            ? <CreateForm onCreated={handleBondCreated} />
            : <OtcCreateForm onCreated={handleDealCreated} />}
        </div>
      )}

      {/* Dashboard Overview for My Bonds */}
      {tab === "bond" && bondFilter === "mine" && address && (
        <div style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-card)",
          padding: "0.85rem 1.15rem",
          marginBottom: "1rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "0.75rem",
        }}>
          <div>
            <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--ink)" }}>
              My Bonds Activity
            </span>
            <div style={{ fontSize: "0.72rem", color: "var(--muted)", marginTop: 2 }}>
              {filteredBonds.length} bond{filteredBonds.length === 1 ? "" : "s"} found for {address.slice(0, 6)}…{address.slice(-4)}
            </div>
          </div>
          {myPendingCheckInCount > 0 ? (
            <span style={{
              background: "rgba(245, 166, 35, 0.15)",
              border: "1px solid rgba(245, 166, 35, 0.4)",
              color: "var(--amber)",
              borderRadius: "var(--radius-pill)",
              padding: "4px 12px",
              fontSize: "0.74rem",
              fontWeight: 700,
            }}>
              ⚠️ {myPendingCheckInCount} check-in{myPendingCheckInCount > 1 ? "s" : ""} required before deadline
            </span>
          ) : (
            <span style={{
              background: "rgba(46, 230, 166, 0.1)",
              border: "1px solid rgba(46, 230, 166, 0.25)",
              color: "var(--accent)",
              borderRadius: "var(--radius-pill)",
              padding: "4px 12px",
              fontSize: "0.74rem",
              fontWeight: 700,
            }}>
              ✓ Check-ins up to date
            </span>
          )}
        </div>
      )}

      {/* Dashboard Overview for My Deals */}
      {tab === "otc" && dealFilter === "mine" && address && (
        <div style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-card)",
          padding: "0.85rem 1.15rem",
          marginBottom: "1rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "0.75rem",
        }}>
          <div>
            <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--ink)" }}>
              My OTC Deals Activity
            </span>
            <div style={{ fontSize: "0.72rem", color: "var(--muted)", marginTop: 2 }}>
              {filteredDeals.length} deal{filteredDeals.length === 1 ? "" : "s"} found for {address.slice(0, 6)}…{address.slice(-4)}
            </div>
          </div>
          {myPendingDealActionCount > 0 ? (
            <span style={{
              background: "rgba(245, 166, 35, 0.15)",
              border: "1px solid rgba(245, 166, 35, 0.4)",
              color: "var(--amber)",
              borderRadius: "var(--radius-pill)",
              padding: "4px 12px",
              fontSize: "0.74rem",
              fontWeight: 700,
            }}>
              ⚠️ {myPendingDealActionCount} deal action{myPendingDealActionCount > 1 ? "s" : ""} pending
            </span>
          ) : (
            <span style={{
              background: "rgba(46, 230, 166, 0.1)",
              border: "1px solid rgba(46, 230, 166, 0.25)",
              color: "var(--accent)",
              borderRadius: "var(--radius-pill)",
              padding: "4px 12px",
              fontSize: "0.74rem",
              fontWeight: 700,
            }}>
              ✓ Deals up to date
            </span>
          )}
        </div>
      )}

      {/* Feed */}
      {tab === "bond" && (
        <FeedSection
          label={`${isTestnet ? "Testnet Bonds" : "Bonds"}${filteredBonds.length !== bonds.length ? ` (${filteredBonds.length} of ${bonds.length})` : ` (${bonds.length})`}`}
          loading={bondsLoading}
          empty={!bondContractAddr ? "Contract not deployed." : isTestnet ? "No testnet bonds yet. Create the first sandbox bond." : "No bonds yet. Create the first one."}
          deployed={!!bondContractAddr}
        >
          {filteredBonds.map((b) => <BondCard key={b.id} bond={b} />)}
        </FeedSection>
      )}

      {tab === "otc" && (
        <FeedSection
          label={`${isTestnet ? "Testnet OTC deals" : "OTC deals"}${filteredDeals.length !== deals.length ? ` (${filteredDeals.length} of ${deals.length})` : ` (${deals.length})`}`}
          loading={dealsLoading}
          empty={!otcContractAddr ? "OTC contract not deployed." : isTestnet ? "No testnet deals yet. Create the first sandbox deal." : "No deals yet. Create the first one."}
          deployed={!!otcContractAddr}
        >
          {filteredDeals.map((d) => <DealCard key={d.id} deal={d} />)}
        </FeedSection>
      )}

      {/* Protocol Guide Section — positioned at the bottom above footer */}
      <div style={{ marginTop: "3.5rem" }}>
        <ProtocolGuide />
      </div>

      {/* Footer */}
      <footer style={{
        marginTop: "4rem", paddingTop: "1.5rem",
        borderTop: "1px solid var(--border)",
        display: "flex", flexDirection: "column", gap: "1.25rem",
      }}>
        {/* Upper row: Network & Contracts */}
        <div style={{
          display: "flex", flexWrap: "wrap", gap: "1rem",
          justifyContent: "space-between", alignItems: "center",
        }}>
          <p style={{ fontSize: "0.75rem", color: isTestnet ? "var(--amber)" : "var(--subtle)", margin: 0, fontWeight: isTestnet ? 600 : 400 }}>
            Built on {chainLabel} · USDC gas
          </p>
          <div style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap", alignItems: "center" }}>
            {explorerBond && (
              <a href={explorerBond} target="_blank" rel="noopener noreferrer"
                className="mono"
                style={{ fontSize: "0.72rem", color: isTestnet ? "var(--amber)" : "var(--accent)", textDecoration: "none" }}>
                FazaBond ({isTestnet ? "Testnet" : "Mainnet"}) {bondContractAddr.slice(0, 10)}… ↗
              </a>
            )}
            {explorerOtc && (
              <a href={explorerOtc} target="_blank" rel="noopener noreferrer"
                className="mono"
                style={{ fontSize: "0.72rem", color: isTestnet ? "var(--amber)" : "var(--accent)", textDecoration: "none" }}>
                FazaOTC ({isTestnet ? "Testnet" : "Mainnet"}) {otcContractAddr.slice(0, 10)}… ↗
              </a>
            )}
          </div>
        </div>

        {/* Lowest row: Git & X */}
        <div style={{
          paddingTop: "0.85rem",
          borderTop: "1px solid rgba(28, 36, 51, 0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "1.25rem",
          flexWrap: "wrap",
        }}>
          <a
            href="https://github.com/kellycryptos/faza"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              fontSize: "0.74rem",
              fontWeight: 600,
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            <span>GitHub</span>
          </a>
          <span style={{ color: "var(--border-strong)", fontSize: "0.75rem" }}>•</span>
          <a
            href="https://x.com/Fazaotc"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              fontSize: "0.74rem",
              fontWeight: 600,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            <span>X (@Fazaotc)</span>
          </a>
        </div>
      </footer>
    </div>
  );
}
