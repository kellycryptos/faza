"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { createConfig, http, WagmiProvider } from "wagmi";
import { arcMainnet, arcTestnet } from "@/lib/arc";

const walletConnectProjectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "";

if (!walletConnectProjectId && typeof window !== "undefined") {
  console.warn(
    "[Faza] NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set — " +
      "WalletConnect QR modal will not work. " +
      "Add it to .env.local and restart the dev server."
  );
}

const config = createConfig(
  getDefaultConfig({
    // arcMainnet first → it becomes the default chain in ConnectKit
    chains: [arcMainnet, arcTestnet],
    transports: {
      [arcMainnet.id]: http(arcMainnet.rpcUrls.default.http[0]),
      [arcTestnet.id]: http(arcTestnet.rpcUrls.default.http[0]),
    },
    walletConnectProjectId,
    appName: "Faza",
    appDescription: "Show-up bonds and two-party OTC tickets on Arc.",
    appUrl:
      typeof window !== "undefined"
        ? window.location.origin
        : "https://faza-v1.vercel.app",
    appIcon: "https://faza-v1.vercel.app/icon.png",
  })
);

const queryClient = new QueryClient();

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider
          options={{
            // Default to Arc Mainnet when user connects fresh
            initialChainId: arcMainnet.id,
          }}
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
