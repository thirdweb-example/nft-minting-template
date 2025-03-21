import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { client } from "@/lib/thirdwebClient";
import { getCurrencyMetadata } from "thirdweb/extensions/erc20";
import { getContract, defineChain} from "thirdweb";
import { defaultChainId } from "@/lib/constants";

const chain = defineChain(defaultChainId);
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function fetchCurrencyMetadata(currency: string) {
    try {
        return (await getCurrencyMetadata({
            contract: getContract({ address: currency, chain, client }),
        }));
    } catch {
        return undefined;
    }
}