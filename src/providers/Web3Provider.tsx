"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { createConfig, http, WagmiProvider } from "wagmi";
import { activeChain } from "@/lib/arc";

const config = createConfig(
  getDefaultConfig({
    chains: [activeChain],
    transports: {
      [activeChain.id]: http(activeChain.rpcUrls.default.http[0]),
    },
    walletConnectProjectId:
      process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "",
    appName: "Faza",
    appDescription: "A two-party show-up bond on Arc.",
    appUrl:
      typeof window !== "undefined"
        ? window.location.origin
        : "https://faza.xyz",
  })
);

const queryClient = new QueryClient();

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider
          customTheme={{
            "--ck-font-family": "'DM Sans', sans-serif",
            "--ck-primary-button-background": "#122d45",
            "--ck-primary-button-hover-background": "#1a3f5f",
            "--ck-body-background": "#0d1b2f",
            "--ck-body-color": "#f9faf3",
            "--ck-secondary-button-background": "rgba(255,255,255,0.08)",
          }}
        >
          {children}
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
