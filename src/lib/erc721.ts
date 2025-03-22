import { ThirdwebContract, toTokens } from "thirdweb";
import { getActiveClaimCondition } from "thirdweb/extensions/erc721";
import { getContractMetadata } from "thirdweb/extensions/common";
import { defaultChain } from "@/lib/constants";
import { getContract } from "thirdweb";
import { client } from "@/lib/thirdwebClient";
import { getCurrencyMetadata } from "thirdweb/extensions/erc20";

export async function getERC721Info(contract: ThirdwebContract) {
  const [claimCondition, contractMetadata] = await Promise.all([
    getActiveClaimCondition({ contract }),
    getContractMetadata({ contract }),
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
    displayName: contractMetadata?.name || "",
    description: contractMetadata?.description || "",
    pricePerToken:
      currencyMetadata && priceInWei
        ? Number(toTokens(priceInWei, currencyMetadata.decimals))
        : null,
    contractImage: contractMetadata?.image || "",
    currencySymbol: currencyMetadata?.symbol || "",
  };
}
