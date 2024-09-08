import { NftMint } from "@/components/nft-mint";
import {
	defaultChainId,
	defaultNftContractAddress,
	defaultTokenId,
} from "@/lib/constants";
import { client } from "@/lib/thirdwebClient";
import { defineChain, getContract, toTokens } from "thirdweb";
import { getContractMetadata } from "thirdweb/extensions/common";
import {
	getActiveClaimCondition as getActiveClaimCondition1155,
	getNFT,
	isERC1155,
} from "thirdweb/extensions/erc1155";
import { getCurrencyMetadata } from "thirdweb/extensions/erc20";
import {
	getActiveClaimCondition as getActiveClaimCondition721,
	isERC721,
} from "thirdweb/extensions/erc721";
import { getActiveClaimCondition as getActiveClaimCondition20 } from "thirdweb/extensions/erc20";

// This page renders on the server
// If you are looking for a client-rendered version, checkout src/page.tsx
export default async function Home() {
	const tokenId = defaultTokenId;
	const chain = defineChain(defaultChainId);
	const contract = getContract({
		address: defaultNftContractAddress,
		chain,
		client,
	});
	const [isERC721Query, isERC1155Query, contractMetadataQuery] =
		await Promise.all([
			isERC721({ contract }),
			isERC1155({ contract }),
			getContractMetadata({ contract }),
		]);

	const [nftQuery, claimCondition1155, claimCondition721, claimCondition20] =
		await Promise.all([
			isERC1155Query ? getNFT({ contract, tokenId }) : undefined,
			isERC1155Query
				? getActiveClaimCondition1155({ contract, tokenId })
				: undefined,
			isERC721Query ? getActiveClaimCondition721({ contract }) : undefined,
			!isERC1155Query && !isERC721Query
				? getActiveClaimCondition20({ contract })
				: undefined,
		]);

	const displayName = isERC1155Query
		? nftQuery?.metadata.name
		: contractMetadataQuery.data?.name;

	const description = isERC1155Query
		? nftQuery?.metadata.description
		: contractMetadataQuery.data?.description;

	const priceInWei = isERC1155Query
		? claimCondition1155?.pricePerToken
		: isERC721Query
			? claimCondition721?.pricePerToken
			: claimCondition20?.pricePerToken;

	const currency = isERC1155Query
		? claimCondition1155?.currency
		: isERC721Query
			? claimCondition721?.currency
			: claimCondition20?.currency;

	const currencyMetadata = currency
		? await getCurrencyMetadata({
				contract: getContract({
					address: currency || "",
					chain,
					client,
				}),
			})
		: undefined;

	const currencySymbol = currencyMetadata?.symbol || "";

	const pricePerToken =
		currencyMetadata && priceInWei
			? Number(toTokens(priceInWei, currencyMetadata.decimals))
			: null;

	return (
		<NftMint
			contract={contract}
			displayName={displayName || ""}
			contractImage={contractMetadataQuery.data?.image || ""}
			description={description || ""}
			currencySymbol={currencySymbol}
			pricePerToken={pricePerToken}
			isERC1155={!!isERC1155Query}
			isERC721={!!isERC721Query}
			tokenId={tokenId}
		/>
	);
}
