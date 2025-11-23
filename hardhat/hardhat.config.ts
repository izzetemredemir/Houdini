import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";
import { defineConfig } from "hardhat/config";
import { config as dotenvConfig } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file from hardhat directory
dotenvConfig({ path: resolve(__dirname, ".env") });

export default defineConfig({
  plugins: [hardhatToolboxViemPlugin],
  solidity: {
    profiles: {
      default: {
        version: "0.8.28",
      },
      production: {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    },
  },
  networks: {
    "0g-testnet": {
      type: "http",
      chainType: "l1",
      url: "https://evmrpc-testnet.0g.ai",
      accounts: process.env.OG_PRIVATE_KEY ? [process.env.OG_PRIVATE_KEY] : [],
      chainId: 16602,
    },
  },
});
