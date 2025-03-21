import { defineChain, getContract } from "thirdweb";
import { client } from "@/lib/thirdwebClient";

/**
 * Change this to the contract address of your NFT collection
 */
if (!process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS) {
  throw new Error(
    "NEXT_PUBLIC_NFT_CONTRACT_ADDRESS is not defined in the environment variables",
  );
}
export const defaultNftContractAddress =
  process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS;

/**
 * Change this to the chainId that your nft collection is deployed on
 * Look for your chain: https://thirdweb.com/chainlist
 */
if (!process.env.NEXT_PUBLIC_NFT_CONTRACT_CHAIN_ID) {
  throw new Error(
    "NEXT_PUBLIC_NFT_CONTRACT_CHAIN_ID is not defined in the environment variables",
  );
}
export const defaultChainId = Number(
  process.env.NEXT_PUBLIC_NFT_CONTRACT_CHAIN_ID,
);

/**
 * Only applicable to ERC1155 Edition Drop contract
 */

export const defaultTokenId = BigInt(
  process.env.NEXT_PUBLIC_NFT_CONTRACT_TOKEN_ID || "0",
);

/**
 * Test data:
 * ERC1155: 0x3cf279b3248E164F3e5C341826B878d350EC6AB1 | 11155111 | 1n
 * ERC721: 0xf20d41960b58A1f6868e83cf25FFDA5E8C766317 | 11155111
 * ERC20: 0xdE60bd7Bc4FFb32A5A705723e111f3B5097958E9 | 11155111
 */

export const contract = getContract({
  address: defaultNftContractAddress,
  chain: defineChain(defaultChainId),
  client,
});

export const defaultChain = defineChain(defaultChainId);
