import type { Metadata } from "next";
import "./globals.css";
import { Web3Provider } from "@/providers/Web3Provider";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  metadataBase: new URL("https://faza-v1.vercel.app"),
  title: {
    default: "Faza — Show up, or forfeit the stake",
    template: "%s | Faza",
  },
  description:
    "Two wallets lock USDC on Arc. Commit to terms, check in before the deadline, and settle purely onchain. Live on Arc Mainnet.",
  keywords: [
    "Arc",
    "Circle",
    "USDC",
    "Arc Mainnet",
    "Smart Contracts",
    "Show-up Bonds",
    "OTC Deals",
    "DoraHacks",
    "Web3",
  ],
  authors: [{ name: "kellycryptos", url: "https://github.com/kellycryptos" }],
  creator: "kellycryptos",
  openGraph: {
    title: "Faza — Show up, or forfeit the stake",
    description:
      "Two-party micro-bonds and OTC tickets settled on Arc Mainnet in USDC. Gas is fractions of a cent.",
    url: "https://faza-v1.vercel.app",
    siteName: "Faza",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Faza — Show up, or forfeit the stake",
    description:
      "Two-party micro-bonds and OTC tickets settled on Arc Mainnet in USDC.",
    creator: "@kellycryptos",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Web3Provider>
          <Navbar />
          <main style={{ paddingTop: "60px" }}>{children}</main>
        </Web3Provider>
      </body>
    </html>
  );
}
