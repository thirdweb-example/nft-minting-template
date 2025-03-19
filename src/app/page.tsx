import { NftMint } from "@/components/nft-mint"
import { defaultChainId, defaultNftContractAddress, defaultTokenId } from "@/lib/constants"
import { client } from "@/lib/thirdwebClient"
import { defineChain, getContract, toTokens } from "thirdweb"
import { getContractMetadata } from "thirdweb/extensions/common"
import { getActiveClaimCondition as getActiveClaimCondition1155, getNFT, isERC1155 } from "thirdweb/extensions/erc1155"
import { getCurrencyMetadata } from "thirdweb/extensions/erc20"
import { getActiveClaimCondition as getActiveClaimCondition721, isERC721 } from "thirdweb/extensions/erc721"
import { getActiveClaimCondition as getActiveClaimCondition20 } from "thirdweb/extensions/erc20"
import type { NFT } from "thirdweb"

const chain = defineChain(defaultChainId)
const contract = getContract({ address: defaultNftContractAddress, chain, client })
const tokenId = defaultTokenId

type ERCType = "ERC1155" | "ERC721" | "ERC20" | null

type CurrencyMetadata = {
  decimals: number
  name: string
  symbol: string
}

type ContractMetadata = {
  data?: {
    name?: string
    description?: string
    image?: string
  }
}

type ClaimCondition = {
  allowlistMerkleRoot: `0x${string}`
  auxData: string
  availableSupply: bigint
  currency: string
  endTimestamp: number
  maxMintPerWallet: bigint
  pricePerToken: bigint
  pricePerUnit: bigint
  startTimestamp: number
}

type NFTInfo = {
  displayName?: string
  description?: string
  pricePerToken?: number | null
  currencyMetadata?: CurrencyMetadata
  nft?: NFT
  metadata?: ContractMetadata
  claimCondition?: ClaimCondition
}

async function getERCType(): Promise<ERCType> {
  try {
    if (await isERC1155({ contract })) return "ERC1155"
    if (await isERC721({ contract })) return "ERC721"
    return "ERC20"
  } catch (error) {
    console.error("Error determining ERC type:", error)
    return null
  }
}

async function getERC20Info(): Promise<NFTInfo | null> {
  try {
    const claimCondition = (await getActiveClaimCondition20({ contract })) as unknown as ClaimCondition
    return { claimCondition }
  } catch (error) {
    console.error("Error fetching ERC20 info:", error)
    return null
  }
}

async function getERC721Info(): Promise<NFTInfo | null> {
  try {
    const [claimCondition, metadata] = await Promise.all([
      getActiveClaimCondition721({ contract }) as unknown as ClaimCondition,
      getContractMetadata({ contract }) as Promise<ContractMetadata>,
    ])

    // Use pricePerToken or pricePerUnit based on what's available
    const priceInWei = claimCondition?.pricePerToken || claimCondition?.pricePerUnit
    const currency = claimCondition?.currency

    let currencyMetadata: CurrencyMetadata | undefined = undefined
    if (currency) {
      try {
        currencyMetadata = (await getCurrencyMetadata({
          contract: getContract({ address: currency, chain, client }),
        })) as CurrencyMetadata
      } catch (error) {
        console.error("Error fetching currency metadata:", error)
      }
    }

    return {
      displayName: metadata?.data?.name,
      description: metadata?.data?.description,
      pricePerToken: currencyMetadata && priceInWei ? Number(toTokens(priceInWei, currencyMetadata.decimals)) : null,
      currencyMetadata,
      metadata,
      claimCondition,
    }
  } catch (error) {
    console.error("Error fetching ERC721 info:", error)
    return null
  }
}

async function getERC1155Info(): Promise<NFTInfo | null> {
  try {
    const [nft, claimCondition] = await Promise.all([
      getNFT({ contract, tokenId }),
      getActiveClaimCondition1155({ contract, tokenId }) as unknown as ClaimCondition,
    ])

    // Use pricePerToken or pricePerUnit based on what's available
    const priceInWei = claimCondition?.pricePerToken || claimCondition?.pricePerUnit
    const currency = claimCondition?.currency

    let currencyMetadata: CurrencyMetadata | undefined = undefined
    if (currency) {
      try {
        currencyMetadata = (await getCurrencyMetadata({
          contract: getContract({ address: currency, chain, client }),
        })) as CurrencyMetadata
      } catch (error) {
        console.error("Error fetching currency metadata:", error)
      }
    }

    return {
      displayName: nft?.metadata.name,
      description: nft?.metadata.description,
      pricePerToken: currencyMetadata && priceInWei ? Number(toTokens(priceInWei, currencyMetadata.decimals)) : null,
      currencyMetadata,
      nft,
      claimCondition,
    }
  } catch (error) {
    console.error("Error fetching ERC1155 info:", error)
    return null
  }
}

export default async function Home() {
  try {
    const ercType = await getERCType()
    if (!ercType) {
      return (
        <div>
          <h1>Error</h1>
          <p>Failed to determine ERC type.</p>
        </div>
      )
    }

    let info: NFTInfo | null = null

    switch (ercType) {
      case "ERC20":
        info = await getERC20Info()
        break
      case "ERC721":
        info = await getERC721Info()
        break
      case "ERC1155":
        info = await getERC1155Info()
        break
      default:
        return (
          <div>
            <h1>Error</h1>
            <p>Unsupported ERC type: {ercType}</p>
          </div>
        )
    }

    if (!info) {
      return (
        <div>
          <h1>Error</h1>
          <p>Failed to fetch NFT details.</p>
        </div>
      )
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
    )
  } catch (error) {
    console.error("Error in Home component:", error)
    return (
      <div>
        <h1>Failed to load NFT</h1>
        <p>{error instanceof Error ? error.message : "An unexpected error occurred."}</p>
      </div>
    )
  }
}

