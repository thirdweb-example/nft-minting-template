import { NftMint } from "@/components/nft-mint";
import { defaultChainId, defaultNftContractAddress, defaultTokenId } from "@/lib/constants";
import { client } from "@/lib/thirdwebClient";
import { defineChain, getContract, toTokens } from "thirdweb";
import { getContractMetadata } from "thirdweb/extensions/common";
import { getActiveClaimCondition as getActiveClaimCondition1155, getNFT, isERC1155 } from "thirdweb/extensions/erc1155";
import { getCurrencyMetadata } from "thirdweb/extensions/erc20";
import { getActiveClaimCondition as getActiveClaimCondition721, isERC721 } from "thirdweb/extensions/erc721";
import { getActiveClaimCondition as getActiveClaimCondition20 } from "thirdweb/extensions/erc20";
import type { NFT } from "thirdweb";

const chain = defineChain(defaultChainId);
const contract = getContract({ address: defaultNftContractAddress, chain, client });
const tokenId = defaultTokenId;

// Define the possible ERC token types
type ERCType = "ERC1155" | "ERC721" | "ERC20" | null;

type CurrencyMetadata = {
  decimals: number;
  name: string;
  symbol: string;
};

type ContractMetadata = {
  name?: string; // Directly available in ERC20
  description?: string;
  image?: string;
  data?: {
    name?: string; // Nested inside "data" for ERC721 & ERC1155
    description?: string;
    image?: string;
  };
};

type ClaimCondition = {
  allowlistMerkleRoot?: `0x${string}`;
  availableSupply?: bigint;
  currency: string;
  maxMintPerWallet?: bigint;
  pricePerToken?: bigint;
  pricePerUnit?: bigint;
  startTimestamp: bigint;
};

type NFTInfo = {
  displayName?: string;
  description?: string;
  pricePerToken?: number | null;
  currencyMetadata?: CurrencyMetadata;
  nft?: NFT;
  metadata?: ContractMetadata;
  claimCondition?: ClaimCondition;
};

type FetchResult = {
  ercType: ERCType;
  info: NFTInfo | null;
  error?: string;
};

// Function to fetch NFT details, including ERC type and metadata
async function fetchNFTInfo(): Promise<FetchResult> {
  try {
    // Determine ERC type by checking contract compatibility
    const [isErc721, isErc1155] = await Promise.all([
      isERC721({ contract }).catch(() => false),
      isERC1155({ contract }).catch(() => false),
    ]);

    const ercType: ERCType = isErc1155 ? "ERC1155" : isErc721 ? "ERC721" : "ERC20";

    // Define contract-specific logic in a lookup object
    const claimConditionFetchers = {
      ERC20: () => getActiveClaimCondition20({ contract }),
      ERC721: () => getActiveClaimCondition721({ contract }),
      ERC1155: () => getActiveClaimCondition1155({ contract, tokenId }),
    };

    // Fetch metadata and claim conditions in parallel
    const [metadata, claimCondition]: [ContractMetadata | undefined, ClaimCondition | undefined] =
      await Promise.all([
        getContractMetadata({ contract }).catch(() => undefined),
        claimConditionFetchers[ercType]?.().catch(() => undefined),
      ]);


    // Define how to extract name & description dynamically
    const displayName = metadata?.data?.name || metadata?.name;
    const description = metadata?.data?.description || metadata?.description;

    // Extract currency details
    let currencyMetadata: CurrencyMetadata | undefined;
    let pricePerToken: number | null = null;

    if (claimCondition?.currency) {
      const currencyContract = getContract({ address: claimCondition.currency, chain, client });
      currencyMetadata = await getCurrencyMetadata({ contract: currencyContract }).catch(() => undefined);

      const priceInWei = claimCondition.pricePerToken || claimCondition.pricePerUnit;
      pricePerToken = currencyMetadata && priceInWei
        ? Number(toTokens(priceInWei, currencyMetadata.decimals))
        : null;
    }

    return {
      ercType,
      info: {
        displayName,
        description,
        pricePerToken,
        currencyMetadata,
        metadata,
        claimCondition,
      },
    };
  } catch (error) {
    console.error("Error fetching NFT info:", error);
    return {
      ercType: null,
      info: null,
      error: error instanceof Error ? error.message : "An unknown error occurred.",
    };
  }
}


// Home component that fetches NFT details and renders the UI
export default async function Home() {
  const { ercType, info, error } = await fetchNFTInfo();


  if (error) {
    return (
      <div>
        <h1>Error</h1>
        <p>{error}</p>
      </div>
    );
  }


  return (
    <NftMint
      contract={contract}
      displayName={info?.displayName || ""}
      contractImage={info?.metadata?.data?.image || info?.metadata?.image || ""}
      description={info?.description || ""}
      currencySymbol={info?.currencyMetadata?.symbol || ""}
      pricePerToken={info?.pricePerToken || 0}
      isERC1155={ercType === "ERC1155"}
      isERC721={ercType === "ERC721"}
      tokenId={defaultTokenId}
    />
  );
}
