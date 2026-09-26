"use client";

import { useState, useMemo } from "react";
import { useReadContract, useAccount } from "wagmi";
import { CreateForm } from "@/components/CreateForm";
import { BondCard } from "@/components/BondCard";
import { OtcCreateForm } from "@/components/OtcCreateForm";
import { DealCard } from "@/components/DealCard";
import { useBonds } from "@/hooks/useBonds";
import { useDeals } from "@/hooks/useDeals";
import {
  getChain, getExplorerAddress, isSupportedChain, arcMainnet,
} from "@/lib/arc";
import { FAZABOND_ABI, FAZABOND_ADDRESS, getFazaBondAddress } from "@/lib/contract";
import { FAZAOTC_ABI, FAZAOTC_ADDRESS, getFazaOtcAddress } from "@/lib/otc-contract";
import { JudgeGuide } from "@/components/JudgeGuide";

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

export default function HomePage() {
  const { address, chainId } = useAccount();
  const onArc = isSupportedChain(chainId);
  const chain = getChain(chainId);
  const isMainnet = chainId === arcMainnet.id;

  const [tab, setTab] = useState<Tab>("bond");
  const [composing, setComposing] = useState(false);
  const [bondFilter, setBondFilter] = useState<FilterBond>("all");
  const [dealFilter, setDealFilter] = useState<FilterDeal>("all");
  const [search, setSearch] = useState("");
  const [bondSeed, setBondSeed] = useState(0);
  const [dealSeed, setDealSeed] = useState(0);

  const bondContractAddr = getFazaBondAddress(chainId) ?? FAZABOND_ADDRESS;
  const otcContractAddr = getFazaOtcAddress(chainId) ?? FAZAOTC_ADDRESS;

  const { data: bondCountRaw, refetch: refetchBondCount } = useReadContract({
    address: bondContractAddr || undefined, abi: FAZABOND_ABI,
    functionName: "bondCount", chainId: chainId ?? undefined,
    query: { enabled: !!bondContractAddr, refetchInterval: 8000 },
  });
  const { data: dealCountRaw, refetch: refetchDealCount } = useReadContract({
    address: otcContractAddr || undefined, abi: FAZAOTC_ABI,
    functionName: "dealCount", chainId: chainId ?? undefined,
    query: { enabled: !!otcContractAddr, refetchInterval: 8000 },
  });

  const bondCount = Number(bondCountRaw ?? 0n) + (bondSeed > 0 ? 0 : 0);
  const dealCount = Number(dealCountRaw ?? 0n) + (dealSeed > 0 ? 0 : 0);
  const { bonds, isLoading: bondsLoading, refetch: refetchBonds } = useBonds(bondCount, chainId);
  const { deals, isLoading: dealsLoading, refetch: refetchDeals } = useDeals(dealCount, chainId);

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

  const explorerBond = bondContractAddr ? getExplorerAddress(bondContractAddr, chainId) : null;
  const explorerOtc = otcContractAddr ? getExplorerAddress(otcContractAddr, chainId) : null;
  const chainLabel = chain ? chain.name : "Arc";
  const mainnetBondMissing = isMainnet && !getFazaBondAddress(5042);
  const mainnetOtcMissing = isMainnet && !getFazaOtcAddress(5042);

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 1.25rem 5rem" }}>

      {/* Protocol Quick Guide */}
      <div style={{ paddingTop: "1.25rem" }}>
        <JudgeGuide />
      </div>

      {/* Mainnet deploy banner */}
      {isMainnet && (mainnetBondMissing || mainnetOtcMissing) && (
        <div style={{
          background: "rgba(245,166,35,0.08)", border: "1px solid rgba(245,166,35,0.3)",
          borderRadius: 10, padding: "0.85rem 1.1rem", marginTop: "5rem", marginBottom: "1rem",
        }}>
          <p style={{ fontSize: "0.85rem", color: "var(--amber)", fontWeight: 600, margin: 0 }}>
            Arc Mainnet — contracts not yet deployed.
          </p>
          <p style={{ fontSize: "0.78rem", color: "var(--muted)", marginTop: 4, marginBottom: 0 }}>
            Follow <code style={{ background: "var(--surface-muted)", padding: "1px 5px", borderRadius: 4 }}>MAINNET.md</code> to deploy FazaBond and FazaOTC to chain ID 5042, then set <code style={{ background: "var(--surface-muted)", padding: "1px 5px", borderRadius: 4 }}>NEXT_PUBLIC_MAINNET_FAZABOND_ADDRESS</code> and <code style={{ background: "var(--surface-muted)", padding: "1px 5px", borderRadius: 4 }}>NEXT_PUBLIC_MAINNET_FAZAOTC_ADDRESS</code> in Vercel.
          </p>
        </div>
      )}

      {/* Hero */}
      <div style={{
        position: "relative", textAlign: "center",
        padding: isMainnet && (mainnetBondMissing || mainnetOtcMissing) ? "2.5rem 1rem 3rem" : "4rem 1rem 3rem",
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
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", alignItems: "center", flexWrap: "wrap" }}>
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
            outline: "none", width: 140,
          }}
        />

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

      {/* Filter pills */}
      <div style={{ display: "flex", gap: "0.4rem", marginBottom: "1.1rem", flexWrap: "wrap" }}>
        {tab === "bond" ? (
          (["all", "mine", "open", "ready"] as FilterBond[]).map((f) => (
            <button key={f} onClick={() => setBondFilter(f)}
              style={{
                background: bondFilter === f ? "var(--accent)" : "var(--surface)",
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
                background: dealFilter === f ? "var(--accent)" : "var(--surface)",
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
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-card)", padding: "1.5rem", marginBottom: "1.25rem",
        }}>
          {tab === "bond"
            ? <CreateForm onCreated={handleBondCreated} />
            : <OtcCreateForm onCreated={handleDealCreated} />}
        </div>
      )}

      {/* Feed */}
      {tab === "bond" && (
        <FeedSection
          label={`Bonds${filteredBonds.length !== bonds.length ? ` (${filteredBonds.length} of ${bonds.length})` : ` (${bonds.length})`}`}
          loading={bondsLoading}
          empty={!bondContractAddr ? "Contract not deployed." : "No bonds yet. Create the first one."}
          deployed={!!bondContractAddr}
        >
          {filteredBonds.map((b) => <BondCard key={b.id} bond={b} />)}
        </FeedSection>
      )}

      {tab === "otc" && (
        <FeedSection
          label={`OTC deals${filteredDeals.length !== deals.length ? ` (${filteredDeals.length} of ${deals.length})` : ` (${deals.length})`}`}
          loading={dealsLoading}
          empty={!otcContractAddr ? "OTC contract not deployed." : "No deals yet. Create the first one."}
          deployed={!!otcContractAddr}
        >
          {filteredDeals.map((d) => <DealCard key={d.id} deal={d} />)}
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
          Built on {chainLabel} · USDC gas
        </p>
        <div style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap" }}>
          {explorerBond && (
            <a href={explorerBond} target="_blank" rel="noopener noreferrer"
              className="mono"
              style={{ fontSize: "0.72rem", color: "var(--subtle)", textDecoration: "none" }}>
              FazaBond {bondContractAddr.slice(0, 10)}…
            </a>
          )}
          {explorerOtc && (
            <a href={explorerOtc} target="_blank" rel="noopener noreferrer"
              className="mono"
              style={{ fontSize: "0.72rem", color: "var(--subtle)", textDecoration: "none" }}>
              FazaOTC {otcContractAddr.slice(0, 10)}…
            </a>
          )}
        </div>
      </footer>
    </div>
  );
}
