"use client";

import Link from "next/link";
import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
} from "wagmi";
import { useEffect } from "react";
import { formatUsdc, shortAddr } from "@/lib/arc";
import { FAZABOND_ABI } from "@/lib/contract";
import { FAZAOTC_ABI } from "@/lib/otc-contract";
import type { BondSummary } from "@/components/BondCard";
import type { DealSummary } from "@/lib/otc-contract";

const ZERO = "0x0000000000000000000000000000000000000000";

// ─── Bond helpers ────────────────────────────────────────────────────────────

function bondRole(bond: BondSummary, address: string): "creator" | "joiner" | null {
  if (bond.creator.toLowerCase() === address.toLowerCase()) return "creator";
  if (bond.joiner && bond.joiner !== ZERO && bond.joiner.toLowerCase() === address.toLowerCase()) return "joiner";
  return null;
}

function bondNeedsAction(bond: BondSummary, address: string, now: number): boolean {
  const role = bondRole(bond, address);
  if (!role || bond.settled) return false;
  const hasJoiner = bond.joiner && bond.joiner !== ZERO;
  if (!hasJoiner || now >= bond.deadline) return false;
  return (role === "creator" && !bond.creatorIn) || (role === "joiner" && !bond.joinerIn);
}

function bondStatusLabel(bond: BondSummary, now: number): string {
  const noJoiner = !bond.joiner || bond.joiner === ZERO;
  if (bond.settled) return "Settled";
  if (noJoiner && now >= bond.deadline) return "Expired";
  if (noJoiner) return "Open — waiting for joiner";
  if (now >= bond.deadline) return "Ready to settle";
  return "Live";
}

function bondStatusColor(label: string): string {
  if (label === "Settled") return "var(--subtle)";
  if (label === "Expired") return "var(--danger)";
  if (label === "Ready to settle") return "var(--amber)";
  if (label === "Live") return "var(--accent)";
  return "var(--muted)";
}

// ─── Deal helpers ────────────────────────────────────────────────────────────

function dealRole(deal: DealSummary, address: string): "seller" | "buyer" | null {
  if (deal.seller.toLowerCase() === address.toLowerCase()) return "seller";
  if (deal.buyer && deal.buyer !== ZERO && deal.buyer.toLowerCase() === address.toLowerCase()) return "buyer";
  return null;
}

function dealNeedsAction(deal: DealSummary, address: string, now: number): boolean {
  const role = dealRole(deal, address);
  if (!role || deal.settled) return false;
  const hasBuyer = deal.buyer && deal.buyer !== ZERO;
  if (!hasBuyer || now >= deal.deadline) return false;
  return (role === "seller" && !deal.sellerDone) || (role === "buyer" && !deal.buyerDone);
}

function dealStatusLabel(deal: DealSummary, now: number): string {
  const noBuyer = !deal.buyer || deal.buyer === ZERO;
  if (deal.settled) return "Settled";
  if (noBuyer && now >= deal.deadline) return "Expired";
  if (noBuyer) return "Open — waiting for buyer";
  if (now >= deal.deadline) return "Ready to settle";
  return "Live";
}

// ─── ClaimRow ────────────────────────────────────────────────────────────────

function ClaimRow({
  bondContractAddr,
  otcContractAddr,
  chainId,
}: {
  bondContractAddr?: `0x${string}`;
  otcContractAddr?: `0x${string}`;
  chainId: number;
}) {
  const { address } = useAccount();

  const { data: bondClaimable, refetch: refetchBond } = useReadContract({
    address: bondContractAddr,
    abi: FAZABOND_ABI,
    functionName: "claimable",
    args: address ? [address] : undefined,
    chainId,
    query: { enabled: !!address && !!bondContractAddr, refetchInterval: 8000 },
  });

  const { data: otcClaimable, refetch: refetchOtc } = useReadContract({
    address: otcContractAddr,
    abi: FAZAOTC_ABI,
    functionName: "claimable",
    args: address ? [address] : undefined,
    chainId,
    query: { enabled: !!address && !!otcContractAddr, refetchInterval: 8000 },
  });

  const bondAmt = (bondClaimable as bigint) ?? 0n;
  const otcAmt = (otcClaimable as bigint) ?? 0n;
  const total = bondAmt + otcAmt;

  const { writeContract: writeBondClaim, data: bondTxHash, isPending: bondPending } = useWriteContract();
  const { isLoading: bondWaiting, isSuccess: bondSuccess } = useWaitForTransactionReceipt({ hash: bondTxHash });
  const { writeContract: writeOtcClaim, data: otcTxHash, isPending: otcPending } = useWriteContract();
  const { isLoading: otcWaiting, isSuccess: otcSuccess } = useWaitForTransactionReceipt({ hash: otcTxHash });

  useEffect(() => { if (bondSuccess) refetchBond(); }, [bondSuccess, refetchBond]);
  useEffect(() => { if (otcSuccess) refetchOtc(); }, [otcSuccess, refetchOtc]);

  if (!address || total <= 0n) return null;

  return (
    <div
      style={{
        marginTop: "1rem",
        background: "linear-gradient(135deg, rgba(46,230,166,0.12) 0%, rgba(20,32,48,0.6) 100%)",
        border: "1px solid rgba(46,230,166,0.4)",
        borderRadius: "var(--radius-card)",
        padding: "0.85rem 1rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "0.75rem",
      }}
    >
      <div>
        <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--accent)" }}>
          <span>🎁 Unclaimed funds: </span>
          <span translate="no" className="notranslate">{formatUsdc(total)}</span>
        </div>
        <div style={{ fontSize: "0.72rem", color: "var(--muted)", marginTop: 2 }}>
          Settled stakes or refunds waiting in contract escrow
        </div>
      </div>
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        {bondAmt > 0n && bondContractAddr && (
          <button
            onClick={() => writeBondClaim({ address: bondContractAddr, abi: FAZABOND_ABI, functionName: "claim", chainId })}
            disabled={bondPending || bondWaiting}
            style={{
              background: "var(--accent)", color: "#050B14", border: "none",
              borderRadius: "var(--radius-btn)", padding: "0.4rem 0.9rem",
              fontSize: "0.78rem", fontWeight: 700, cursor: bondPending || bondWaiting ? "not-allowed" : "pointer",
              opacity: bondPending || bondWaiting ? 0.6 : 1,
            }}
          >
            {bondPending || bondWaiting ? "Claiming…" : (
              <>
                <span>Claim bond </span>
                <span translate="no" className="notranslate">{formatUsdc(bondAmt)}</span>
              </>
            )}
          </button>
        )}
        {otcAmt > 0n && otcContractAddr && (
          <button
            onClick={() => writeOtcClaim({ address: otcContractAddr, abi: FAZAOTC_ABI, functionName: "claim", chainId })}
            disabled={otcPending || otcWaiting}
            style={{
              background: "var(--accent)", color: "#050B14", border: "none",
              borderRadius: "var(--radius-btn)", padding: "0.4rem 0.9rem",
              fontSize: "0.78rem", fontWeight: 700, cursor: otcPending || otcWaiting ? "not-allowed" : "pointer",
              opacity: otcPending || otcWaiting ? 0.6 : 1,
            }}
          >
            {otcPending || otcWaiting ? "Claiming…" : (
              <>
                <span>Claim OTC </span>
                <span translate="no" className="notranslate">{formatUsdc(otcAmt)}</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── BondRow ────────────────────────────────────────────────────────────────

function BondRow({ bond, address, now }: { bond: BondSummary; address: string; now: number }) {
  const needs = bondNeedsAction(bond, address, now);
  const status = bondStatusLabel(bond, now);
  const color = bondStatusColor(status);

  return (
    <Link
      href={`/faza/${bond.id}`}
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0.65rem 0.9rem",
        background: needs ? "rgba(245,166,35,0.05)" : "var(--surface)",
        border: needs ? "1px solid rgba(245,166,35,0.3)" : "1px solid var(--border)",
        borderRadius: "var(--radius-card)",
        textDecoration: "none",
        gap: "0.75rem",
        flexWrap: "wrap",
        cursor: "pointer",
      }}
    >
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{
          fontSize: "0.85rem", fontWeight: 700, color: "var(--ink)",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {bond.title || `Bond #${bond.id}`}
          {needs && (
            <span style={{
              marginLeft: 8,
              fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.06em",
              textTransform: "uppercase",
              background: "rgba(245,166,35,0.18)",
              border: "1px solid var(--amber)",
              color: "var(--amber)",
              borderRadius: "var(--radius-pill)",
              padding: "1px 7px",
              verticalAlign: "middle",
            }}>
              ⚠ Action needed
            </span>
          )}
        </div>
        <div style={{ fontSize: "0.72rem", color: "var(--muted)", marginTop: 3 }}>
          <span translate="no" className="notranslate">#{bond.id}</span>
          <span> · </span>
          <span translate="no" className="notranslate">{formatUsdc(bond.stake)}</span>
          <span> each · Bond </span>
          <span translate="no" className="notranslate">#{bond.id}</span>
        </div>
      </div>
      <span style={{
        fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.06em",
        textTransform: "uppercase", color, whiteSpace: "nowrap",
        padding: "2px 9px",
        background: `${color}18`,
        border: `1px solid ${color}44`,
        borderRadius: "var(--radius-pill)",
      }}>
        {status}
      </span>
    </Link>
  );
}

// ─── DealRow ────────────────────────────────────────────────────────────────

function DealRow({ deal, address, now }: { deal: DealSummary; address: string; now: number }) {
  const needs = dealNeedsAction(deal, address, now);
  const status = dealStatusLabel(deal, now);
  const color = bondStatusColor(status); // same color mapping

  return (
    <Link
      href={`/otc/${deal.id}`}
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0.65rem 0.9rem",
        background: needs ? "rgba(245,166,35,0.05)" : "var(--surface)",
        border: needs ? "1px solid rgba(245,166,35,0.3)" : "1px solid var(--border)",
        borderRadius: "var(--radius-card)",
        textDecoration: "none",
        gap: "0.75rem",
        flexWrap: "wrap",
      }}
    >
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{
          fontSize: "0.85rem", fontWeight: 700, color: "var(--ink)",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          OTC Deal #{deal.id}
          {needs && (
            <span style={{
              marginLeft: 8,
              fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.06em",
              textTransform: "uppercase",
              background: "rgba(245,166,35,0.18)",
              border: "1px solid var(--amber)",
              color: "var(--amber)",
              borderRadius: "var(--radius-pill)",
              padding: "1px 7px",
              verticalAlign: "middle",
            }}>
              ⚠ Action needed
            </span>
          )}
        </div>
        <div style={{ fontSize: "0.72rem", color: "var(--muted)", marginTop: 3 }}>
          <span translate="no" className="notranslate">#{deal.id}</span>
          <span> · </span>
          <span translate="no" className="notranslate">{formatUsdc(deal.priceUsdc)}</span>
          <span> price · stake </span>
          <span translate="no" className="notranslate">{formatUsdc(deal.stake)}</span>
          <span> · seller </span>
          <span translate="no" className="notranslate mono">{shortAddr(deal.seller)}</span>
        </div>
      </div>
      <span style={{
        fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.06em",
        textTransform: "uppercase", color, whiteSpace: "nowrap",
        padding: "2px 9px",
        background: `${color}18`,
        border: `1px solid ${color}44`,
        borderRadius: "var(--radius-pill)",
      }}>
        {status}
      </span>
    </Link>
  );
}

// ─── Section header ──────────────────────────────────────────────────────────

function SectionHeader({ label, count }: { label: string; count: number }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "0.5rem",
      marginBottom: "0.5rem", marginTop: "1rem",
    }}>
      <p style={{
        fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.1em",
        textTransform: "uppercase", color: "var(--subtle)", margin: 0,
      }}>
        {label}
      </p>
      <span style={{
        fontSize: "0.6rem", fontWeight: 700, background: "var(--surface)",
        border: "1px solid var(--border)", borderRadius: 999,
        padding: "1px 6px", color: "var(--muted)",
      }}>
        {count}
      </span>
    </div>
  );
}

// ─── MyActivityDashboard ─────────────────────────────────────────────────────

interface Props {
  bonds: BondSummary[];
  deals: DealSummary[];
  bondContractAddr?: `0x${string}`;
  otcContractAddr?: `0x${string}`;
  chainId: number;
  mode: "bonds" | "deals";
}

export function MyActivityDashboard({
  bonds,
  deals,
  bondContractAddr,
  otcContractAddr,
  chainId,
  mode,
}: Props) {
  const { address } = useAccount();
  const now = Math.floor(Date.now() / 1000);

  if (!address) {
    return (
      <div style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-card)",
        padding: "2rem",
        textAlign: "center",
        marginBottom: "1rem",
      }}>
        <p style={{ color: "var(--muted)", fontSize: "0.9rem", margin: 0 }}>
          Connect your wallet to see your {mode === "bonds" ? "bonds" : "deals"}, pending actions, and claimable funds.
        </p>
      </div>
    );
  }

  if (mode === "bonds") {
    const myBonds = bonds.filter((b) => bondRole(b, address) !== null);

    const actionNeeded = myBonds.filter((b) => bondNeedsAction(b, address, now));
    const active = myBonds.filter((b) => {
      const hasJoiner = b.joiner && b.joiner !== ZERO;
      return !b.settled && hasJoiner && now < b.deadline && !bondNeedsAction(b, address, now);
    });
    const openWaiting = myBonds.filter((b) => {
      const noJoiner = !b.joiner || b.joiner === ZERO;
      return !b.settled && noJoiner && now < b.deadline;
    });
    const readyToSettle = myBonds.filter((b) => {
      const hasJoiner = b.joiner && b.joiner !== ZERO;
      return !b.settled && hasJoiner && now >= b.deadline;
    });
    const history = myBonds.filter((b) => {
      const noJoiner = !b.joiner || b.joiner === ZERO;
      return b.settled || (noJoiner && now >= b.deadline);
    });

    return (
      <div style={{ marginBottom: "1rem" }}>
        {/* Dashboard header */}
        <div style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-card)",
          padding: "0.85rem 1rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "0.5rem",
        }}>
          <div>
            <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--ink)" }}>
              My Bonds
            </span>
            <span translate="no" className="notranslate" style={{ fontSize: "0.72rem", color: "var(--muted)", marginLeft: 8 }}>
              {shortAddr(address)}
            </span>
            <div style={{ fontSize: "0.72rem", color: "var(--muted)", marginTop: 2 }}>
              {myBonds.length} bond{myBonds.length !== 1 ? "s" : ""} · {actionNeeded.length} action needed · {readyToSettle.length} ready to settle
            </div>
          </div>
          {actionNeeded.length > 0 ? (
            <span style={{
              background: "rgba(245,166,35,0.15)", border: "1px solid rgba(245,166,35,0.4)",
              color: "var(--amber)", borderRadius: "var(--radius-pill)", padding: "4px 12px",
              fontSize: "0.74rem", fontWeight: 700,
            }}>
              ⚠️ {actionNeeded.length} check-in{actionNeeded.length > 1 ? "s" : ""} required
            </span>
          ) : readyToSettle.length > 0 ? (
            <span style={{
              background: "rgba(245,166,35,0.12)", border: "1px solid rgba(245,166,35,0.3)",
              color: "var(--amber)", borderRadius: "var(--radius-pill)", padding: "4px 12px",
              fontSize: "0.74rem", fontWeight: 700,
            }}>
              🕐 {readyToSettle.length} ready to settle
            </span>
          ) : (
            <span style={{
              background: "rgba(46,230,166,0.1)", border: "1px solid rgba(46,230,166,0.25)",
              color: "var(--accent)", borderRadius: "var(--radius-pill)", padding: "4px 12px",
              fontSize: "0.74rem", fontWeight: 700,
            }}>
              ✓ All up to date
            </span>
          )}
        </div>

        {/* Claimable */}
        <ClaimRow bondContractAddr={bondContractAddr} otcContractAddr={undefined} chainId={chainId} />

        {/* Action Required */}
        {actionNeeded.length > 0 && (
          <>
            <SectionHeader label="Action Required" count={actionNeeded.length} />
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {actionNeeded.map((b) => <BondRow key={b.id} bond={b} address={address} now={now} />)}
            </div>
          </>
        )}

        {/* Ready to Settle */}
        {readyToSettle.length > 0 && (
          <>
            <SectionHeader label="Ready to Settle" count={readyToSettle.length} />
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {readyToSettle.map((b) => <BondRow key={b.id} bond={b} address={address} now={now} />)}
            </div>
          </>
        )}

        {/* Active / Live */}
        {active.length > 0 && (
          <>
            <SectionHeader label="Active" count={active.length} />
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {active.map((b) => <BondRow key={b.id} bond={b} address={address} now={now} />)}
            </div>
          </>
        )}

        {/* Open — waiting for joiner */}
        {openWaiting.length > 0 && (
          <>
            <SectionHeader label="Open — Waiting for Joiner" count={openWaiting.length} />
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {openWaiting.map((b) => <BondRow key={b.id} bond={b} address={address} now={now} />)}
            </div>
          </>
        )}

        {/* History */}
        {history.length > 0 && (
          <>
            <SectionHeader label="History" count={history.length} />
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {history.map((b) => <BondRow key={b.id} bond={b} address={address} now={now} />)}
            </div>
          </>
        )}

        {/* No activity */}
        {myBonds.length === 0 && (
          <div style={{
            marginTop: "1rem",
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: "var(--radius-card)", padding: "2rem", textAlign: "center",
          }}>
            <p style={{ color: "var(--muted)", fontSize: "0.9rem", margin: 0 }}>
              No bonds found for this wallet. Create one to get started.
            </p>
          </div>
        )}
      </div>
    );
  }

  // ── deals mode ──────────────────────────────────────────────────────────────
  const myDeals = deals.filter((d) => dealRole(d, address) !== null);

  const actionNeeded = myDeals.filter((d) => dealNeedsAction(d, address, now));
  const active = myDeals.filter((d) => {
    const hasBuyer = d.buyer && d.buyer !== ZERO;
    return !d.settled && hasBuyer && now < d.deadline && !dealNeedsAction(d, address, now);
  });
  const openWaiting = myDeals.filter((d) => {
    const noBuyer = !d.buyer || d.buyer === ZERO;
    return !d.settled && noBuyer && now < d.deadline;
  });
  const readyToSettle = myDeals.filter((d) => {
    const hasBuyer = d.buyer && d.buyer !== ZERO;
    return !d.settled && hasBuyer && now >= d.deadline;
  });
  const history = myDeals.filter((d) => {
    const noBuyer = !d.buyer || d.buyer === ZERO;
    return d.settled || (noBuyer && now >= d.deadline);
  });

  return (
    <div style={{ marginBottom: "1rem" }}>
      {/* Dashboard header */}
      <div style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-card)",
        padding: "0.85rem 1rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "0.5rem",
      }}>
        <div>
          <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--ink)" }}>
            My OTC Deals
          </span>
          <span translate="no" className="notranslate" style={{ fontSize: "0.72rem", color: "var(--muted)", marginLeft: 8 }}>
            {shortAddr(address)}
          </span>
          <div style={{ fontSize: "0.72rem", color: "var(--muted)", marginTop: 2 }}>
            {myDeals.length} deal{myDeals.length !== 1 ? "s" : ""} · {actionNeeded.length} action needed · {readyToSettle.length} ready to settle
          </div>
        </div>
        {actionNeeded.length > 0 ? (
          <span style={{
            background: "rgba(245,166,35,0.15)", border: "1px solid rgba(245,166,35,0.4)",
            color: "var(--amber)", borderRadius: "var(--radius-pill)", padding: "4px 12px",
            fontSize: "0.74rem", fontWeight: 700,
          }}>
            ⚠️ {actionNeeded.length} deal action{actionNeeded.length > 1 ? "s" : ""} pending
          </span>
        ) : readyToSettle.length > 0 ? (
          <span style={{
            background: "rgba(245,166,35,0.12)", border: "1px solid rgba(245,166,35,0.3)",
            color: "var(--amber)", borderRadius: "var(--radius-pill)", padding: "4px 12px",
            fontSize: "0.74rem", fontWeight: 700,
          }}>
            🕐 {readyToSettle.length} ready to settle
          </span>
        ) : (
          <span style={{
            background: "rgba(46,230,166,0.1)", border: "1px solid rgba(46,230,166,0.25)",
            color: "var(--accent)", borderRadius: "var(--radius-pill)", padding: "4px 12px",
            fontSize: "0.74rem", fontWeight: 700,
          }}>
            ✓ All up to date
          </span>
        )}
      </div>

      {/* Claimable */}
      <ClaimRow bondContractAddr={undefined} otcContractAddr={otcContractAddr} chainId={chainId} />

      {/* Action Required */}
      {actionNeeded.length > 0 && (
        <>
          <SectionHeader label="Action Required" count={actionNeeded.length} />
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {actionNeeded.map((d) => <DealRow key={d.id} deal={d} address={address} now={now} />)}
          </div>
        </>
      )}

      {/* Ready to Settle */}
      {readyToSettle.length > 0 && (
        <>
          <SectionHeader label="Ready to Settle" count={readyToSettle.length} />
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {readyToSettle.map((d) => <DealRow key={d.id} deal={d} address={address} now={now} />)}
          </div>
        </>
      )}

      {/* Active */}
      {active.length > 0 && (
        <>
          <SectionHeader label="Active" count={active.length} />
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {active.map((d) => <DealRow key={d.id} deal={d} address={address} now={now} />)}
          </div>
        </>
      )}

      {/* Open — waiting for buyer */}
      {openWaiting.length > 0 && (
        <>
          <SectionHeader label="Open — Waiting for Buyer" count={openWaiting.length} />
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {openWaiting.map((d) => <DealRow key={d.id} deal={d} address={address} now={now} />)}
          </div>
        </>
      )}

      {/* History */}
      {history.length > 0 && (
        <>
          <SectionHeader label="History" count={history.length} />
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {history.map((d) => <DealRow key={d.id} deal={d} address={address} now={now} />)}
          </div>
        </>
      )}

      {/* No activity */}
      {myDeals.length === 0 && (
        <div style={{
          marginTop: "1rem",
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-card)", padding: "2rem", textAlign: "center",
        }}>
          <p style={{ color: "var(--muted)", fontSize: "0.9rem", margin: 0 }}>
            No deals found for this wallet. Create one to get started.
          </p>
        </div>
      )}
    </div>
  );
}
