"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useReadContract } from "wagmi";
import { formatUsdc, formatDeadline, shortAddr, getExplorerAddress } from "@/lib/arc";
import { useAccount } from "wagmi";
import { FAZAOTC_ABI, FAZAOTC_ADDRESS, getFazaOtcAddress, DEAL_STATES, isPvp, type DealSummary } from "@/lib/otc-contract";
import { DealActions } from "@/components/DealActions";

const ZERO = "0x0000000000000000000000000000000000000000";

export default function OtcPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const dealId = parseInt(id, 10);
  const [refreshKey, setRefreshKey] = useState(0);
  const [copied, setCopied] = useState(false);
  const { chainId } = useAccount();
  const contractAddr = getFazaOtcAddress(chainId) ?? FAZAOTC_ADDRESS;

  const { data: raw, refetch } = useReadContract({
    address: contractAddr || undefined,
    abi: FAZAOTC_ABI, functionName: "getDeal",
    args: [BigInt(isNaN(dealId) ? 0 : dealId)],
    chainId: chainId ?? undefined,
    query: { enabled: !!contractAddr && !isNaN(dealId), refetchInterval: 6000 },
  });

  useEffect(() => { if (refreshKey > 0) refetch(); }, [refreshKey, refetch]);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (isNaN(dealId)) return <Wrap><p style={{ color: "var(--subtle)" }}>Invalid deal ID.</p></Wrap>;

  const d = raw as {
    seller: `0x${string}`; buyer: `0x${string}`; termsHash: `0x${string}`;
    asset: `0x${string}`; size: bigint; priceUsdc: bigint; stake: bigint; deadline: bigint;
    sellerAttested: boolean; buyerAttested: boolean;
    sellerDone: boolean; buyerDone: boolean;
    settled: boolean; state: number;
  } | undefined;

  if (!contractAddr) return <Wrap><p style={{ color: "var(--subtle)" }}>Contract not deployed.</p></Wrap>;
  if (!d || d.seller === ZERO) return <Wrap><p style={{ color: "var(--subtle)" }}>Deal #{dealId} not found.</p></Wrap>;

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

  return (
    <Wrap>
      <Link href="/" style={{ fontSize: "0.8rem", color: "var(--muted)", textDecoration: "none" }}>← All deals</Link>

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

      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <h1 className="display" style={{ fontSize: "clamp(1.4rem,4vw,1.9rem)", fontWeight: 700, color: "var(--ink)", letterSpacing: "-0.03em", margin: 0 }}>
          Deal #{dealId}
        </h1>
        <button onClick={handleCopy} style={{
          background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6,
          padding: "2px 8px", fontSize: "0.72rem", color: "var(--muted)",
          cursor: "pointer", fontFamily: "'Inter', sans-serif",
        }}>
          {copied ? "Copied!" : "Copy link"}
        </button>
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
          chainId={chainId}
        />
        {hasBuyer
          ? <PartyCard role="Buyer" addr={d.buyer} attested={d.buyerAttested} done={d.buyerDone} pvp={pvp} chainId={chainId} />
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
