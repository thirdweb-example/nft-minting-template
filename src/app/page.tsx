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


const chain = defineChain(defaultChainId);
const contract = getContract({ address: defaultNftContractAddress, chain, client });
const tokenId = defaultTokenId;

async function getERCType() {
    if (await isERC1155({ contract })) return "ERC1155";
    if (await isERC721({ contract })) return "ERC721";
    return "ERC20";
}

async function getERC20Info() {
    const claimCondition = await getActiveClaimCondition20({ contract });
    return { claimCondition };
}

async function getERC721Info() {
    const [claimCondition, metadata] = await Promise.all([
        getActiveClaimCondition721({ contract }),
        getContractMetadata({ contract }),
    ]);
    const priceInWei = claimCondition?.pricePerToken;
    const currency = claimCondition?.currency;
    const currencyMetadata = currency
        ? await getCurrencyMetadata({ contract: getContract({ address: currency, chain, client }) })
        : undefined;
    return {
        displayName: metadata?.data?.name,
        description: metadata?.data?.description,
        pricePerToken: currencyMetadata && priceInWei ? Number(toTokens(priceInWei, currencyMetadata.decimals)) : null,
        currencyMetadata,
        metadata,
        claimCondition,
    };
}

async function getERC1155Info() {
    const [nft, claimCondition] = await Promise.all([
        getNFT({ contract, tokenId }),
        getActiveClaimCondition1155({ contract, tokenId }),
    ]);
    const priceInWei = claimCondition?.pricePerToken;
    const currency = claimCondition?.currency;
    const currencyMetadata = currency
        ? await getCurrencyMetadata({ contract: getContract({ address: currency, chain, client }) })
        : undefined;
    return {
        displayName: nft?.metadata.name,
        description: nft?.metadata.description,
        pricePerToken: currencyMetadata && priceInWei ? Number(toTokens(priceInWei, currencyMetadata.decimals)) : null,
        currencyMetadata,
        nft,
        claimCondition,
    };
}

type ERCInfo = {
    displayName?: string;
    description?: string;
    pricePerToken?: number | null;
    currencyMetadata?: any;
    metadata?: any;
    claimCondition?: any;
    nft?: any;
};

export default async function Home() {
    const ercType = await getERCType();
    let info: ERCInfo = {};

    switch (ercType) {
        case "ERC20":
            info = await getERC20Info();
            console.log("ERC20", info);
            break;
        case "ERC721":
            info = await getERC721Info();
            console.log("ERC721", info
            );
            break;
        case "ERC1155":
            info = await getERC1155Info();
            console.log("ERC1155", info);
            break;
    }

    return (
        <NftMint
            contract={contract}
            displayName={info.displayName || ""}
            contractImage={info.metadata?.data?.image || ""}
            description={info.description || ""}
            currencySymbol={info.currencyMetadata?.symbol || ""}
            pricePerToken={info.pricePerToken || 0}
            isERC1155={ercType === "ERC1155"}
            isERC721={ercType === "ERC721"}
            tokenId={defaultTokenId}
        />
    );
}
