"use client";

import { useQuery } from "@tanstack/react-query";
import { ChainOptions } from "thirdweb/chains";

import { defineChain, getContract, toTokens } from "thirdweb";
import { getContractMetadata } from "thirdweb/extensions/common";
import {
  getActiveClaimCondition as getActiveClaimCondition1155,
  getNFT as getNFT1155,
  getNFTs as getNFTs1155,
  isERC1155,
  totalSupply as totalSupply1155,
} from "thirdweb/extensions/erc1155";
import { getCurrencyMetadata } from "thirdweb/extensions/erc20";
import {
  getActiveClaimCondition as getActiveClaimCondition721,
  getTotalClaimedSupply,
  getNFT as getNFT721,
  getNFTs as getNFTs721,
  isERC721,
} from "thirdweb/extensions/erc721";

import { client } from "@/lib/thirdwebClient";

type Props = {
  defaultNftContractAddress: string;
  defaultTokenId: bigint;
  defaultChainId:
    | Readonly<
        ChainOptions & {
          rpc: string;
        }
      >
    | number;
};

export function useMint(props: Props) {
  const { defaultNftContractAddress, defaultChainId, defaultTokenId } = props;

  return useQuery({
    queryKey: [
      defaultNftContractAddress,
      defaultChainId,
      String(defaultTokenId),
    ],
    queryFn: async () => {
      const tokenId = defaultTokenId;

      const chain = defineChain(defaultChainId);

      const contract = getContract({
        address: defaultNftContractAddress,
        chain,
        client,
      });

      try {
        const isERC1155Query = await isERC1155({ contract });

        const isERC721Query = await isERC721({ contract });

        const contractMetadataQuery = await getContractMetadata({
          contract,
        });

        const nftQuery = isERC1155Query
          ? await getNFT1155({ contract, tokenId })
          : await getNFT721({ contract, tokenId });

        const nftsQuery = isERC1155Query
          ? await getNFTs1155({ contract, start: 0, count: 100 })
          : await getNFTs721({ contract, start: 0, count: 100 });

        const claimCondition = isERC1155Query
          ? await getActiveClaimCondition1155({
              contract,
              tokenId,
            })
          : await getActiveClaimCondition721({ contract });

        const displayName = isERC1155Query
          ? nftQuery.metadata.name
          : contractMetadataQuery.data?.name;

        const description = nftQuery?.metadata.description;

        const priceInWei = claimCondition.pricePerToken;

        const currency = claimCondition.currency;

        const currencyContract = getContract({
          address: currency,
          chain,
          client,
        });

        const currencyMetadata = await getCurrencyMetadata({
          contract: currencyContract,
        });

        const currencySymbol = currencyMetadata?.symbol || "";
        const pricePerToken =
          currencyMetadata && priceInWei
            ? Number(toTokens(priceInWei, currencyMetadata.decimals))
            : 0.0005;

        const totalSupply = isERC1155Query
          ? await totalSupply1155({
              contract: contract,
              id: tokenId,
            })
          : await getTotalClaimedSupply({
              contract: contract,
            });

        const availableTokensToMint = nftsQuery?.map((item) => item);

        return {
          contract,
          displayName,
          contractMetadataQuery,
          description,
          currencySymbol,
          pricePerToken,
          isERC1155Query,
          isERC721Query,
          tokenId,
          totalSupply,
          nftQuery,
          availableTokensToMint,
        };
      } catch (e) {
        throw e;
      }
    },
    staleTime: 1000 * 60 * 6,
  });
}
