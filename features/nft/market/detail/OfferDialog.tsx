import * as React from "react"
import { useCallback, useEffect, useState } from "react"
import { styled } from 'components/theme'
import { Dialog, StyledCloseIcon } from 'components/Dialog'
import { Text } from 'components/Text'
import { Button } from 'components/Button'
import { DateRange } from "rsuite/DateRangePicker"
import { IconWrapper } from 'components/IconWrapper'
import { NftPrice } from 'components/NFT/nft-card/price'
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
  toMinDenom,
  SALE_TYPE,
  getFileTypeFromURL
} from "services/nft"
import { RELOAD_STATUS } from "store/types"
import { walletState } from 'state/atoms/walletAtoms'
import { useRecoilValue } from 'recoil'
import {
  ChakraProvider, 
  InputGroup,
  InputLeftAddon,
  Input,
  InputRightAddon,
  Image,
  Select
} from '@chakra-ui/react'
import DatePicker from 'rsuite/DatePicker';
import { NftDollarPrice } from 'components/NFT/nft-card/price'
import { toast } from 'react-toastify'
import { useDispatch, useSelector } from "react-redux"
import { State } from 'store/reducers'
import { fromBase64, toBase64 } from '@cosmjs/encoding'

interface DetailParams {
  readonly collectionId: string
  readonly id: string
}
const PUBLIC_MARKETPLACE = process.env.NEXT_PUBLIC_MARKETPLACE || ''
let today = new Date()
type OfferDialogProps = {
  isShowing: boolean
  onRequestClose: () => void
  collectionId: string
  id: string
}

export const OfferDialog = ({ 
  isShowing,
  onRequestClose,
  collectionId, 
  id
}:OfferDialogProps) => {
  const { client } = useSdk()
  const { address, client: signingClient } = useRecoilValue(walletState)
  const dispatch = useDispatch()
  const [nft, setNft] = useState<NftInfo>(
    {'tokenId': id, 'address': '', 'image': '', 'name': '', 'user': '', 'price': '0', 'total': 2, 'collectionName': "", 'symbol': 'MARBLE', 'sale': {}, 'paymentToken': {}, "type": "image", "created": "", "collectionId": 0 }
  )
  const [isChecking, setIsChecking] = useState(false)
  const [fee, setFee] = useState(1)
  const [supply, setSupply] = useState(1)
  const [sellType, setSellType] = useState(SALE_TYPE[0])
  const [quantity, setQuantity] = useState(1)
  const [amount, setAmount] = useState(0)  
  const [duration, setDuration] = useState<DateRange>([today, new Date(today.getFullYear(), today.getMonth(), today.getDate()+7)])
  
  const reloadData = useSelector((state: State) => state.reloadData)
  const { reload_status } = reloadData

  const handleQuantityChange = (event) => {
    setQuantity(event.target.value)
  }
  const handleAmountChange = (event) => {
    setAmount(event.target.value)
  }
  const loadNft = useCallback(async () => {
    if (!client) return
    if (collectionId === undefined || collectionId == "[collection]" || id === undefined || id == "[id]" || id=="")
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
    //setSupply(res_collection.supply==undefined?1:parseInt(res_collection.supply))
    //console.log("supply:", res_collection.supply)
    setFee(res_collection.earningFee)
  
  }, [client])

  useEffect(() => {
    
    loadNft()
  }, [loadNft, collectionId, id]);

  useEffect(() => {
    console.log("duration:", duration)
  }, [duration]);
  const proposeNFT = async(e) => {
    let minAmount = nft.sale.initial_price
    if (nft.sale.requests.length > 0){
      minAmount = nft.sale.requests[nft.sale.requests.length - 1].price
    }
    if (amount < getRealTokenAmount({amount: minAmount, denom: nft.paymentToken.denom})){
      toast.warning(
        `The offer price should be greater than ${nft.price}.`,
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
      return
    }
    setIsChecking(true)
    const marketContract = Market(PUBLIC_MARKETPLACE).use(client)
    let collection = await marketContract.collection(Number(collectionId))
    const collectionContract = Collection(collection.collection_address).useTx(signingClient)
    let msg:any
    if (nft.paymentToken.type == "cw20"){
      msg = {"propose":{"token_id": Number(id)}}
      let encodedMsg: string = toBase64(new TextEncoder().encode(JSON.stringify(msg)))
      let buy = await collectionContract.buy(address, nft.paymentToken.address, parseInt(toMinDenom(amount, nft.paymentToken.denom)).toString(), encodedMsg)
    }else{
      msg = {"propose":{"token_id": Number(id), "denom": nft.paymentToken.denom}}
      let buy = await collectionContract.propose(address, Number(id), parseInt(toMinDenom(amount, nft.paymentToken.denom)).toString(), nft.paymentToken.denom)
    }

    dispatch(
      {
        type: RELOAD_STATUS,
        payload: reload_status + 1
      }
    )
    toast.success(
      `You have offered this NFT successfully.`,
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
    setIsChecking(false)
  }
  return (
    <ChakraProvider>
      {nft.name!="" &&
      <Dialog isShowing={isShowing} onRequestClose={onRequestClose} kind="blank">
        <StyledCloseIcon onClick={onRequestClose} offset={19} size="16px" />
        <StyledDivForContent>
          <Text
            variant="header"
          >
            Make an offer
          </Text>
          
          <ItemDiv className="hide">
            <h4>Quantity</h4>
            <Input
                  type='number'
                  placeholder=''
                  value={quantity} onChange={handleQuantityChange}
                />
          </ItemDiv>
          <ItemDiv>
            <h4>Current Price per item</h4>
            <InputGroup size='sm'>
              {nft.sale.requests.length > 0 && 
                <InputLeftAddon 
                  children={
                      <TokenContainer>
                      <Image alt="Token Icon" className="token-icon" src={nft.paymentToken.logoUri}/>
                        <span className="token-balance">{getRealTokenAmount({amount: nft.sale.requests[nft.sale.requests.length - 1].price, denom: nft.paymentToken.denom})}</span>
                      {nft.paymentToken.symbol}&nbsp;
                      (<NftDollarPrice symbol={nft.paymentToken.symbol} amount={getRealTokenAmount({amount: nft.sale.requests[nft.sale.requests.length - 1].price, denom: nft.paymentToken.denom})}/>)
                      </TokenContainer>
                    }
                />
              }
              {nft.sale.requests.length == 0 && 
                <InputLeftAddon 
                  children={
                      <TokenContainer>
                      <Image alt="Token Icon" className="token-icon" src={nft.paymentToken.logoUri}/>
                      <span className="token-balance">{getRealTokenAmount({amount: nft.sale.initial_price, denom: nft.paymentToken.denom})}</span>
                      {nft.paymentToken.symbol}&nbsp;
                      (<NftDollarPrice symbol={nft.paymentToken.symbol} amount={getRealTokenAmount({amount: nft.sale.initial_price, denom: nft.paymentToken.denom})}/>)
                      </TokenContainer>
                    }
                />
              }
            </InputGroup>
          </ItemDiv>
          <ItemDiv>
            <h4>Price per item</h4>
            <InputGroup size='sm'>
              <InputLeftAddon 
                children={
                    <TokenContainer>
                    <Image alt="Token Icon" className="token-icon" src={nft.paymentToken.logoUri}/>{nft.paymentToken.symbol}
                    </TokenContainer>
                  }
              />
              <Input type="number" placeholder='Amount' value={amount} onChange={handleAmountChange}/>
              <InputRightAddon children={<NftDollarPrice symbol={nft.paymentToken.symbol} amount={amount}/>} />
            </InputGroup>
          </ItemDiv>
          <ItemDiv className="hide">
            <h4>Offer Expiration</h4>
            <DatePicker
              format="yyyy-MM-dd HH:mm"
              ranges={[
                {
                  label: 'Now',
                  value: new Date()
                }
              ]}
            />        
          </ItemDiv>
          <ActionContainer>
            <Button 
            disabled={isChecking}
            onClick={(e) => {
              
              proposeNFT(e)
            
            }}
            >
              Confirm checkout
            </Button>
          </ActionContainer>
        </StyledDivForContent>
        
        
      </Dialog> 
      } 
    </ChakraProvider>
  );
}
const Nft = styled('div', {
  display: 'flex',
})
const StyledDivForContent = styled('div', {
  padding: '0px $14',
  variants: {},
  'h4':{
    fontWeight: 'bold'
  }
})
const ItemHeaderDiv = styled('div', {
  display: 'flex',
  justifyContent: 'space-between',
  borderBottom: '$borderWidths$1 solid $borderColors$default',
  marginTop: '$16'
})
const ItemDiv = styled('div', {
  display: 'flex',
  padding: '$8 0',
  gap: '$4',
  flexDirection: 'column',
})
const TokenContainer = styled('div', {
  display: 'flex',
  gap: '$4',
  'img':{
    width: '$6',
  }
})
const NftMainContainer = styled('div', {
  'img':{
    width: '$11',
    border: '$borderWidths$1 solid $borderColors$default',
    borderRadius: '$2'
  }
})
const NftInfoContainer = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  

})
const NftPriceContainer = styled('div', {
  marginLeft: 'auto',
  '.token':{
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    textAlign: 'right',
    'img':{
      width: '$6'
    }
  },
  'p':{
    textAlign: 'right'
  }
  
})
const ItemFooterDiv = styled('div', {
  display: 'flex',
  justifyContent: 'space-between',
  borderTop: '$borderWidths$1 solid $borderColors$default',
  paddingTop: '$8'
})
const ActionContainer = styled('div', {
  display: 'flex',
  justifyContent: 'center',
  margin: '$10'
})