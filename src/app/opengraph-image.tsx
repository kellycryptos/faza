import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Faza — Two-Party Coordination on Arc";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "70px 80px",
          background: "#07080B",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        {/* Glow */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            right: "-100px",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(46,230,166,0.18) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-150px",
            left: "-100px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(18,52,90,0.45) 0%, transparent 70%)",
          }}
        />

        {/* Top bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <span
              style={{
                fontSize: "24px",
                fontWeight: 900,
                letterSpacing: "0.2em",
                color: "#2EE6A6",
                textTransform: "uppercase",
              }}
            >
              FAZA
            </span>
            <span
              style={{
                fontSize: "15px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                padding: "6px 14px",
                borderRadius: "999px",
                background: "rgba(46,230,166,0.12)",
                color: "#2EE6A6",
                border: "1px solid rgba(46,230,166,0.3)",
                textTransform: "uppercase",
              }}
            >
              Arc Mainnet 5042
            </span>
          </div>

          <div
            style={{
              fontSize: "16px",
              color: "#9AA3B2",
              fontWeight: 600,
              letterSpacing: "0.04em",
            }}
          >
            Native USDC Gas
          </div>
        </div>

        {/* Center content */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "950px" }}>
          <h1
            style={{
              fontSize: "64px",
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: "-0.04em",
              color: "#F4F6FA",
              margin: 0,
            }}
          >
            Show up, or forfeit the stake.
          </h1>
          <p
            style={{
              fontSize: "26px",
              lineHeight: 1.45,
              color: "#9AA3B2",
              margin: 0,
            }}
          >
            Two wallets lock USDC on Arc. Commit to terms, check in before the deadline,
            and settle purely onchain.
          </p>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: "30px",
            borderTop: "1px solid #1C2433",
          }}
        >
          <div style={{ display: "flex", gap: "32px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <span style={{ fontSize: "14px", color: "#5A6478", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>Instrument 01</span>
              <span style={{ fontSize: "20px", color: "#F4F6FA", fontWeight: 700 }}>Show-up Bonds</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <span style={{ fontSize: "14px", color: "#5A6478", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>Instrument 02</span>
              <span style={{ fontSize: "20px", color: "#F4F6FA", fontWeight: 700 }}>OTC Deal Tickets</span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "18px", color: "#C8D0DE", fontWeight: 700 }}>faza-v1.vercel.app</span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
