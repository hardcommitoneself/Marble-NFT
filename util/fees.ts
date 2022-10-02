import { coins } from '@cosmjs/stargate'
import { ChainInfo } from '@keplr-wallet/types'
import { unsafelyReadChainInfoCache, useChainInfo } from '../hooks/useChainInfo'

export const getDefaultExecuteFee = (
  feeCurrency: ChainInfo['feeCurrencies']
) => ({
  amount: coins(5000000, feeCurrency[0].coinDenom),
  gas: '5000000',
})

export const unsafelyGetDefaultExecuteFee = () => {
  /* hack: read chain info from query cache */
  let chainInfo = unsafelyReadChainInfoCache()

  /* throw an error if the function was called before the cache is available */
  if (!chainInfo) {
    console.log('No chain info was presented in the cache. Seem to be an architectural issue. Contact developers.')
    // throw new Error(
    //   'No chain info was presented in the cache. Seem to be an architectural issue. Contact developers.'
    // )
    return ({
      amount: coins(5000000, "JUNO"),
      gas: '5000000',
    })
  }
  return getDefaultExecuteFee(chainInfo.feeCurrencies)
}
