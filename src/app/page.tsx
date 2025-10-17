"use client";

import { NftMint } from "@/components/nft-mint";
import { defaultTokenId, contract } from "@/lib/constants";
import { useNftData } from "@/hooks/useNftData";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const { data, loading, error, refetch } = useNftData();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="w-full max-w-md">
          <div className="aspect-square overflow-hidden rounded-lg mb-4">
            <Skeleton className="w-full h-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-red-600">Failed to load NFT</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {error || "An unexpected error occurred."}
          </p>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <NftMint
      contract={contract}
      displayName={data.displayName}
      contractImage={data.contractImage}
      description={data.description}
      currencySymbol={data.currencySymbol}
      pricePerToken={data.pricePerToken}
      isERC1155={data.isERC1155}
      isERC721={data.isERC721}
      tokenId={defaultTokenId}
    />
  );
}
