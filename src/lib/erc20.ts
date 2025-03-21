import { ThirdwebContract, toTokens } from "thirdweb";
import { getActiveClaimCondition } from "thirdweb/extensions/erc20";
import { getContractMetadata } from "thirdweb/extensions/common";
import { fetchCurrencyMetadata } from "@/lib/utils";

export async function getERC20Info(contract: ThirdwebContract) {
    try {
        const claimCondition = await getActiveClaimCondition({ contract });
        const contractMetadata = await getContractMetadata({ contract });
        const priceInWei = claimCondition?.pricePerToken;
        const currencyMetadata = claimCondition?.currency
            ? await fetchCurrencyMetadata(claimCondition.currency).catch((err) => {
                console.error("Error fetching currency metadata:", err);
                throw err
                
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
    } catch (error) {
        console.error("Unexpected error in getERC20Info:", error);
        throw error; 
    }
}
