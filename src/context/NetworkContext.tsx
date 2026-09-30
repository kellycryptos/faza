"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAccount, useSwitchChain } from "wagmi";
import { arcMainnet, arcTestnet } from "@/lib/arc";

export type NetworkType = "mainnet" | "testnet";

interface NetworkContextValue {
  network: NetworkType;
  chainId: number;
  isMainnet: boolean;
  isTestnet: boolean;
  setNetwork: (net: NetworkType) => void;
  toggleNetwork: () => void;
}

const NetworkContext = createContext<NetworkContextValue | undefined>(undefined);

const STORAGE_KEY = "faza_network";

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const { chainId: walletChainId, isConnected } = useAccount();
  const { switchChain } = useSwitchChain();

  const [network, setNetworkState] = useState<NetworkType>("mainnet");
  const [initialized, setInitialized] = useState(false);

  // Initialize network on mount from URL param -> localStorage -> wallet -> default mainnet
  useEffect(() => {
    let initialNet: NetworkType = "mainnet";

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlNet = params.get("network")?.toLowerCase();
      const urlChain = params.get("chain")?.toLowerCase();

      if (urlNet === "testnet" || urlChain === "testnet" || urlChain === "5042002") {
        initialNet = "testnet";
      } else if (urlNet === "mainnet" || urlChain === "mainnet" || urlChain === "5042") {
        initialNet = "mainnet";
      } else {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved === "testnet" || saved === "mainnet") {
          initialNet = saved as NetworkType;
        } else if (walletChainId === arcTestnet.id) {
          initialNet = "testnet";
        }
      }
    }

    setNetworkState(initialNet);
    setInitialized(true);
  }, [walletChainId]);

  // Sync if wallet changes network
  useEffect(() => {
    if (!initialized || !isConnected) return;
    if (walletChainId === arcTestnet.id && network !== "testnet") {
      setNetworkState("testnet");
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, "testnet");
        syncUrlParam("testnet");
      }
    } else if (walletChainId === arcMainnet.id && network !== "mainnet") {
      setNetworkState("mainnet");
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, "mainnet");
        syncUrlParam("mainnet");
      }
    }
  }, [walletChainId, isConnected, initialized, network]);

  const syncUrlParam = (targetNet: NetworkType) => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (targetNet === "testnet") {
      url.searchParams.set("network", "testnet");
    } else {
      url.searchParams.delete("network");
    }
    window.history.replaceState(null, "", url.toString());
  };

  const setNetwork = useCallback(
    (targetNet: NetworkType) => {
      setNetworkState(targetNet);
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, targetNet);
        syncUrlParam(targetNet);
      }
      // If wallet is connected, switch chain in wallet too
      if (isConnected && switchChain) {
        const targetChainId = targetNet === "testnet" ? arcTestnet.id : arcMainnet.id;
        try {
          switchChain({ chainId: targetChainId });
        } catch (e) {
          console.warn("[Faza] Wallet switchChain skipped or rejected:", e);
        }
      }
    },
    [isConnected, switchChain]
  );

  const toggleNetwork = useCallback(() => {
    setNetwork(network === "mainnet" ? "testnet" : "mainnet");
  }, [network, setNetwork]);

  const chainId = network === "testnet" ? arcTestnet.id : arcMainnet.id;
  const isMainnet = network === "mainnet";
  const isTestnet = network === "testnet";

  return (
    <NetworkContext.Provider
      value={{
        network,
        chainId,
        isMainnet,
        isTestnet,
        setNetwork,
        toggleNetwork,
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork() {
  const ctx = useContext(NetworkContext);
  if (!ctx) {
    // Graceful fallback if rendered outside provider
    return {
      network: "mainnet" as NetworkType,
      chainId: arcMainnet.id,
      isMainnet: true,
      isTestnet: false,
      setNetwork: () => {},
      toggleNetwork: () => {},
    };
  }
  return ctx;
}
