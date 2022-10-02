import * as React from "react";
import { useCallback, useEffect, useState } from "react"
import { styled } from 'components/theme'
import { getRealTokenAmount } from "services/nft"
import { NftInfo, CollectionToken, SALE_TYPE } from "services/nft/type";
import { IconWrapper } from 'components/IconWrapper'
import { Credit } from 'icons'
import { useTokenDollarValueQuery, useTokenDollarValue } from 'hooks/useTokenDollarValue'
import {
  dollarValueFormatterWithDecimals,
  formatTokenBalance,
  valueFormatter18,
  valueFormatter6,
} from 'util/conversion'
import {
  Image
} from "@chakra-ui/react";

interface NftCardProps {
  readonly nft: NftInfo
}

export function NftPrice({ nft }: NftCardProps): JSX.Element {
  console.log("nft price", nft)
  const [tokenDollarPrice] = useTokenDollarValue(nft.paymentToken.symbol)
  const [dollarPrice, setDollarPrice] = useState(0)
  useEffect(() => {
    setDollarPrice(parseFloat(nft.price)  * tokenDollarPrice)
  }, [tokenDollarPrice]);
  return (
    <>
    {nft.sale.hasOwnProperty("sale_type") && nft.sale.sale_type == SALE_TYPE[0] &&
      <>
      {parseFloat(nft.price) > 0 &&
      <>
      <p className="price-title">Current Price</p>
      <PriceDiv className="price-section">
        <Image alt="Token Icon" className="token-icon" src={nft.paymentToken.logoUri}/>
        <span className="token-balance">{nft.price}&nbsp;{nft.paymentToken.symbol}</span>
        <span className="nft-price">(${valueFormatter6(dollarPrice, {includeCommaSeparation: true,})})</span>
      </PriceDiv>
      </>
      }
      </>
    }
    {nft.sale.hasOwnProperty("sale_type") && nft.sale.sale_type == SALE_TYPE[1] &&
      <>
      {parseFloat(nft.price) > 0 &&
      <>
      <p className="price-title">Initial Price</p>
      <PriceDiv className="price-section">
        <Image alt="Token Icon" className="token-icon" src={nft.paymentToken.logoUri}/>
        <span className="token-balance">{nft.price}&nbsp;{nft.paymentToken.symbol}</span>
        <span className="nft-price">(${valueFormatter6(dollarPrice, {includeCommaSeparation: true,})})</span>
      </PriceDiv>
      </>
      }
      {nft.sale.requests.length > 0 &&
      <>
      <p className="price-title">Current Price</p>
      <PriceDiv className="price-section">
        <Image alt="Token Icon" className="token-icon" src={nft.paymentToken.logoUri}/>
        <span className="token-balance">{getRealTokenAmount({amount: nft.sale.requests[nft.sale.requests.length - 1].price, denom: nft.paymentToken.denom})}&nbsp;{nft.paymentToken.symbol}</span>
        <span className="nft-price">
          (<NftDollarPrice symbol={nft.paymentToken.symbol} amount={getRealTokenAmount({amount: nft.sale.requests[nft.sale.requests.length - 1].price, denom: nft.paymentToken.denom})}/>)</span>
      </PriceDiv>
      </>
      }
      </>
    }
    </>
  );
}

export function NftDollarPrice({symbol, amount}){
  const [tokenDollarPrice] = useTokenDollarValue(symbol)
  const [dollarPrice, setDollarPrice] = useState(0)
  
  useEffect(() => {
    console.log("price", amount * tokenDollarPrice)
    setDollarPrice(amount * tokenDollarPrice)
  }, [tokenDollarPrice, amount]);
  return (
    <>
      ${valueFormatter6(dollarPrice, {
              includeCommaSeparation: true,
            })}
    </>
  )
}

const PriceDiv = styled('div', {
  display: 'flex',
  gap: '$5',
  alignItems: 'center',
  ' .token-icon': {
    height: '$8',
  },
  ' .nft-price': {
    color: '$textColors$disabled',
  }
})