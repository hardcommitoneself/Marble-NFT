import * as React from "react"
import { useCallback, useEffect, useState } from "react"
import { styled } from 'components/theme'
import { Button } from 'components/Button'
import { DateRange } from "rsuite/DateRangePicker"
import { IconWrapper } from 'components/IconWrapper'
import { LoadingProgress } from 'components/LoadingProgress'
import { Auction, ArrowSlash, ArrowDown, Info } from 'icons'
import { useHistory, useParams } from "react-router-dom";
import Link from 'next/link'
import {
  NftInfo,
  CW721,
  Collection,
  Market,
  useSdk,
  toMinDenom,
  DurationType,
  PaymentToken,
  getRealTokenAmount,
  SALE_TYPE,
  getFileTypeFromURL
} from "services/nft"
import { walletState } from 'state/atoms/walletAtoms'
import { useRecoilValue } from 'recoil'
import {
  ChakraProvider, 
  Input,
  Image,
  Select,
  Switch,
  Tooltip,
} from '@chakra-ui/react'
import DateRangePicker from 'rsuite/DateRangePicker';
import { toast } from 'react-toastify'
import { fromBase64, toBase64 } from '@cosmjs/encoding'
import { NftDollarPrice } from 'components/NFT/nft-card/price'

interface DetailParams {
  readonly collectionId: string
  readonly id: string
}
const PUBLIC_MARKETPLACE = process.env.NEXT_PUBLIC_MARKETPLACE || ''

let today = new Date()
export const NFTSell = ({ collectionId, id}) => {
  const { client } = useSdk()
  const { address, client: signingClient } = useRecoilValue(walletState)

  const [isJsonUploading, setJsonUploading] = useState(false)

  const [nft, setNft] = useState<NftInfo>(
    {'tokenId': id, 'address': '', 'image': '', 'name': '', 'user': '', 'price': '0', 'total': 2, 'collectionName': "", 'symbol': 'MARBLE', 'sale': {}, 'paymentToken': {}, "type": "image", "created": "", "collectionId": 0 }
  )
  const [royalties, setRoyalties] = useState([{address:'', rate: 0}])
  const [inputFields, setInputFields] = useState([{address:'', rate: 0}])
  const [paymentTokens, setPaymentTokens] = useState<PaymentToken[]>()
  const [price, setPrice] = useState("")
  const [priceDollar, setPriceDollar] = useState("")
  const [sellingPrice, setSellingPrice] = useState("")
  const [isReserve, setIsReserve] = useState(false)
  const [isReserverPrice, setIsReserverPrice] = useState(false)
  const [reserve, setReserve] = useState("")
  const [reserverPrice, setReserverPrice] = useState("")

  const [maximumRoyaltyFee, setMaximumRoyaltyFee] = useState(1)
  const [supply, setSupply] = useState("1")
  const [sellType, setSellType] = useState(SALE_TYPE[0])
  const [method, setMethod] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [errorMsg, setErrorMsg] = useState("")

  const [duration, setDuration] = useState<DateRange>([today, new Date(today.getFullYear(), today.getMonth(), today.getDate()+7)])

  const [isPriceOpen, setIsPriceOpen] = useState(false)
  const togglingPrice = () => setIsPriceOpen(!isPriceOpen)
  const [priceSelectedOption, setPriceSelectedOption] = useState(0)
  const [isSellingPriceOpen, setIsSellingPriceOpen] = useState(false)
  const togglingSellingPrice = () => setIsSellingPriceOpen(!isSellingPriceOpen)
  const [sellingPriceSelectedOption, setSellingPriceSelectedOption] = useState(0)
  const [isReserverPriceOpen, setIsReserverPriceOpen] = useState(false)
  const togglingReserverPrice = () => setIsReserverPriceOpen(!isReserverPriceOpen)
  const [reserverPriceSelectedOption, setReserverPriceSelectedOption] = useState(0)
  const onPriceOptionClicked = value => () => {
    setPriceSelectedOption(value)
    setIsPriceOpen(false)
  }
  const onSellingPriceOptionClicked = value => () => {
    setSellingPriceSelectedOption(value)
    setIsSellingPriceOpen(false)
    setReserverPriceSelectedOption(value)
    setIsReserverPriceOpen(false)
  }
  const onReserverPriceOptionClicked = value => () => {
    setSellingPriceSelectedOption(value)
    setIsSellingPriceOpen(false)
    setReserverPriceSelectedOption(value)
    setIsReserverPriceOpen(false)
  }

  const handlePriceChange = (event) => {
    setPrice(event.target.value)
  }
  const handleSellingPriceChange = (event) => {
    setSellingPrice(event.target.value)
  }
  const handleMethodChange = (event) => {
    setMethod(event.target.value)
  }
  const handleQuantityChange = (event) => {
    setQuantity(event.target.value)
  }
  const handleReserveChange = (event) => {
    setReserve(event.target.value)
  }
  const handleReserverPriceChange = (event) => {
    let rp = parseFloat(event.target.value)
    if (rp <= parseFloat(sellingPrice)){
      setErrorMsg("X Reserve price must be greater than starting price") 
    }else{
      setErrorMsg("")
    }
    setReserverPrice(event.target.value)
  }
  const addInputField = ()=>{
    setInputFields([...inputFields, {
        address:'',
        rate: 0
    } ])
  }
  const removeInputFields = (index)=>{
    const rows = [...inputFields]
    rows.splice(index, 1)
    setInputFields(rows)
  }
  const handleChange = (index, evnt)=>{
    const { name, value } = evnt.target
    const list = [...inputFields]
    list[index][name] = value
    setInputFields(list)
  }
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
    if (res_collection.hasOwnProperty("royalties"))
      setRoyalties(res_collection.royalties)
    const collectionContract = Collection(collection.collection_address).use(client)
    let sales:any = await collectionContract.getSales()
    let saleIds = []
    for (let i=0; i<sales.length; i++){
      saleIds.push(sales[i].token_id)
    }
    const response = await fetch(process.env.NEXT_PUBLIC_COLLECTION_TOKEN_LIST_URL)
    const paymentTokenList = await response.json()
    let paymentTokensAddress = []
    setPaymentTokens(paymentTokenList.tokens)

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

    //setSupply(res_collection.supply==undefined?'1':res_collection.supply)
    setMaximumRoyaltyFee(parseFloat(res_collection.maximumRoyaltyFee)/10000)
  
  }, [client])

  useEffect(() => {
    
    loadNft()
  }, [loadNft, collectionId, id]);

  
  const startSale = async(e) => {
    if (!address || !signingClient) {
      toast.warning(
        `Please connect your wallet.`,
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
    let duration_type:DurationType = {"startTime": Math.round(duration[0].getTime()/1000), "endTime": Math.round(duration[1].getTime()/1000)}
    console.log("duration", duration)
    const marketContract = Market(PUBLIC_MARKETPLACE).use(client)
    let collection = await marketContract.collection(collectionId)
    const cw721Contract = CW721(collection.cw721_address).useTx(signingClient)
    let msg: any
    let denom: any
    
    let total_royalty_rate:number = 0
    let royaltiesArr:any = []
    //const royalties = [...inputFields]

    for (let i = 0; i < royalties.length; i++){
      total_royalty_rate += parseFloat(royalties[i]["rate"].toString())
      royalties[i]["rate"] = royalties[i]["rate"]
      royaltiesArr.push({"address": royalties[i]['address'], "rate": royalties[i]["rate"]})
    }
    
    total_royalty_rate = total_royalty_rate
    console.log("total", total_royalty_rate, royalties)
    if (sellType==SALE_TYPE[0]){
      if (price == ""){
        toast.warning(
          `Please input a price.`,
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
      setJsonUploading(true)
      if (paymentTokens[priceSelectedOption].type == "cw20"){
        denom = {"cw20": paymentTokens[priceSelectedOption].address}
      }else{
        denom = {"native": paymentTokens[priceSelectedOption].address}
      }
      msg = {
        "start_sale": {
          "sale_type": sellType, 
          "duration_type": SALE_TYPE[0], 
          "initial_price": parseInt(toMinDenom(parseFloat(price), paymentTokens[priceSelectedOption].denom)).toString(), 
          "reserve_price": parseInt(toMinDenom(parseFloat(price), paymentTokens[priceSelectedOption].denom)).toString(),
          denom
        }
      }
      console.log("msg", JSON.stringify(msg))
      let encodedMsg: string = toBase64(new TextEncoder().encode(JSON.stringify(msg)))
      let nft = await cw721Contract.sendNft(address, collection.collection_address, id, encodedMsg)
      console.log("nft info:", msg)
    }else if (sellType == SALE_TYPE[1]){
      if (sellingPrice == ""){
        toast.warning(
          `Please input a price.`,
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
      if (isReserverPrice && reserverPrice == ""){
        toast.warning(
          `Please input a price.`,
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
      let reserverPriceVal:string = reserverPrice
      if (!isReserverPrice){
        reserverPriceVal = sellingPrice
      }
      if (parseFloat(reserverPriceVal) < parseFloat(sellingPrice)){
        toast.warning(
          ` the reserve price must be greater than initial price`,
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
      setJsonUploading(true)
      
      
      if (paymentTokens[sellingPriceSelectedOption].type == "cw20"){
        denom = {"cw20": paymentTokens[sellingPriceSelectedOption].address}
      }else{
        denom = {"native": paymentTokens[sellingPriceSelectedOption].address}
      }
      msg = {
        "start_sale": 
        {
          "sale_type": sellType, 
          "duration_type": {"Time":[duration_type.startTime, duration_type.endTime]}, 
          "initial_price": parseInt(toMinDenom(parseFloat(sellingPrice), paymentTokens[sellingPriceSelectedOption].denom)).toString(), 
          "reserve_price": parseInt(toMinDenom(parseFloat(reserverPriceVal), paymentTokens[sellingPriceSelectedOption].denom)).toString(),
          denom
        }
      }
      console.log("msg", JSON.stringify(msg))
      let encodedMsg: string = toBase64(new TextEncoder().encode(JSON.stringify(msg)))
      let nft = await cw721Contract.sendNft(address, collection.collection_address, id, encodedMsg)
      console.log("nft info:", msg)
    }
    setJsonUploading(false)  
    toast.success(
      `You have completed List Items for Sale.`,
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
    
    
  }
  const handleSwapTokenPositions = () => {
    
  }
  return (
    
    <ChakraProvider>
      {nft.name!="" && royalties &&
      <Nft className="nft-info">
        <NftInfoTag className="nft-detail">
          {parseInt(supply) > 1 &&
          <>
            <h4>Quantity</h4>
            <QuantityContainer>
            <Input
                  type='number'
                  placeholder=''
                  value={quantity} onChange={handleQuantityChange}
                />
            <p>{supply} avaiable</p>
            </QuantityContainer>
          </>
          }
          {parseInt(supply) == 1 &&
          <>
            <h4 className="mb32">Type</h4>
            <Tooltip label='Testing' hasArrow>
              <span className="helpInfo">
              <Info/>
              </span>
            </Tooltip>

            <ButtonGroup>
              <Button 
                className={`fixed-btn ${sellType==SALE_TYPE[0]?'active':''}`}
                onClick={(e) => {
                  setSellType(SALE_TYPE[0])
                }}
              >
                <p>$</p><p>Fixed Price</p>
              </Button>
              <Button 
                className={`auction-btn ${sellType==SALE_TYPE[1]?'active':''}`}
                onClick={(e) => {
                  setSellType(SALE_TYPE[1])
                }}
              >
                <p><IconWrapper icon={<Auction />} /></p>
                <p>Timed Auction</p>
              </Button>
            </ButtonGroup>
          </>
          }
          {sellType==SALE_TYPE[0] &&
            <>
            <h4>Price</h4>
            <Tooltip label='Testing' hasArrow>
              <span className="helpInfo">
              <Info/>
              </span>
            </Tooltip>
            <PriceContainer>
              <DropDownContainer>
                <DropDownHeader onClick={togglingPrice}>
                  <Image alt="Token Icon" className="token-icon" src={paymentTokens[priceSelectedOption].logoUri}/>{paymentTokens[priceSelectedOption].name}<ArrowDown/>
                </DropDownHeader>
                {isPriceOpen && (
                <DropDownListContainer>
                  <DropDownList>
                    {paymentTokens.map((token, idx) => (
                      <ListItem onClick={onPriceOptionClicked(idx)} key={`price${idx}`}>
                        <Image alt="Token Icon" className="token-icon" src={token.logoUri}/>{token.name}
                      </ListItem>
                    ))}
                  </DropDownList>
                </DropDownListContainer>
                )}
              </DropDownContainer>

              <Input
                  type='number'
                  placeholder=''
                  value={price} onChange={handlePriceChange}
                />
            </PriceContainer>
            <PriceFooterContainer>
                <NftDollarPrice symbol={paymentTokens[priceSelectedOption].symbol} amount={price}/>
            </PriceFooterContainer>
            </>
          }
          {sellType==SALE_TYPE[1] &&
          <>
            <h4>Method</h4>
            <Tooltip label='Testing' hasArrow>
              <span className="helpInfo">
              <Info/>
              </span>
            </Tooltip>
            <MethodContainer>
              <Button
                variant="secondary"
              >
                <ArrowSlash/>Sell to highest bidder
              </Button>
            </MethodContainer>
            <h4>Selling price</h4>
            <Tooltip label='Testing' hasArrow>
              <span className="helpInfo">
              <Info/>
              </span>
            </Tooltip>
            <PriceContainer>
              <DropDownContainer>
                <DropDownHeader onClick={togglingSellingPrice}>
                  <Image alt="Token Icon" className="token-icon" src={paymentTokens[sellingPriceSelectedOption].logoUri}/>{paymentTokens[sellingPriceSelectedOption].name}<ArrowDown/>
                </DropDownHeader>
                {isSellingPriceOpen && (
                <DropDownListContainer>
                  <DropDownList>
                    {paymentTokens.map((token, idx) => (
                      <ListItem onClick={onSellingPriceOptionClicked(idx)} key={`sellingprice${idx}`}>
                        <Image alt="Token Icon" className="token-icon" src={token.logoUri}/>{token.name}
                      </ListItem>
                    ))}
                  </DropDownList>
                </DropDownListContainer>
                )}
              </DropDownContainer>
              <Input
                  type='number'
                  placeholder=''
                  value={sellingPrice} onChange={handleSellingPriceChange}
                />
            </PriceContainer>
            <PriceFooterContainer>
              <NftDollarPrice symbol={paymentTokens[sellingPriceSelectedOption].symbol} amount={sellingPrice}/>
            </PriceFooterContainer>
          </>
          }
          {sellType==SALE_TYPE[1] &&
          <>
          <h4>Duration</h4>
          <DurationContainer className="field">
          <DateRangePicker format="yyyy-MM-dd hh:mm aa" showMeridian value={duration} onChange={setDuration} />
          </DurationContainer>
          </>
          }
          {sellType==SALE_TYPE[0] &&
            <ReserveContainer className="hide">
              <div className="reserve-header">
                <h4>Reserve for specific buyer</h4>
                <Switch id="reserve" 
                onChange={(e) => {
                  setIsReserve(!isReserve)
                }}/>
              </div>
              <div className={`reserve-body ${isReserve?'':'hide'}`}>
                <p>This item can be purchased as soon as it's listed.</p>
                <Input
                  type='text'
                  placeholder=''
                  value={reserve} onChange={handleReserveChange}
                />
              </div>
            </ReserveContainer>
          }
          {sellType==SALE_TYPE[1] &&
          <ReserveContainer>
            <div className="reserve-header">
              <h4>Include reserver price</h4>
              <div>
                <Tooltip label='Testing' hasArrow>
                  <span className="helpInfo">
                  <Info/>
                  </span>
                </Tooltip>
                <Switch id="reserver" 
                  onChange={(e) => {
                    setIsReserverPrice(!isReserverPrice)
                  }}/>
              </div>
            </div>
            <PriceContainer className={`${isReserverPrice?'mb0':'hide'}`}>
              <DropDownContainer>
                <DropDownHeader onClick={togglingReserverPrice}>
                  <Image alt="Token Icon" className="token-icon" src={paymentTokens[reserverPriceSelectedOption].logoUri}/>{paymentTokens[reserverPriceSelectedOption].name}<ArrowDown/>
                </DropDownHeader>
                {isReserverPriceOpen && (
                <DropDownListContainer>
                  <DropDownList>
                    {paymentTokens.map((token, idx) => (
                      <ListItem onClick={onReserverPriceOptionClicked(idx)} key={`reserverprice${idx}`}>
                        <Image alt="Token Icon" className="token-icon" src={token.logoUri}/>{token.name}
                      </ListItem>
                    ))}
                  </DropDownList>
                </DropDownListContainer>
                )}
              </DropDownContainer>
              <Input
                  type='number'
                  placeholder=''
                  value={reserverPrice} onChange={handleReserverPriceChange}
                />
            </PriceContainer>
            <PriceFooterContainer className="between">
                <span className="error">
                  {errorMsg} 
                </span>
                <span><NftDollarPrice symbol={paymentTokens[reserverPriceSelectedOption].symbol} amount={reserverPrice}/></span>
            </PriceFooterContainer>
          </ReserveContainer>
          }

          <hr></hr>
          <FeeContainer>
            <h4>
              Fees
              <Tooltip label='Testing' hasArrow>
                <span className="helpInfo">
                <Info/>
                </span>
              </Tooltip>
            </h4>
            <div>
              <span>Maximum Royalty Fee</span>
              <span>{maximumRoyaltyFee}%</span>
            </div>
            <RatesContainer>
              <h4>Royalty</h4>
              {royalties.map((data, index)=>{
                  const {address, rate}= data;
                  return(
                    <div className="rate-item" key={index}>
                      <span>{address}</span>
                      <span>{rate / 10000}%</span>
                    </div>
                  )
                })
              }
            </RatesContainer>
          </FeeContainer>
          <ActionContainer>
          <Button className="btn-default"
            css={{
              'background': '$black',
              'color': '$white',
              'stroke': '$white',
            }}
            variant="primary"
            size="large"
            onClick={(e) => {
              startSale(e)
            }}
            disabled={isJsonUploading}
          >
            Complete listing
          </Button>
          
        </ActionContainer>
        </NftInfoTag>
        <NftUriTag className="sell-nft-uri">
          <h4 className="mb32">Preview</h4>
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
          <PreviewItem className="mt32 gray">
            <span>{nft.collectionName}</span>
            <span>Price</span>
          </PreviewItem>
          <PreviewItem>
            <h4>{nft.name}</h4>
            <span>
                {sellType==SALE_TYPE[0] &&
                <>
                <Image alt="Token Icon" className="token-icon" src={paymentTokens[priceSelectedOption].logoUri}/>
                {price}
                </>
                }
                {sellType==SALE_TYPE[1] &&
                <>
                <Image alt="Token Icon" className="token-icon" src={paymentTokens[sellingPriceSelectedOption].logoUri}/>
                {sellingPrice}
                </>
                }
            </span>
          </PreviewItem>
        </NftUriTag>
      </Nft>
    }
    {nft.name=="" && 
      <LoadingProgress/>
    }
    </ChakraProvider>
    
  );
}
const Nft = styled('div', {
  display: 'flex',

  '.helpInfo': {
    display: 'block',
    width: '16px',
    height: '16px',
    float: 'right',
    marginTop: '-16px',
  },
  'h4':{
    '.helpInfo':{
      marginTop: '0px',
    }
  }
})
const NftUriTag = styled('div', {
  paddingRight: '0',
  paddingLeft: '0',
  margin: '0 auto',
  ' img':{
    borderRadius: '$4',
  },
  'h4':{
    'fontWeight': 'bold',
  },
})
const NftInfoTag = styled('div', {
  width: '40%',
  ' .nft-title':{
    marginTop: '0px',
  },
  'h4':{
    'fontWeight': 'bold',
  },
  '>a':{
    color: '$colors$link',
  }
})

const ButtonGroup = styled('div', {
  display: 'flex',
  gap: '4px',
  marginBottom: '$space$12',
  height: '100px',
  'button':{
    width: '50%',
    boxShadow: '0px 4px 44px rgba(0, 0, 0, 0.06)',
    borderRadius: '4px',
    background: '$salewhite',
    color: '$salecolor',
    border: '1px solid #E6E6E6',
    filter: 'drop-shadow(0px 4px 44px rgba(0, 0, 0, 0.06))',
    '&.active':{
      background: '$dark',
      color: '$white',
      'svg':{
        'path':{
          fill: '$white',
        }
      }
    },
    'p':{
      padding:'4px'
    }
  }
})
const MethodContainer = styled('div', {
  display: 'flex',
  marginBottom: '$space$12',
  'button':{
    display: 'flex',
    flexDirection: 'row',
    background: 'transparent',
    borderRadius: '$1',
    height: '48px',
    width: '100%',
    justifyContent: 'left',
    gap: '8px',
    fontWeight: 'normal',
    color: '$salecolor',
    border: '$borderWidths$1 solid $borderColors$default',
    'img':{
      width: '$6',
      marginRight: '$2'
    }
  },

})
const PriceContainer = styled('div', {
  display: 'flex',
  
  'button':{
    display: 'flex',
    flexDirection: 'row',
    background: 'transparent',
    borderRadius: '$1',
    border: '$borderWidths$1 solid $borderColors$default',
    fontWeight: 'normal',
    color: '$salecolor',
    'img':{
      width: '$6',
      marginRight: '$2'
    }
  },
  'input':{
    width: '100%',
    height: '$lineHeights$5',
    marginLeft: '$2',
    color: '$salecolor',
  },
  '.price-footer':{
    display: 'flex',
    justifyContent: 'space-between',
    '.error':{
      color: '$error'
    }
  }
})
const PriceFooterContainer = styled('div', {
  display: 'flex',
  justifyContent: 'flex-end',
  marginBottom: '$space$12',
  color: '$salecolor',
  '.error':{
    color: '$error'
  }
})
const QuantityContainer = styled('div', {
  marginBottom: '$space$12',
  'p':{
    textAlign: 'right',
  }
})
const DurationContainer = styled('div', {
  marginBottom: '$space$12',
  'div':{
    '.rs-picker-toggle':{
      height: '48px',
      lineHeight: '34px',
      '.rs-picker-toggle-value':{
        color: '$salecolor',
      },
      '>.rs-btn-close':{
        height: '30px',
      },
      '>.rs-icon.rs-icon':{
        height: '30px',
      }
    },

  }
})
const ReserveContainer = styled('div', {
  marginBottom: '$space$12',
  '.reserve-header':{
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    'div':{
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '4px',
      '.chakra-switch':{
        '[aria-checked=true]':{
          background: '$black',
        },
        '.chakra-switch__track[data-checked]':{
          background: '$black',
        }
      },
      '.helpInfo':{
        justifyContent: 'center',
        alignItems: 'center',
        display: 'flex',
        marginTop: '0px',
      }
    },
  },
  '.reserve-body':{
    color: '$salecolor',
  },
  '.between':{
    justifyContent: 'space-between',
  }
})
const FeeContainer = styled('div', {
  marginTop: '$space$12',
  marginBottom: '$space$12',
  display: 'flex',
  flexDirection: 'column',
  'div':{
    display: 'flex',
    justifyContent: 'space-between',
    color: '$salecolor',
  }
  
})
const RatesContainer = styled('div', {
  display: 'flex',
  justifyContent: 'space-between',
  flexDirection: 'column',
  '.rate-item': {
    display: 'flex',
    justifyContent: 'space-between',
    flexDirection: 'row',
    'input':{
      width: '45%',
    },
    'button':{
      margin: 'auto'
    }
  },
  '.add-rate-item':{
    display: 'flex',
    margin: '10px 0',
    justifyContent: 'flex-end',
  }
})
const ActionContainer = styled('div', {
  marginBottom: '$space$12',
})
const PreviewItem = styled('div', {
  display: 'flex',
  justifyContent: 'space-between',
  '&.mt32':{
    marginTop: '$space$12',
  },
  '&.gray':{
    color:'$gray',
  },
  'span':{
    display: 'flex',
    alignItems: 'center',
    gap:'4px',
    'img':{
      width: '$space$6',
    }
  }
  

})
const DropDownContainer = styled("div", {
  width: '10.5em',
  margin: '0 auto',
  position: 'relative',
})
const DropDownHeader = styled("div", {
  height: '48px',
  alignItems: 'center',
  justifyContent: 'center',
  display: 'flex',
  flexDirection: 'row',
  background: 'transparent',
  borderRadius: '$1',
  border: '$borderWidths$1 solid $borderColors$default',
  fontWeight: 'normal',
  color: '$salecolor',
  'img':{
    width: '$6',
    marginRight: '$2'
  },
  'svg':{
    fill: '#000'
  }

})
const DropDownListContainer = styled("div", {
  position: 'absolute',
  zIndex: '50',
  border: '$borderWidths$1 solid $borderColors$default',
  background: '$white',
  width: '136px',
})
const DropDownList = styled("ul", {
  padding: '0',
  margin: '0',
  paddingLeft: '1em',
  boxSizing: 'border-box',
  
  '&:first-child': {
    paddingTop: '0.8em',
  }
})
const ListItem = styled("li", {
  listStyle: 'none',
  marginBottom: '0.8em',
  display: 'flex',
  
  'img':{
    width: '$6',
    height: '$6',
    marginRight: '$2'
  }
})