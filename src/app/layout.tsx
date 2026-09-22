import type { Metadata } from "next";
import "./globals.css";
import { Web3Provider } from "@/providers/Web3Provider";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Faza — Show up, or forfeit the stake.",
  description: "Two wallets lock USDC on Arc. Both check in before the deadline and the stake returns. One ghosts and the other takes both.",
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
