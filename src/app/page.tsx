"use client";

import { useState } from "react";
import { useReadContract } from "wagmi";
import { CreateForm } from "@/components/CreateForm";
import { BondCard } from "@/components/BondCard";
import { OtcCreateForm } from "@/components/OtcCreateForm";
import { DealCard } from "@/components/DealCard";
import { useBonds } from "@/hooks/useBonds";
import { useDeals } from "@/hooks/useDeals";
import { activeChain } from "@/lib/arc";
import { FAZABOND_ABI, FAZABOND_ADDRESS } from "@/lib/contract";
import { FAZAOTC_ABI, FAZAOTC_ADDRESS } from "@/lib/otc-contract";

type Tab = "bond" | "otc";

export default function HomePage() {
  const [tab, setTab] = useState<Tab>("bond");
  const [composing, setComposing] = useState(false);
  const [bondSeed, setBondSeed] = useState(0);
  const [dealSeed, setDealSeed] = useState(0);

  const { data: bondCountRaw, refetch: refetchBondCount } = useReadContract({
    address: FAZABOND_ADDRESS || undefined, abi: FAZABOND_ABI,
    functionName: "bondCount", chainId: activeChain.id,
    query: { enabled: !!FAZABOND_ADDRESS, refetchInterval: 8000 },
  });
  const { data: dealCountRaw, refetch: refetchDealCount } = useReadContract({
    address: FAZAOTC_ADDRESS || undefined, abi: FAZAOTC_ABI,
    functionName: "dealCount", chainId: activeChain.id,
    query: { enabled: !!FAZAOTC_ADDRESS, refetchInterval: 8000 },
  });

  const bondCount = Number(bondCountRaw ?? 0n) + (bondSeed > 0 ? 0 : 0);
  const dealCount = Number(dealCountRaw ?? 0n) + (dealSeed > 0 ? 0 : 0);
  const { bonds, isLoading: bondsLoading, refetch: refetchBonds } = useBonds(bondCount);
  const { deals, isLoading: dealsLoading, refetch: refetchDeals } = useDeals(dealCount);

  const handleBondCreated = () => { setComposing(false); refetchBondCount(); refetchBonds(); setBondSeed(s => s + 1); };
  const handleDealCreated = () => { setComposing(false); refetchDealCount(); refetchDeals(); setDealSeed(s => s + 1); };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 1.25rem 5rem" }}>

      {/* Hero */}
      <div
        style={{
          position: "relative", textAlign: "center",
          padding: "4rem 1rem 3rem", overflow: "hidden",
        }}
      >
        {/* Radial glow */}
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%,-60%)",
          width: 600, height: 400,
          background: "radial-gradient(ellipse at center, rgba(18,52,90,0.55) 0%, transparent 70%)",
          pointerEvents: "none", zIndex: 0,
        }} />

        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
          <span style={{
            fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.18em",
            textTransform: "uppercase", color: "var(--accent)",
          }}>FAZA</span>

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

          {/* Stats row */}
          <div style={{
            display: "flex", gap: "0", marginTop: "1.5rem",
            border: "1px solid var(--border)", borderRadius: "var(--radius-card)",
            overflow: "hidden", background: "var(--surface)",
          }}>
            {[
              { n: "USDC", label: "Stake in" },
              { n: "Onchain", label: "Check in" },
              { n: "After deadline", label: "Settle" },
            ].map((s, i) => (
              <div key={i} style={{
                padding: "0.9rem 1.4rem", borderRight: i < 2 ? "1px solid var(--border)" : undefined,
                display: "flex", flexDirection: "column", gap: 2, flex: 1,
              }}>
                <span className="tabular" style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--ink)" }}>{s.n}</span>
                <span style={{ fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--subtle)" }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How it works */}
      <div style={{ marginBottom: "2.5rem" }}>
        <p style={sectionCap}>How it works</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))", gap: "0.65rem", marginTop: "0.75rem" }}>
          {[
            "Create a bond or OTC deal with a title, stake, and deadline.",
            "Second wallet joins and matches the stake.",
            "Both check in (bond) or attest + confirm done (OTC) before time runs out.",
            "Settle: refund both — or the one who showed takes the pot.",
          ].map((text, i) => (
            <div key={i} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "0.9rem 1rem", display: "flex", gap: "0.65rem" }}>
              <span style={{ fontSize: "0.8rem", fontWeight: 800, color: "var(--accent)", minWidth: 18 }}>{i + 1}</span>
              <p style={{ fontSize: "0.82rem", color: "var(--muted)", lineHeight: 1.5, margin: 0 }}>{text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem", alignItems: "center" }}>
        <div style={{ display: "flex", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 3, gap: 2 }}>
          {(["bond", "otc"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setComposing(false); }}
              style={{
                background: tab === t ? "var(--border-strong)" : "transparent",
                color: tab === t ? "var(--ink)" : "var(--muted)",
                border: "none", borderRadius: 8, padding: "0.35rem 0.9rem",
                fontSize: "0.82rem", fontWeight: 700, cursor: "pointer",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {t === "bond" ? "Show-up bonds" : "OTC deals"}
            </button>
          ))}
        </div>
        <div style={{ flex: 1 }} />
        <button
          onClick={() => setComposing(v => !v)}
          style={{
            background: "var(--accent)", color: "#050B14",
            border: "none", borderRadius: "var(--radius-btn)",
            padding: "0.45rem 1rem", fontSize: "0.82rem",
            fontFamily: "'Inter', sans-serif", fontWeight: 700, cursor: "pointer",
          }}
        >
          {composing ? "Cancel" : tab === "bond" ? "New bond" : "New deal"}
        </button>
      </div>

      {/* Compose panel */}
      {composing && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-card)", padding: "1.5rem", marginBottom: "1.25rem" }}>
          {tab === "bond"
            ? <CreateForm onCreated={handleBondCreated} />
            : <OtcCreateForm onCreated={handleDealCreated} />
          }
        </div>
      )}

      {/* Feed */}
      {tab === "bond" && (
        <FeedSection
          label={`Open bonds (${bonds.length})`}
          loading={bondsLoading}
          empty={!FAZABOND_ADDRESS ? "Contract not deployed." : "No bonds yet. Create the first one."}
          deployed={!!FAZABOND_ADDRESS}
        >
          {bonds.map((b) => <BondCard key={b.id} bond={b} />)}
        </FeedSection>
      )}

      {tab === "otc" && (
        <FeedSection
          label={`OTC deals (${deals.length})`}
          loading={dealsLoading}
          empty={!FAZAOTC_ADDRESS ? "OTC contract not deployed." : "No deals yet. Create the first one."}
          deployed={!!FAZAOTC_ADDRESS}
        >
          {deals.map((d) => <DealCard key={d.id} deal={d} />)}
        </FeedSection>
      )}

      {/* Footer */}
      <footer style={{
        marginTop: "4rem", paddingTop: "1.5rem",
        borderTop: "1px solid var(--border)",
        display: "flex", flexWrap: "wrap", gap: "1rem",
        justifyContent: "space-between", alignItems: "center",
      }}>
        <p style={{ fontSize: "0.75rem", color: "var(--subtle)", margin: 0 }}>
          Built on Arc · USDC gas
        </p>
        <div style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap" }}>
          {FAZABOND_ADDRESS && (
            <a
              className="mono"
              href={`https://explorer.testnet.arc.io/address/${FAZABOND_ADDRESS}`} // arc-studio-allow-onchain-literal
              target="_blank" rel="noopener noreferrer"
              style={{ fontSize: "0.7rem", color: "var(--subtle)", textDecoration: "none" }}
            >
              Bond: {FAZABOND_ADDRESS.slice(0, 10)}…
            </a>
          )}
          {FAZAOTC_ADDRESS && (
            <a
              className="mono"
              href={`https://explorer.testnet.arc.io/address/${FAZAOTC_ADDRESS}`} // arc-studio-allow-onchain-literal
              target="_blank" rel="noopener noreferrer"
              style={{ fontSize: "0.7rem", color: "var(--subtle)", textDecoration: "none" }}
            >
              OTC: {FAZAOTC_ADDRESS.slice(0, 10)}…
            </a>
          )}
        </div>
      </footer>
    </div>
  );
}

function FeedSection({ label, loading, empty, deployed, children }: {
  label: string; loading: boolean; empty: string; deployed: boolean; children: React.ReactNode;
}) {
  return (
    <section style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <p style={sectionCap}>{label}</p>
      {!deployed && <p style={{ fontSize: "0.85rem", color: "var(--subtle)" }}>{empty}</p>}
      {deployed && loading && <p style={{ fontSize: "0.85rem", color: "var(--subtle)" }}>Loading…</p>}
      {deployed && !loading && !React.Children.count(children) && (
        <div style={{
          background: "var(--surface)", border: "1px dashed var(--border)",
          borderRadius: "var(--radius-card)", padding: "2.5rem 1.5rem",
          textAlign: "center", color: "var(--subtle)", fontSize: "0.9rem",
        }}>
          {empty}
        </div>
      )}
      {children}
    </section>
  );
}

import React from "react";

const sectionCap: React.CSSProperties = {
  fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em",
  textTransform: "uppercase", color: "var(--subtle)", margin: 0,
};
