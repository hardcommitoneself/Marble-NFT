import {
  Image
} from "@chakra-ui/react"
import { useCallback, useEffect, useState } from "react"
import * as React from "react"
import { styled } from 'components/theme'
import { Button } from 'components/Button'
import { IconWrapper } from 'components/IconWrapper'
import { Credit } from 'icons'
import { NftPrice } from './price'
import Link from 'next/link'
import { useRecoilValue, useSetRecoilState } from 'recoil'
import { walletState, WalletStatusType } from 'state/atoms/walletAtoms'
import { toast } from 'react-toastify'
import { useDispatch, useSelector } from "react-redux"
import { State } from 'store/reducers'
import { setBuyData } from "store/actions/buyAction"
import { setOfferData } from "store/actions/offerAction"
import { 
  BUY_STATUS,
  OFFER_STATUS
} from "store/types"
import {
  NftInfo,
  CW721,
  Collection,
  Market,
  useSdk,
  getRealTokenAmount,
  toMinDenom,
  PaymentToken,
  SALE_TYPE,
  
} from "services/nft"

import { Dispatch, AnyAction } from "redux"
import { BuyDialog } from 'features/nft/market/detail/BuyDialog'
import { OfferDialog } from 'features/nft/market/detail/OfferDialog'
interface NftCardProps {
  readonly nft: NftInfo
  readonly type: string
}
export function NftAuctionTime(start:number, end:number){
  const [startTime, setStartTime] = useState(0)
  const [endTime, setEndTime] = useState(0)
  useEffect(() => {
    setStartTime(start)
    setEndTime(end)
  }, [start, end])
  return (
    <>
    <p>
    {startTime}
    </p>
    <p>
    {endTime}
    </p>
    </>
  )
}

export function NftCard({ nft, type }: NftCardProps): JSX.Element {
  const { client } = useSdk()
  const { address, client: signingClient } = useRecoilValue(walletState)
  const [time, setTime] = useState(Math.round(new Date().getTime())/1000)
  const [isDisabled, setIsDisabled] = useState(false)
  const dispatch = useDispatch()
  const buyData = useSelector((state: State) => state.buyData)
  const { buy_status } = buyData
  const offerData = useSelector((state: State) => state.offerData)
  const { offer_status } = offerData
  const [reloadNft, setReloadNft] = useState(0)
  const reloadData = useSelector((state: State) => state.reloadData)
  const { reload_status } = reloadData
  
  const [isBuyShowing, setIsBuyShowing] = useState(false)
  const [buyId, setBuyId] = useState("")
  const [isOfferShowing, setIsOfferShowing] = useState(false)
  const [offerId, setOfferId] = useState("")

  const showBuyDialog = async(e) => {
    e.preventDefault()
    // dispatch(
    //   {
    //     type: BUY_STATUS,
    //     payload: nft.tokenId
    //   }
    // )
    setBuyId(nft.tokenId)
    setIsBuyShowing(true)
    let reloadNftCnt = reloadNft + 1
    setReloadNft(reloadNftCnt)
    return false
  }
  const showOfferDialog = async(e) => {
    e.preventDefault()
    // dispatch(
    //   {
    //     type: OFFER_STATUS,
    //     payload: nft.tokenId
    //   }
    // )
    setOfferId(nft.tokenId)
    setIsOfferShowing(true)
    let reloadNftCnt = reloadNft + 1
    setReloadNft(reloadNftCnt)
    return false
  }
  const cancelSale = async(e) => {
    e.preventDefault()
    setIsDisabled(true)
    const marketContract = Market(process.env.NEXT_PUBLIC_MARKETPLACE).use(client)
    let collection = await marketContract.collection(Number(nft.collectionId))
    const collectionContract = Collection(collection.collection_address).useTx(signingClient)
    let cancel = await collectionContract.cancelSale(address, Number(nft.tokenId))
    
    toast.success(
      `You have cancelled this NFT successfully.`,
      {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      }
    )
    setIsDisabled(false)
    nft.paymentToken = {}
    nft.price = "0"
    let reloadNftCnt = reloadNft + 1
    setReloadNft(reloadNftCnt)
    return false
  }
  const acceptSale = async(e) => {
    e.preventDefault()
    setIsDisabled(true)
    const marketContract = Market(process.env.NEXT_PUBLIC_MARKETPLACE).use(client)
    let collection = await marketContract.collection(Number(nft.collectionId))
    const collectionContract = Collection(collection.collection_address).useTx(signingClient)
    let accept = await collectionContract.acceptSale(address, Number(nft.tokenId))
    
    toast.success(
      `You have accepted this NFT Auction successfully.`,
      {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      }
    )
    setIsDisabled(false)
    nft.paymentToken = {}
    nft.price = "0"
    let reloadNftCnt = reloadNft + 1
    setReloadNft(reloadNftCnt)
    return false
  }
  
  useEffect(() => {
  }, [reloadNft])
  
  useEffect(() => {
    (async () => {
      
      const response = await fetch(process.env.NEXT_PUBLIC_COLLECTION_TOKEN_LIST_URL)
      const paymentTokenList = await response.json()
      let paymentTokensAddress = []
      for (let i = 0; i < paymentTokenList.tokens.length; i++){
        paymentTokensAddress.push(paymentTokenList.tokens[i].address)
      }

      const marketContract = Market(process.env.NEXT_PUBLIC_MARKETPLACE).use(client)
      let collection = await marketContract.collection(Number(nft.collectionId))
      const cwCollectionContract = Collection(collection.collection_address).use(client)
      const cw721Contract = CW721(collection.cw721_address).use(client)
      let sales:any = await cwCollectionContract.getSales()
      let saleIds = []
      for (let i=0; i<sales.length; i++){
        saleIds.push(sales[i].token_id)
      }

      nft.paymentToken = {}
      nft.price = "0"
      nft.symbol = "Marble"
      nft.sale = {}
      nft.user = await cw721Contract.ownerOf(nft.tokenId)
      if (saleIds.indexOf(parseInt(nft.tokenId)) != -1){
        let sale = sales[saleIds.indexOf(parseInt(nft.tokenId))]
        let paymentToken: any
        if (sale.denom.hasOwnProperty("cw20")){
          paymentToken = paymentTokenList.tokens[paymentTokensAddress.indexOf(sale.denom.cw20)]
        }else{
          paymentToken = paymentTokenList.tokens[paymentTokensAddress.indexOf(sale.denom.native)]
        }
        nft.symbol = paymentToken.symbol
        nft.paymentToken = paymentToken
        nft.price = getRealTokenAmount({amount: sale.initial_price, denom: paymentToken.denom}).toString()
        nft.user = sale.provider
        nft.sale = sale
      }
      let reloadNftCnt = reloadNft + 1
      setReloadNft(reloadNftCnt)
    })();
  }, [dispatch, reload_status])
  
  return (
    <NftCardDiv className="nft-card">
      {buyId != "" && 
        <BuyDialog 
          isShowing={isBuyShowing}
          onRequestClose={() => {
            setIsBuyShowing(false)
            setBuyId("")
            
          }}
          collectionId={nft.collectionId.toString()}
          id={buyId}
        />
      }
      {offerId != "" && 
        <OfferDialog 
          isShowing={isOfferShowing}
          onRequestClose={() => {
            setIsOfferShowing(false)
            setOfferId("")
            
          }}
          collectionId={nft.collectionId.toString()}
          id={offerId}
        />
      }
      <Link href={`/nft/${nft.collectionId}/${nft.tokenId}`} passHref >
      <ImgDiv className="nft-img-url">
        
        {nft.type == 'image' &&
        <Image src={nft.image} alt="NFT Image"/>
        }
        {nft.type == 'video' &&
        <video controls>
          <source src={nft.image}/>
        </video>
        }
        {nft.type == 'audio' &&
        <audio controls>
          <source src={nft.image}/>
        </audio>
        }
      </ImgDiv>
      </Link>
      <TextDiv className="nft-card-info">
        <Link href={`/nft/${nft.collectionId}/${nft.tokenId}`} passHref >
        <h2>
          {nft.name}
          {(nft.collectionId == 3 || nft.collectionId == 4) && 
            <span> #{nft.tokenId}</span>
          }
        </h2>
        </Link>
        <h5>{nft.collectionName}</h5>
        {parseFloat(nft.price) > 0 &&
        <NftPrice nft={nft}/>
        }
        {/* {address!="" && address!=nft.user && parseFloat(nft.price) > 0 && nft.sale.sale_type == SALE_TYPE[0] &&
          <Button className="btn-buy btn-default"
            css={{
              'background': '$black',
              'color': '$white',
              'stroke': '$white',
            }}
            iconLeft={<IconWrapper icon={<Credit />} />}
            variant="primary"
            size="large"
            onClick={(e) => {
              e.preventDefault()
              showBuyDialog(e)
              return false
            }}
          >
            Buy Now
          </Button>
        }
        {address==nft.user && parseFloat(nft.price) > 0 && !nft.sale.can_accept &&
          <>
          {parseFloat(nft.price) > 0 && 
          nft.sale.sale_type == SALE_TYPE[1] && 
          nft.sale.duration_type.Time[0] >=time && 
            <>
            <p>Auction Start</p>
            {new Date(nft.sale.duration_type.Time[0]).toString()}
            </>
          }
          <Button className="btn-buy btn-default"
          css={{
            'background': '$black',
            'color': '$white',
            'stroke': '$white',
          }}
          iconLeft={<IconWrapper icon={<Credit />} />}
          variant="primary"
          size="large"
          disabled={isDisabled}
          onClick={(e) => {
            e.preventDefault()
            cancelSale(e)
            return false
          }}
        >
          Cancel
        </Button>
          </>
        }
        {address==nft.user && parseFloat(nft.price) > 0 && nft.sale.can_accept &&
          <Button className="btn-buy btn-default"
          css={{
            'background': '$black',
            'color': '$white',
            'stroke': '$white',
          }}
          iconLeft={<IconWrapper icon={<Credit />} />}
          variant="primary"
          size="large"
          disabled={isDisabled}
          onClick={(e) => {
            e.preventDefault()
            acceptSale(e)
            return false
          }}
        >
          Accept
        </Button>
        }
        {address==nft.user && parseFloat(nft.price) == 0 &&
          <Link href={`/nft/${id}/${nft.tokenId}/sell`} passHref>
          <Button className="btn-buy btn-default"
            css={{
              'background': '$black',
              'color': '$white',
              'stroke': '$white',
            }}
            iconLeft={<IconWrapper icon={<Credit />} />}
            variant="primary"
            size="large"
          >
            Sell
          </Button>
          </Link>
        }
        
        {address!=nft.user && parseFloat(nft.price) > 0 && 
        nft.sale.sale_type == SALE_TYPE[1] && 
        nft.sale.duration_type.Time[0] <=time && 
        nft.sale.duration_type.Time[1] >= time &&
          <Button className="btn-buy btn-default"
            css={{
              'background': '$black',
              'color': '$white',
              'stroke': '$white',
            }}
            iconLeft={<IconWrapper icon={<Credit />} />}
            variant="primary"
            size="large"
            onClick={(e) => {
              e.preventDefault()
              showOfferDialog(e)
              return false
            }}
          >
            Offer
          </Button>
        } */}
        
      </TextDiv>
    </NftCardDiv>
  );
}

const NftCardDiv = styled('div', {
  
})

const ImgDiv = styled('div', {
  
  ' img':{
    borderTopLeftRadius: '$4',
    borderTopRightRadius: '$4',
    width: '100%',
  }
})
const TextDiv = styled('div', {
  padding: '$4 $12 $12 $12',
  ' h2':{
    fontWeight: 'bold',
  },
  ' h5':{
    color: '$textColors$disabled',
    ' span':{
      
    },
    ' a':{
      color: '$link',
    },
  },
  ' p':{
    '&.price-title':{
      marginTop: '$4',
      color: '$link',
    },
    color: '$textColors$disabled',
  },
  ' .btn-buy':{
    marginTop: '$4',
    padding: '$4 $12',
    fontWeight: 'normal',
  },
  ' .btn-sell':{
    '&.disabled':{
      background: '$backgroundColors$tertiary',
      color: '$gray',
    }
  }
})
