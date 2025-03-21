import { ThirdwebContract, toTokens } from "thirdweb";
import { getActiveClaimCondition, getNFT } from "thirdweb/extensions/erc1155";
import { defaultTokenId, defaultChain } from "@/lib/constants";
import { getContract } from "thirdweb";
import { client } from "@/lib/thirdwebClient";
import { getCurrencyMetadata } from "thirdweb/extensions/erc20";

export async function getERC1155Info(contract: ThirdwebContract) {
  const [claimCondition, nft] = await Promise.all([
    await getActiveClaimCondition({
      contract,
      tokenId: defaultTokenId,
    }),
    await getNFT({ contract, tokenId: defaultTokenId }),
  ]);
  const priceInWei = claimCondition?.pricePerToken;
  const currencyMetadata = claimCondition?.currency
    ? await getCurrencyMetadata({
        contract: getContract({
          address: claimCondition?.currency,
          chain: defaultChain,
          client,
        }),
      })
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
