import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { client } from "@/lib/thirdwebClient";
import { getCurrencyMetadata } from "thirdweb/extensions/erc20";
import { getContract } from "thirdweb";
import { defaultChain } from "@/lib/constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function fetchCurrencyMetadata(currency: string) {
  return await getCurrencyMetadata({
    contract: getContract({ address: currency, chain: defaultChain, client }),
  }).catch(() => undefined);
}
