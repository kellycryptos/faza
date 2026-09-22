"use client";

import { useState } from "react";
import { useReadContract } from "wagmi";
import Link from "next/link";
import { CreateForm } from "@/components/CreateForm";
import { BondCard } from "@/components/BondCard";
import { useBonds } from "@/hooks/useBonds";
import { activeChain, explorerAddress } from "@/lib/arc";
import { FAZABOND_ABI, FAZABOND_ADDRESS } from "@/lib/contract";

export default function HomePage() {
  const [composing, setComposing] = useState(false);
  const [refreshSeed, setRefreshSeed] = useState(0);

  const { data: bondCount, refetch: refetchCount } = useReadContract({
    address: FAZABOND_ADDRESS || undefined,
    abi: FAZABOND_ABI,
    functionName: "bondCount",
    chainId: activeChain.id,
    query: { enabled: !!FAZABOND_ADDRESS, refetchInterval: 8000 },
  });

  const count = Number(bondCount ?? 0n);
  const { bonds, isLoading, refetch } = useBonds(count + (refreshSeed > 0 ? 0 : 0));

  const handleCreated = () => {
    setComposing(false);
    refetchCount();
    refetch();
    setRefreshSeed((s) => s + 1);
  };

  return (
    <>
      {/* Hero — with radial glow */}
      <section
        style={{
          position: "relative",
          overflow: "hidden",
          padding: "5rem 1.25rem 4rem",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1.5rem",
        }}
      >
        {/* Deep-blue radial glow */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: "-40%",
            left: "50%",
            transform: "translateX(-50%)",
            width: 800,
            height: 500,
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse at center, rgba(30,60,120,0.28) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* Eyebrow */}
        <span
          style={{
            fontSize: "0.72rem",
            fontWeight: 700,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--accent)",
          }}
        >
          Faza
        </span>

        {/* H1 */}
        <h1
          className="display"
          style={{
            fontSize: "clamp(2.25rem, 6vw, 3.75rem)",
            fontWeight: 900,
            color: "var(--ink)",
            maxWidth: "16ch",
            margin: 0,
          }}
        >
          Show up,<br />or forfeit the stake.
        </h1>

        {/* Sub */}
        <p
          style={{
            fontSize: "clamp(1rem, 2vw, 1.15rem)",
            color: "var(--muted)",
            maxWidth: "48ch",
            lineHeight: 1.65,
          }}
        >
          Two wallets lock USDC on Arc. Both check in before the deadline and the
          stake returns. One ghosts and the other takes both.
        </p>

        {/* CTA row */}
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}>
          <button
            onClick={() => { setComposing(true); document.getElementById("open-fazas")?.scrollIntoView({ behavior: "smooth" }); }}
            style={primaryBtn}
          >
            New bond
          </button>
          <Link href="/about" style={{ ...secondaryBtn, display: "inline-flex", alignItems: "center" }}>
            How it works
          </Link>
        </div>

        {/* Stats row */}
        <div
          style={{
            display: "flex",
            gap: "0",
            flexWrap: "wrap",
            justifyContent: "center",
            borderRadius: "var(--radius-card)",
            border: "1px solid var(--border)",
            background: "var(--surface)",
            overflow: "hidden",
            marginTop: "0.5rem",
            width: "100%",
            maxWidth: 480,
          }}
        >
          {[
            { label: "Stake in USDC", desc: "$0.01 – $100" },
            { label: "Check in onchain", desc: "Real tx, not a click" },
            { label: "Settle after deadline", desc: "Winner takes the pot" },
          ].map((s, i, arr) => (
            <div
              key={s.label}
              style={{
                flex: "1 1 140px",
                padding: "1.1rem 1rem",
                textAlign: "center",
                borderRight: i < arr.length - 1 ? "1px solid var(--border)" : "none",
              }}
            >
              <div
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--accent)",
                }}
              >
                {s.label}
              </div>
              <div style={{ fontSize: "0.82rem", color: "var(--muted)", marginTop: 3 }}>
                {s.desc}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section
        style={{
          maxWidth: 760,
          margin: "0 auto",
          padding: "0 1.25rem 3.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.25rem",
        }}
      >
        <h2 style={sectionLabel}>How it works</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "1px",
            background: "var(--border)",
            borderRadius: "var(--radius-card)",
            overflow: "hidden",
            border: "1px solid var(--border)",
          }}
        >
          {[
            { n: "1", text: "Create a Faza with a title, stake, and deadline" },
            { n: "2", text: "Second wallet joins and matches the stake" },
            { n: "3", text: "Both check in before time runs out" },
            { n: "4", text: "Settle: refund both, or the one who showed takes the pot" },
          ].map((step) => (
            <div
              key={step.n}
              style={{
                background: "var(--surface)",
                padding: "1.25rem 1.1rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.6rem",
              }}
            >
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: "1.5rem",
                  fontWeight: 800,
                  color: "var(--border-strong)",
                  lineHeight: 1,
                }}
              >
                {step.n}
              </span>
              <p style={{ fontSize: "0.88rem", color: "var(--ink-2)", lineHeight: 1.5 }}>
                {step.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Open Fazas */}
      <section
        id="open-fazas"
        style={{
          maxWidth: 760,
          margin: "0 auto",
          padding: "0 1.25rem 2rem",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={sectionLabel}>Open Fazas</h2>
          <button
            onClick={() => setComposing((v) => !v)}
            style={{
              ...secondaryBtn,
              padding: "0.35rem 0.85rem",
              fontSize: "0.78rem",
            }}
          >
            {composing ? "Cancel" : "+ New bond"}
          </button>
        </div>

        {/* Create form */}
        {composing && (
          <div style={cardShell}>
            <CreateForm onCreated={handleCreated} />
          </div>
        )}

        {!FAZABOND_ADDRESS && (
          <div style={{ ...cardShell, color: "var(--subtle)", fontSize: "0.85rem" }}>
            Contract not yet deployed — set{" "}
            <code style={{ fontFamily: "monospace", color: "var(--muted)" }}>NEXT_PUBLIC_FAZABOND_ADDRESS</code> in .env.
          </div>
        )}

        {FAZABOND_ADDRESS && isLoading && (
          <div style={{ padding: "2rem 0", textAlign: "center", color: "var(--subtle)", fontSize: "0.9rem" }}>
            Loading bonds…
          </div>
        )}

        {FAZABOND_ADDRESS && !isLoading && bonds.length === 0 && (
          <div
            style={{
              border: "1px dashed var(--border)",
              borderRadius: "var(--radius-card)",
              padding: "3rem 1.5rem",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <p style={{ color: "var(--muted)", fontSize: "0.95rem" }}>
              No bonds yet. Create the first one.
            </p>
            <button onClick={() => setComposing(true)} style={primaryBtn}>
              New bond
            </button>
          </div>
        )}

        {bonds.map((b) => (
          <BondCard key={b.id} bond={b} />
        ))}
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid var(--border)",
          padding: "1.5rem 1.25rem",
          display: "flex",
          flexWrap: "wrap",
          gap: "0.75rem",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "0.75rem",
          color: "var(--subtle)",
        }}
      >
        {FAZABOND_ADDRESS ? (
          <a
            href={explorerAddress(FAZABOND_ADDRESS)}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--accent)", fontFamily: "monospace", fontSize: "0.72rem" }}
          >
            {FAZABOND_ADDRESS.slice(0, 10)}…{FAZABOND_ADDRESS.slice(-6)}
          </a>
        ) : (
          <span>Contract not deployed</span>
        )}
        <span style={{ color: "var(--border-strong)" }}>·</span>
        <span>Built on Arc</span>
        <span style={{ color: "var(--border-strong)" }}>·</span>
        <span>USDC gas</span>
      </footer>
    </>
  );
}

const sectionLabel: React.CSSProperties = {
  fontSize: "0.72rem",
  fontWeight: 700,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "var(--subtle)",
  margin: 0,
};

const primaryBtn: React.CSSProperties = {
  background: "var(--accent)",
  color: "#050B14",
  border: "none",
  borderRadius: "var(--radius-btn)",
  padding: "0.7rem 1.5rem",
  fontSize: "0.9rem",
  fontFamily: "'Inter', sans-serif",
  fontWeight: 700,
  cursor: "pointer",
  letterSpacing: "-0.01em",
};

const secondaryBtn: React.CSSProperties = {
  background: "var(--surface)",
  color: "var(--ink-2)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-btn)",
  padding: "0.7rem 1.25rem",
  fontSize: "0.9rem",
  fontFamily: "'Inter', sans-serif",
  fontWeight: 600,
  cursor: "pointer",
  textDecoration: "none",
};

const cardShell: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-card)",
  padding: "1.5rem",
};
