import * as React from "react";
import { useCallback, useEffect, useState } from "react";
import { styled } from 'components/theme'
import { Button } from 'components/Button'
import { IconWrapper } from 'components/IconWrapper'
import { NftPrice, NftDollarPrice } from 'components/NFT/nft-card/price'
import { LoadingProgress } from 'components/LoadingProgress'
import { User, CopyNft, Heart, Clock, Package, Credit } from 'icons'
import { useHistory, useParams } from "react-router-dom";
import Link from 'next/link'
import {
  NftInfo,
  CW721,
  Collection,
  Market,
  useSdk,
  getRealTokenAmount,
  PaymentToken,
  SALE_TYPE,
  getFileTypeFromURL
} from "services/nft"
import { walletState } from 'state/atoms/walletAtoms'
import { useRecoilValue } from 'recoil'
import {
  ChakraProvider,
  Image,
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
  CircularProgress
} from '@chakra-ui/react'
import { BuyDialog } from 'features/nft/market/detail/BuyDialog'
import { OfferDialog } from 'features/nft/market/detail/OfferDialog'
import { useDispatch, useSelector } from "react-redux"
import { State } from 'store/reducers'
import { toast } from 'react-toastify'

interface DetailParams {
  readonly collectionId: string
  readonly id: string
}
const PUBLIC_MARKETPLACE = process.env.NEXT_PUBLIC_MARKETPLACE || ''
export const NFTDetail = ({ collectionId, id}) => {
  const { client } = useSdk()
  const { address, client: signingClient } = useRecoilValue(walletState)
  const dispatch = useDispatch()
  const reloadData = useSelector((state: State) => state.reloadData)
  const { reload_status } = reloadData
  const [reloadCount, setReloadCount] = useState(0)
  const [isDisabled, setIsDisabled] = useState(false)

  const [time, setTime] = useState(Math.round(new Date().getTime()/1000))

  const [nft, setNft] = useState<NftInfo>(
    {'tokenId': id, 'address': '', 'image': '', 'name': '', 'user': '', 'price': '0', 'total': 2, 'collectionName': "", 'symbol': 'Marble', 'sale':{}, 'paymentToken': {}, 'type': 'image', "created": "", "collectionId": 0}
  )
  const [isBuyShowing, setIsBuyShowing] = useState(false)
  const [isOfferShowing, setIsOfferShowing] = useState(false)
  
  const loadNft = useCallback(async () => {
    if (!client) return
    if (collectionId === undefined || collectionId == "[collection]" || id === undefined || id == "[id]")
      return false
    
    const marketContract = Market(PUBLIC_MARKETPLACE).use(client)
    let collection = await marketContract.collection(parseInt(collectionId))
    let ipfs_collection = await fetch(process.env.NEXT_PUBLIC_PINATA_URL + collection.uri)
    let res_collection = await ipfs_collection.json()
    const cw721Contract = CW721(collection.cw721_address).use(client)
    let nftInfo = await cw721Contract.nftInfo(id)
    
    let ipfs_nft = await fetch(process.env.NEXT_PUBLIC_PINATA_URL + nftInfo.token_uri)
    let res_nft = await ipfs_nft.json()
    let nft_type = await getFileTypeFromURL(process.env.NEXT_PUBLIC_PINATA_URL + res_nft["uri"])
    res_nft['type'] = nft_type.fileType
    res_nft["created"] = res_nft["owner"]
    res_nft["owner"] = await cw721Contract.ownerOf(id)
    
    const collectionContract = Collection(collection.collection_address).use(client)
    let sales:any = await collectionContract.getSales()
    let saleIds = []
    for (let i=0; i<sales.length; i++){
      saleIds.push(sales[i].token_id)
    }
    const response = await fetch(process.env.NEXT_PUBLIC_COLLECTION_TOKEN_LIST_URL)
    const paymentTokenList = await response.json()
    let paymentTokensAddress = []
    for (let i = 0; i < paymentTokenList.tokens.length; i++){
      paymentTokensAddress.push(paymentTokenList.tokens[i].address)
    }
    res_nft["owner"] = await cw721Contract.ownerOf(id)
    if (saleIds.indexOf(parseInt(id)) != -1){
      let sale = sales[saleIds.indexOf(parseInt(id))]
      let paymentToken: any
      if (sale.denom.hasOwnProperty("cw20")){
        paymentToken = paymentTokenList.tokens[paymentTokensAddress.indexOf(sale.denom.cw20)]
      }else{
        paymentToken = paymentTokenList.tokens[paymentTokensAddress.indexOf(sale.denom.native)]
      }
      res_nft["symbol"] = paymentToken.symbol
      res_nft["paymentToken"] = paymentToken
      res_nft["price"] = getRealTokenAmount({amount: sale.initial_price, denom: paymentToken.denom})
      res_nft["owner"] = sales[saleIds.indexOf(parseInt(id))].provider
      res_nft["sale"] = sales[saleIds.indexOf(parseInt(id))]
      res_nft["owner"] = sale.provider
    }else{
      res_nft["price"] = 0
      res_nft["sale"] = {}
    }
    let uri = res_nft.uri
    if (uri.indexOf("https://") == -1){
      uri = process.env.NEXT_PUBLIC_PINATA_URL + res_nft.uri
    }
    setNft({
      'tokenId': id, 
      'address': '', 
      'image': uri, 
      'name': res_nft.name, 
      'user': res_nft.owner, 
      'price': res_nft.price, 
      'total': 1, 
      'collectionName': res_collection.name, 
      'symbol': res_collection.tokens[0], 
      'sale': res_nft.sale,
      'paymentToken': res_nft.paymentToken,
      'type': res_nft.type,
      'created': res_nft.created,
      'collectionId': parseInt(collectionId)
    })
    console.log("sale", res_nft["sale"])
  }, [client])
  useEffect(() => {
    loadNft()
  }, [loadNft, collectionId, id, reloadCount]);

  useEffect(() => {
    let rCount = reloadCount + 1
    setReloadCount(rCount)

  }, [dispatch, reload_status])

  const cancelSale = async(e) => {
    e.preventDefault()
    setIsDisabled(true)
    const marketContract = Market(process.env.NEXT_PUBLIC_MARKETPLACE).use(client)
    let collection = await marketContract.collection(Number(collectionId))
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
    nft.sale = {}
    let rCount = reloadCount + 1
    setReloadCount(rCount)
    return false
  }
  const acceptSale = async(e) => {
    e.preventDefault()
    setIsDisabled(true)
    const marketContract = Market(process.env.NEXT_PUBLIC_MARKETPLACE).use(client)
    let collection = await marketContract.collection(Number(collectionId))
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
    nft.sale = {}
    let rCount = reloadCount + 1
    setReloadCount(rCount)
    return false
  }
  useEffect(() => {
  }, [reloadCount])

  return (
    <ChakraProvider>
    <NFTContainer>
      { parseFloat(nft.price) > 0 && nft.sale.sale_type == SALE_TYPE[0] &&
      <BuyDialog 
        isShowing={isBuyShowing}
        onRequestClose={() => setIsBuyShowing(false)}
        collectionId={collectionId}
        id={id}
      />
      }
      { parseFloat(nft.price) > 0 && nft.sale.sale_type == SALE_TYPE[1] &&
      <OfferDialog 
        isShowing={isOfferShowing}
        onRequestClose={() => setIsOfferShowing(false)}
        collectionId={collectionId}
        id={id}
      />
      }
      {nft.name!="" && 
      <Nft className="nft-info">
          
          <NftUriTag className="nft-uri">
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
          
          </NftUriTag>
          <NftInfoTag className="nft-detail">
            <h2 className="nft-title">
              {nft.name}
              {(collectionId == 3 || collectionId == 4) &&  
                <span> #{nft.tokenId}</span>
              }
            </h2>
            <Link href={`/collection/${collectionId}`} passHref>{nft.collectionName}</Link>
            <NftMeta className="nft-meta">
              <Button className="nft-meta-link"
                as="a"
                variant="ghost"
                iconLeft={<IconWrapper icon={<User />} />}
                title={nft.user}
              >
                <span className="owner-address">Owned by {nft.user}</span>
              </Button>
            </NftMeta>
            <NftBuyOfferTag className="nft-buy-offer">
              {/* { nft.sale.sale_type == SALE_TYPE[1] && 
              <>
              {nft.sale.duration_type.Time[0] >=time && 
              <NftSale className="disabled">
                <IconWrapper icon={<Clock />}/>
                Auction Start Time: {new Date(nft.sale.duration_type.Time[0]).toString()}
              </NftSale>
              }
              {nft.sale.duration_type.Time[0] <=time && nft.sale.duration_type.Time[1] >=time &&
              <NftSale>
                <IconWrapper icon={<Clock />}/>
                {new Date(nft.sale.duration_type.Time[0]).toString()}<br/>{new Date(nft.sale.duration_type.Time[1]).toString()}
              </NftSale>
              }
              </>
              } */}
              <PriceTag>
                {parseFloat(nft.price) > 0 && 
                  <NftPrice nft={nft}/>
                }
                {/* <ButtonGroup>
                {nft.user == address && parseFloat(nft.price) == 0 &&
                  <OwnerAction>
                    <Link href={`/nft/${collectionId}/${id}/sell`} passHref>
                    <Button
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
                  </OwnerAction>
                }
                {nft.user == address && parseFloat(nft.price) > 0 && !nft.sale.can_accept &&
                  <OwnerAction>
                    <Button
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
                  </OwnerAction>
                }
                {nft.user == address && parseFloat(nft.price) > 0 && nft.sale.can_accept &&
                  <OwnerAction>
                    <Button
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
                  </OwnerAction>
                }
                {address!="" && nft.user != address && parseFloat(nft.price) > 0 && nft.sale.sale_type == SALE_TYPE[0] &&
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
                      setIsBuyShowing(true)
                      return false
                    }}
                  >
                    Buy Now
                  </Button>
                }
                {address!="" && nft.user != address && 
                parseFloat(nft.price) > 0 && 
                nft.sale.sale_type == SALE_TYPE[1] &&
                nft.sale.duration_type.Time[0] <=time && 
                nft.sale.duration_type.Time[1] >= time &&
                  <Button className="btn-offer btn-default"
                    css={{
                      'background': '$white',
                      'color': '$textColors$primary',
                      'stroke': '$white',
                    }}
                    iconLeft={<IconWrapper icon={<Credit />} />}
                    variant="primary"
                    size="large"
                    onClick={(e) => {
                      setIsOfferShowing(true)
                      return false
                    }}
                  >
                    Offer
                  </Button>
                }
                </ButtonGroup> */}
              </PriceTag>
            </NftBuyOfferTag>
            {/* { parseFloat(nft.price) > 0 && nft.sale.sale_type == SALE_TYPE[1] && 
            <NftOfferTag className="nft-offer">
              <TableTitle className="offer-title">
                <IconWrapper icon={<Package />} />Offers
              </TableTitle>
              <TableContainer>
                <Table variant='simple'>
                  <Thead>
                    <Tr>
                      <Th>Unit Price</Th>
                      <Th>USD Unit Price</Th>
                      <Th>From</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {nft.sale.requests.map((offer, idx)=>{
                        return (
                          <Tr>
                            <Td>{getRealTokenAmount({amount: offer.price, denom: nft.paymentToken.denom})}</Td>
                            <Td><NftDollarPrice symbol={nft.symbol} amount={getRealTokenAmount({amount: offer.price, denom: nft.paymentToken.denom})}/></Td>
                            <Td>{offer.address}</Td>
                          </Tr>
                        )
                      })
                    }
                  </Tbody>
                </Table>
              </TableContainer>
            </NftOfferTag> 
            } */}
          </NftInfoTag>

      </Nft>
      }
      {nft.name=="" && 
        <LoadingProgress/>
      }
    </NFTContainer>
    </ChakraProvider>
  );
}
const NFTContainer = styled('div', {
})
const Nft = styled('div', {
  display: 'flex',
})
const NftUriTag = styled('div', {

  ' img':{
    borderRadius: '$4',
  }
})
const NftInfoTag = styled('div', {
  margin: '0 auto',
  ' .nft-title':{
    marginTop: '0px',
  },
  '>a':{
    color: '$colors$link',
  }
})
const NftMeta = styled('div', {
  display: 'flex',
  marginTop: '$4',
  ' .nft-meta-link': {
    color: '$colors$nft',
    paddingLeft: '0px',
    fontWeight: 'normal',
    '>span': {
      paddingLeft: '0px',
      justifyContent: 'left',
      ' svg': {
        width: '20px',
        height: '20px',
      }
    },
    '.owner-address': {
      overflowWrap: 'break-word',
      width: '100%',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    }
  }
})
const NftBuyOfferTag = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  border: '1px solid $borderColors$default',
  borderRadius: '$2',
  marginTop: '$16',
})
const NftSale = styled('div', {
  display: 'flex',
  padding: '$12 $16',
  alignItems: 'center',
  gap: '$4',
  borderBottom: '1px solid $borderColors$default',
  '&.disabled': {
    color: '$textColors$disabled',
  }
})
const PriceTag = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  padding: '$12 $16',
  ' .price-title':{
    color: '$colors$link',
  }
})
const ButtonGroup = styled('div', {
  display: 'flex',
  gap: '$8',
  marginTop: '$space$10',
  ' .btn-buy': {
    padding: '$space$10 $space$14',
    ' svg': {
      borderRadius: '2px',
    }
  },
  ' .btn-offer': {
    padding: '$space$10 $space$14',
    border: '$borderWidths$1 solid $black',
    color: '$black',
    '&:hover':{
      background: '$white',
      color: '$textColors$primary',
      stroke: '$white',
    },
    ' svg': {
      border: '$borderWidths$1 solid $black',
      borderRadius: '2px',
    }
  }
})
const NftOfferTag = styled('div', {
  border: '1px solid $borderColors$default',
  borderRadius: '$2',
  marginTop: '$16',
  ' table': {
    width: '100%',
    borderCollapse: 'collapse',
    ' thead': {
      ' tr': {
        ' th': {
          textAlign: 'left',
          padding: '$space$14 $space$16',
        },
      },
    },
    ' tbody': {
      ' tr': {
        borderTop: '$borderWidths$1 solid $borderColors$default',
        ' td': {
          textAlign: 'left',
          padding: '$space$14 $space$16',
        },
      },
    },
    ' .from-link': {
      color: '$link',
    }
  }

})
const TableTitle = styled('div', {
  display: 'flex',
  padding: '$space$14 $space$16',
  gap: '$4',
  borderBottom: '1px solid $borderColors$default',
  alignItems: 'center'
})
const OwnerAction = styled('div', {

})
