"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { createConfig, http, WagmiProvider } from "wagmi";
import { arcTestnet, arcMainnet } from "@/lib/arc";

const config = createConfig(
  getDefaultConfig({
    chains: [arcTestnet, arcMainnet],
    transports: {
      [arcTestnet.id]: http(arcTestnet.rpcUrls.default.http[0]),
      [arcMainnet.id]: http(arcMainnet.rpcUrls.default.http[0]),
    },
    walletConnectProjectId:
      process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "",
    appName: "Faza",
    appDescription: "Show-up bonds and two-party OTC tickets on Arc.",
    appUrl:
      typeof window !== "undefined"
        ? window.location.origin
        : "https://faza-v1.vercel.app",
  })
);

const queryClient = new QueryClient();

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider
          customTheme={{
            "--ck-font-family": "'Inter', sans-serif",
            "--ck-primary-button-background": "#2EE6A6",
            "--ck-primary-button-hover-background": "#26C98E",
            "--ck-primary-button-color": "#050B14",
            "--ck-body-background": "#10141C",
            "--ck-body-color": "#F4F6FA",
            "--ck-secondary-button-background": "rgba(255,255,255,0.06)",
            "--ck-border-radius": "16px",
          }}
        >
          {children}
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
