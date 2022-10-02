import { useTokenToTokenPrice } from './useTokenToTokenPrice'
import { usePersistance } from 'hooks/usePersistance'
import { useBaseTokenInfo, useNativeTokenInfo } from 'hooks/useTokenInfo'

export const usePriceForOneToken = ({ tokenASymbol, tokenBSymbol }) => {
  const { symbol: nativeTokenSymbol } = useNativeTokenInfo() || {}
  const { symbol: baseTokenSymbol } = useBaseTokenInfo() || {}

  const [baseToNativeRatio] = useTokenToTokenPrice({
    tokenASymbol: baseTokenSymbol,
    tokenBSymbol: nativeTokenSymbol,
    tokenAmount: 1,
  })

  const securedTokenASymbol =
    tokenASymbol === baseTokenSymbol ? nativeTokenSymbol : tokenASymbol
  const securedTokenBSymbol =
    tokenBSymbol === baseTokenSymbol ? nativeTokenSymbol : tokenBSymbol
  const [currentTokenPrice, isPriceLoading] = useTokenToTokenPrice({
    tokenASymbol: securedTokenASymbol,
    tokenBSymbol: securedTokenBSymbol,
    tokenAmount: 1,
  })
  let tokenPrice
  if (securedTokenASymbol === securedTokenBSymbol) {
    tokenPrice = baseToNativeRatio
  } else if (
    tokenASymbol === baseTokenSymbol ||
    tokenBSymbol === baseTokenSymbol
  ) {
    tokenPrice = currentTokenPrice * baseToNativeRatio
  } else {
    tokenPrice = currentTokenPrice
  }
  const persistPrice = usePersistance(isPriceLoading ? undefined : tokenPrice)

  return [persistPrice, isPriceLoading] as const
}
