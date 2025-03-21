import { ThirdwebContract, toTokens } from "thirdweb";
import { getActiveClaimCondition, getNFT } from "thirdweb/extensions/erc1155";
import { defaultTokenId } from "@/lib/constants";
import { fetchCurrencyMetadata } from "@/lib/utils";

export async function getERC1155Info(contract: ThirdwebContract) {
  const [claimCondition, nft] = await Promise.all([
    await getActiveClaimCondition({
      contract,
      tokenId: defaultTokenId,
    }).catch((err) => {
      throw err;
    }),
    await getNFT({ contract, tokenId: defaultTokenId }),
  ]);
  const priceInWei = claimCondition?.pricePerToken;
  const currencyMetadata = claimCondition?.currency
    ? await fetchCurrencyMetadata(claimCondition.currency)
    : null;

  return {
    displayName: nft?.metadata?.name || "",
    description: nft?.metadata?.description || "",
    pricePerToken:
      currencyMetadata && priceInWei
        ? Number(toTokens(priceInWei, currencyMetadata.decimals))
        : null,
    contractImage: nft?.metadata?.image || "",
    currencySymbol: currencyMetadata?.symbol || "",
  };
}
