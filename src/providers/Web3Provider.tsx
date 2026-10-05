"use client";

import "@rainbow-me/rainbowkit/styles.css";
import {
  getDefaultConfig,
  RainbowKitProvider,
  darkTheme,
} from "@rainbow-me/rainbowkit";
import { WagmiProvider, http } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { arcMainnet, arcTestnet } from "@/lib/arc";
import { NetworkProvider } from "@/context/NetworkContext";
import { LanguageProvider } from "@/context/LanguageContext";

const walletConnectProjectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ||
  "3a8170812b534d0ff9d794f19a901d64";

if (!process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID && typeof window !== "undefined") {
  console.warn(
    "[Faza] NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set — " +
      "using fallback project ID for WalletConnect modal."
  );
}

const config = getDefaultConfig({
  appName: "Faza",
  appDescription: "Show-up bonds and two-party OTC tickets on Arc.",
  appUrl: "https://faza-v1.vercel.app",
  appIcon: "https://faza-v1.vercel.app/icon.png",
  projectId: walletConnectProjectId,
  // arcMainnet first → default chain
  chains: [arcMainnet, arcTestnet],
  transports: {
    [arcMainnet.id]: http(arcMainnet.rpcUrls.default.http[0], {
      timeout: 30_000,
      retryCount: 4,
      retryDelay: 1000,
    }),
    [arcTestnet.id]: http(arcTestnet.rpcUrls.default.http[0], {
      timeout: 30_000,
      retryCount: 4,
      retryDelay: 1000,
    }),
  },
  ssr: true,
});

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (typeof window === "undefined") {
    return makeQueryClient();
  } else {
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          initialChain={arcMainnet}
          theme={darkTheme({
            accentColor: "#2EE6A6",
            accentColorForeground: "#050B14",
            borderRadius: "large",
            fontStack: "system",
            overlayBlur: "small",
          })}
        >
          <LanguageProvider>
            <NetworkProvider>{children}</NetworkProvider>
          </LanguageProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

