"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useReadContract } from "wagmi";
import { formatUsdc, formatDeadline, shortAddr, getExplorerAddress } from "@/lib/arc";
import { useAccount } from "wagmi";
import { FAZAOTC_ABI, FAZAOTC_ADDRESS, getFazaOtcAddress, DEAL_STATES, isPvp, type DealSummary, getFallbackDeal } from "@/lib/otc-contract";
import { DealActions } from "@/components/DealActions";

import { useNetwork } from "@/context/NetworkContext";

const ZERO = "0x0000000000000000000000000000000000000000";

export default function OtcPage() {
  const routeParams = useParams();
  const idStr = (routeParams?.id as string) || (typeof window !== "undefined" ? window.location.pathname.split("/").pop() || "" : "");
  const dealId = parseInt(idStr, 10);
  const [refreshKey, setRefreshKey] = useState(0);
  const [copied, setCopied] = useState(false);
  const { chainId: walletChainId } = useAccount();
  const { chainId: effectiveChainId, isTestnet, setNetwork } = useNetwork();
  const contractAddr = getFazaOtcAddress(effectiveChainId) ?? FAZAOTC_ADDRESS;
  const fallback = !isNaN(dealId) ? getFallbackDeal(dealId, effectiveChainId) : undefined;

  const { data: raw, isLoading, refetch } = useReadContract({
    address: contractAddr || undefined,
    abi: FAZAOTC_ABI, functionName: "getDeal",
    args: [BigInt(isNaN(dealId) ? 0 : dealId)],
    chainId: effectiveChainId,
    query: { enabled: !!contractAddr && !isNaN(dealId), refetchInterval: 5000 },
  });

  useEffect(() => { if (refreshKey > 0) refetch(); }, [refreshKey, refetch]);

  const handleCopy = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  if (isNaN(dealId)) {
    return (
      <Wrap>
        <Link href={`/${isTestnet ? "?network=testnet" : ""}`} style={{ fontSize: "0.82rem", color: "var(--muted)", textDecoration: "none" }}>
          ← Back to all deals
        </Link>
        <p style={{ color: "var(--subtle)", marginTop: "1rem" }}>Invalid deal ID.</p>
      </Wrap>
    );
  }

  const d = (raw && (raw as any).seller && (raw as any).seller !== ZERO)
    ? (raw as {
        seller: `0x${string}`; buyer: `0x${string}`; termsHash: `0x${string}`;
        asset: `0x${string}`; size: bigint; priceUsdc: bigint; stake: bigint; deadline: bigint;
        sellerAttested: boolean; buyerAttested: boolean;
        sellerDone: boolean; buyerDone: boolean;
        settled: boolean; state: number;
      })
    : fallback
    ? {
        seller: fallback.seller as `0x${string}`,
        buyer: fallback.buyer as `0x${string}`,
        termsHash: fallback.termsHash as `0x${string}`,
        asset: fallback.asset as `0x${string}`,
        size: BigInt(fallback.size),
        priceUsdc: BigInt(fallback.priceUsdc),
        stake: BigInt(fallback.stake),
        deadline: BigInt(fallback.deadline),
        sellerAttested: fallback.sellerAttested,
        buyerAttested: fallback.buyerAttested,
        sellerDone: fallback.sellerDone,
        buyerDone: fallback.buyerDone,
        settled: fallback.settled,
        state: fallback.state,
      }
    : undefined;

  if (!d || d.seller === ZERO) {
    if (isLoading) {
      return (
        <Wrap>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ width: 90, height: 20, background: "var(--surface)", borderRadius: 4, opacity: 0.6, animation: "pulse 1.5s infinite" }} />
            <div style={{ width: "50%", height: 36, background: "var(--surface)", borderRadius: 6, opacity: 0.6, animation: "pulse 1.5s infinite" }} />
            <div style={{ height: 100, background: "var(--surface)", borderRadius: 10, opacity: 0.5, animation: "pulse 1.5s infinite" }} />
          </div>
        </Wrap>
      );
    }
    return (
      <Wrap>
        <Link href={`/${isTestnet ? "?network=testnet" : ""}`} style={{ fontSize: "0.82rem", color: "var(--muted)", textDecoration: "none" }}>
          ← Back to all {isTestnet ? "testnet " : ""}deals
        </Link>
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-card)", padding: "2rem", textAlign: "center", marginTop: "1rem",
        }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--ink)", marginBottom: 8 }}>
            Deal #{dealId} Not Found
          </h2>
          <p style={{ color: "var(--subtle)", fontSize: "0.85rem", marginBottom: "1.25rem" }}>
            This deal was not found on {isTestnet ? "Arc Testnet (5042002)" : "Arc Mainnet (5042)"}. It may exist on the other network.
          </p>
          <button
            onClick={() => setNetwork(isTestnet ? "mainnet" : "testnet")}
            style={{
              background: "var(--accent)", color: "#050B14", border: "none",
              borderRadius: "var(--radius-btn)", padding: "0.5rem 1.1rem",
              fontSize: "0.82rem", fontWeight: 700, cursor: "pointer",
            }}
          >
            Switch to {isTestnet ? "Arc Mainnet" : "Arc Testnet"} ↗
          </button>
        </div>
      </Wrap>
    );
  }


  const deal: DealSummary = {
    id: dealId, seller: d.seller, buyer: d.buyer, termsHash: d.termsHash,
    asset: d.asset, size: d.size.toString(), priceUsdc: d.priceUsdc.toString(),
    stake: d.stake.toString(), deadline: Number(d.deadline),
    sellerAttested: d.sellerAttested, buyerAttested: d.buyerAttested,
    sellerDone: d.sellerDone, buyerDone: d.buyerDone,
    settled: d.settled, state: Number(d.state),
  };

  const pvp = isPvp(deal);
  const hasBuyer = d.buyer !== ZERO;
  const now = Math.floor(Date.now() / 1000);
  const expired = now >= deal.deadline;
  const stateName = DEAL_STATES[deal.state] ?? "Unknown";

  const tweetText = !hasBuyer
    ? `I created an onchain OTC deal on Arc: Deal #${dealId} (${pvp ? "PvP Token Swap" : "Offchain Asset Bond"}). Terms cryptographically locked: ${typeof window !== "undefined" ? window.location.href : ""} via @fazaotc`
    : deal.settled
    ? `OTC Deal #${dealId} on Arc settled onchain: ${typeof window !== "undefined" ? window.location.href : ""} via @fazaotc`
    : `OTC Deal #${dealId} is live on Arc (${formatUsdc(d.priceUsdc)}): ${typeof window !== "undefined" ? window.location.href : ""} via @fazaotc`;
  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;

  return (
    <Wrap>
      <Link
        href={`/${isTestnet ? "?network=testnet" : ""}`}
        style={{ fontSize: "0.8rem", color: "var(--muted)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}
      >
        ← All {isTestnet ? "testnet " : ""}deals
      </Link>

      {/* Testnet Sandbox Alert */}
      {isTestnet && (
        <div style={{
          background: "rgba(245, 166, 35, 0.09)", border: "1px solid rgba(245, 166, 35, 0.35)",
          borderRadius: 8, padding: "0.5rem 0.9rem", display: "flex", alignItems: "center", gap: 8,
        }}>
          <span style={{ fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.08em", background: "rgba(245,166,35,0.2)", color: "var(--amber)", padding: "1px 6px", borderRadius: 4 }}>
            TESTNET SANDBOX
          </span>
          <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
            This deal is on Arc Testnet (5042002). Collateral is testnet USDC.
          </span>
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
        <span
          style={{
            fontSize: "0.7rem", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase",
            padding: "3px 10px", borderRadius: "var(--radius-pill)",
            background: pvp ? "var(--accent-dim)" : "rgba(245,166,35,0.1)",
            color: pvp ? "var(--accent)" : "var(--amber)",
            border: `1px solid ${pvp ? "rgba(46,230,166,0.25)" : "rgba(245,166,35,0.3)"}`,
          }}
        >
          {pvp ? "PvP settle on Arc" : "Bond only — offchain stock"}
        </span>
        <span
          style={{
            fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase",
            padding: "3px 10px", borderRadius: "var(--radius-pill)",
            background: deal.settled ? "rgba(90,100,120,0.18)" : expired ? "var(--danger-dim)" : "var(--accent-dim)",
            color: deal.settled ? "var(--subtle)" : expired ? "var(--danger)" : "var(--accent)",
          }}
        >
          {stateName}
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
        <h1 className="display" style={{ fontSize: "clamp(1.4rem,4vw,1.9rem)", fontWeight: 700, color: "var(--ink)", letterSpacing: "-0.03em", margin: 0 }}>
          Deal #{dealId}
        </h1>
        <button
          onClick={handleCopy}
          title="Copy link to clipboard"
          style={{
            background: copied ? "rgba(46,230,166,0.12)" : "var(--surface)",
            border: `1px solid ${copied ? "var(--accent)" : "var(--border)"}`,
            borderRadius: 6,
            padding: "3px 9px",
            fontSize: "0.72rem",
            color: copied ? "var(--accent)" : "var(--muted)",
            cursor: "pointer",
            fontFamily: "'Inter', sans-serif",
            fontWeight: 600,
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          {copied ? "✓ Copied" : "🔗 Copy link"}
        </button>
        <a
          href={tweetUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Share this deal on X"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 6,
            padding: "3px 9px",
            fontSize: "0.72rem",
            color: "var(--ink)",
            textDecoration: "none",
            fontFamily: "'Inter', sans-serif",
            fontWeight: 600,
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          Share on 𝕏
        </a>
      </div>

      {/* Terms hash */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "0.9rem 1.1rem" }}>
        <p style={cap}>Terms hash (keccak256)</p>
        <p className="mono" style={{ fontSize: "0.78rem", color: "var(--muted)", wordBreak: "break-all", margin: 0 }}>{d.termsHash}</p>
        <p style={{ fontSize: "0.7rem", color: "var(--subtle)", marginTop: 5 }}>
          Both parties verified they signed the same term sheet before the deal was locked.
        </p>
        {!pvp && (
          <p style={{ fontSize: "0.75rem", color: "var(--amber)", marginTop: 6, fontWeight: 600 }}>
            Bond only. The share moves offchain. Faza enforces the stake.
          </p>
        )}
      </div>

      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px,1fr))", gap: "0.65rem" }}>
        <StatCard label="Price" value={formatUsdc(d.priceUsdc)} />
        <StatCard label="Each stakes" value={formatUsdc(d.stake)} />
        <StatCard label="Deadline" value={formatDeadline(Number(d.deadline))} accent={expired ? "var(--danger)" : undefined} />
        <StatCard label="Size" value={d.size.toString()} />
        {pvp && <StatCard label="Asset" value={shortAddr(d.asset)} />}
      </div>

      {/* Two-column parties */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
        <PartyCard
          role="Seller"
          addr={d.seller}
          attested={d.sellerAttested}
          done={d.sellerDone}
          pvp={pvp}
          chainId={effectiveChainId}
        />
        {hasBuyer
          ? <PartyCard role="Buyer" addr={d.buyer} attested={d.buyerAttested} done={d.buyerDone} pvp={pvp} chainId={effectiveChainId} />
          : (
            <div style={{ background: "var(--surface)", border: "1px dashed var(--border)", borderRadius: 12, padding: "1rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <p style={{ color: "var(--subtle)", fontSize: "0.85rem", margin: 0, textAlign: "center" }}>Waiting for buyer</p>
            </div>
          )
        }
      </div>

      {/* Actions */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-card)", padding: "1.25rem" }}>
        <p style={{ ...cap, marginBottom: "0.75rem" }}>Actions</p>
        <DealActions deal={deal} onRefresh={() => { refetch(); setRefreshKey((k) => k + 1); }} />
      </div>
    </Wrap>
  );
}

function Wrap({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "2rem 1.25rem 5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {children}
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div style={{ background: "var(--surface-muted)", borderRadius: 10, padding: "0.7rem 0.9rem" }}>
      <p style={cap}>{label}</p>
      <p className="tabular" style={{ fontSize: "0.9rem", fontWeight: 600, color: accent ?? "var(--ink-2)", margin: 0 }}>{value}</p>
    </div>
  );
}

function PartyCard({ role, addr, attested, done, pvp, chainId }: { role: string; addr: string; attested: boolean; done: boolean; pvp: boolean; chainId?: number }) {
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "1rem", display: "flex", flexDirection: "column", gap: 6 }}>
      <p style={cap}>{role}</p>
      <a className="mono" href={getExplorerAddress(addr, chainId)} target="_blank" rel="noopener noreferrer"
        style={{ fontSize: "0.78rem", color: "var(--muted)", textDecoration: "none", wordBreak: "break-all" }}>
        {shortAddr(addr)}
      </a>
      <div style={{ display: "flex", flexDirection: "column", gap: 3, marginTop: 4 }}>
        <StatusLine label="Attested" ok={attested} />
        {!pvp && <StatusLine label="Confirmed done" ok={done} />}
      </div>
    </div>
  );
}

function StatusLine({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: ok ? "var(--accent)" : "var(--border-strong)", flexShrink: 0 }} />
      <span style={{ fontSize: "0.75rem", color: ok ? "var(--ink-2)" : "var(--subtle)" }}>{ok ? label : `${label} pending`}</span>
    </div>
  );
}

const cap: React.CSSProperties = {
  fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em",
  textTransform: "uppercase", color: "var(--subtle)", margin: 0,
};
