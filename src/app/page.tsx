"use client";

import { NftMint } from "@/components/nft-mint";
import {
  defaultChainId,
  defaultNftContractAddress,
  defaultTokenId,
} from "@/lib/constants";
import { useMint } from "@/hooks/use-mint";

export default function Home() {
  const tokenId = defaultTokenId;

  const { data: mintData, isLoading } = useMint({
    defaultChainId,
    defaultNftContractAddress,
    defaultTokenId: tokenId,
  });

  if (!mintData || isLoading) return <></>;

  const {
    contract,
    displayName,
    contractMetadataQuery,
    description,
    currencySymbol,
    pricePerToken,
    isERC1155Query,
    isERC721Query,
    totalSupply,
    nftQuery,
    availableTokensToMint,
  } = mintData;

  return (
    <NftMint
      contract={contract}
      displayName={displayName || ""}
      contractImage={contractMetadataQuery.data?.image || ""}
      description={description || ""}
      currencySymbol={currencySymbol}
      pricePerToken={pricePerToken}
      isERC1155={isERC1155Query}
      isERC721={isERC721Query}
      tokenId={tokenId}
    />
  );
}
