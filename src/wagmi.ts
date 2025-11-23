import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { defineChain, http } from "viem";

// 0G Testnet custom chain definition
export const zeroGTestnet = defineChain({
  id: 16602,
  name: "0G Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "OG",
    symbol: "OG",
  },
  rpcUrls: {
    default: {
      http: ["https://evmrpc-testnet.0g.ai"],
    },
  },
  blockExplorers: {
    default: {
      name: "0G Explorer",
      url: "https://chainscan-galileo.0g.ai",
    },
  },
  testnet: true,
});

export const config = getDefaultConfig({
  appName: "Houdini",
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || "demo",
  chains: [zeroGTestnet],
  transports: {
    [zeroGTestnet.id]: http("https://evmrpc-testnet.0g.ai", {
      timeout: 60_000, // 60 second timeout for slow 0G Network blocks
      retryCount: 5, // Retry failed requests 5 times
      retryDelay: 3000, // 3 second delay between retries
    }),
  },
});
