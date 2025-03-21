import { NftMint } from "@/components/nft-mint";
import { defaultChainId, defaultNftContractAddress, defaultTokenId } from "@/lib/constants";
// thirdweb client import
import { client } from "@/lib/thirdwebClient";
// lib imports for fetching NFT details
import { getERC20Info } from "@/lib/erc20";
import { getERC721Info } from "@/lib/erc721";
import { getERC1155Info } from "@/lib/erc1155";
// thirdweb imports
import { defineChain, getContract } from "thirdweb";
import { isERC1155 } from "thirdweb/extensions/erc1155";
import { isERC721 } from "thirdweb/extensions/erc721";

const chain = defineChain(defaultChainId);
const contract = getContract({ address: defaultNftContractAddress, chain, client });

async function getERCType() {
  try {
    const [isErc721, isErc1155] = await Promise.all([
      isERC721({ contract }).catch(() => false),
      isERC1155({ contract }).catch(() => false),
    ]);

    return isErc1155 ? "ERC1155" : isErc721 ? "ERC721" : "ERC20";
  } catch (error) {
    console.error("Error detecting ERC type:", error);
    return null;
  }
}

export default async function Home() {
  try {
    const ercType = await getERCType();
    if (!ercType) throw new Error("Failed to determine ERC type.");

    // Ensure errors are caught properly by using await inside try/catch
    let info;
    switch (ercType) {
      case "ERC20":
        info = await getERC20Info(contract);
        break;
      case "ERC721":
        info = await getERC721Info(contract);
        break;
      case "ERC1155":
        info = await getERC1155Info(contract);
        break;
      default:
        throw new Error("Unknown ERC type.");
    }
    console.log(ercType, info);

    if (!info) throw new Error("Failed to fetch NFT details.");

    return (
      <NftMint
        contract={contract}
        displayName={info.displayName || ""}
        contractImage={info.contractImage || ""}
        description={info.description || ""}
        currencySymbol={info.currencySymbol || ""}
        pricePerToken={info.pricePerToken || 0}
        isERC1155={ercType === "ERC1155"}
        isERC721={ercType === "ERC721"}
        tokenId={defaultTokenId}
      />
    );
  } catch (error) {
    console.error("Error in Home component:", error);
    return (
      <div>
        <h1>Failed to load NFT</h1>
        <p>{error instanceof Error ? error.message : "An unexpected error occurred."}</p>
      </div>
    );
  }
}

