import * as React from "react"
import { useCallback, useState, useEffect } from "react"
import { useRouter } from 'next/router'

import { Button } from 'components/Button'
import { styled } from 'components/theme'
import { IconWrapper } from 'components/IconWrapper'
import { Activity, Grid, Search, ColumnBig, ColumnSmall, Sidebar, ArrowLeft } from 'icons'
import { CollectionFilter } from "./filter"
import { NftTable } from "components/NFT"
import { CW721, Market, Collection, useSdk, PaymentToken, NftInfo, getRealTokenAmount, getFileTypeFromURL } from 'services/nft'
import { useRecoilValue, useSetRecoilState } from 'recoil'
import { walletState, WalletStatusType } from 'state/atoms/walletAtoms'
import InfiniteScroll from "react-infinite-scroll-component"
import { 
  ChakraProvider, 
  Tab, 
  Input, 
  InputGroup, 
  InputRightElement, 
  Select, 
  IconButton,
  Tag,
  TagLabel,
  TagCloseButton,
  filter,
} from '@chakra-ui/react'
import { useDispatch, useSelector } from "react-redux"
import { State } from 'store/reducers'
import { NFT_COLUMN_COUNT, UI_ERROR, FILTER_STATUS, FILTER_STATUS_TXT, BUY_STATUS, OFFER_STATUS, RELOAD_STATUS } from "store/types"
import { BuyDialog } from 'features/nft/market/detail/BuyDialog'
import { OfferDialog } from 'features/nft/market/detail/OfferDialog'
import { LoadingProgress } from 'components/LoadingProgress'

const PUBLIC_MARKETPLACE = process.env.NEXT_PUBLIC_MARKETPLACE || ''

export const CollectionTab = ({index}) => {
  
  return (
    <TabWrapper>
      <Tab>
        <Button className={`hide tab-link ${index==0?'active':''}`}
            as="a"
            variant="ghost"
            iconLeft={<IconWrapper icon={<Grid />} />}
          >
            Items
        </Button>
      </Tab>
      <Tab>
        <Button className={`hide tab-link ${index==1?'active':''}`}
            as="a"
            variant="ghost"
            iconLeft={<IconWrapper icon={<Activity />} />}
          > 
            Activity
        </Button>
      </Tab>
    </TabWrapper>
  )
}
let nftCurrentIndex = 0


interface CollectionProps {
  readonly id: string
  // readonly name: string
  // readonly collectionAddress: string
  // readonly numTokens: number
  // readonly uri: string
}
let airdroppedCollectionId1 = 3
let airdroppedCollectionId2 = 4
let marbleCollectionId = 5

export const CollectionNFTList = ({id}: CollectionProps) => {  
  const pageCount = 10
  
  const router = useRouter()
  const query = router.query
  const { asPath, pathname } = useRouter();
  const { client } = useSdk()
  const { address, client: signingClient } = useRecoilValue(walletState)

  const [paymentTokens, setPaymentTokens] = useState<PaymentToken[]>()
  const [traits, setTraits] = useState([])
  const [tokens, setNFTIds] = useState<number[]>([])
  const [collectionAddress, setCollectionAddress] = useState("")
  const [cw721Address, setCw721Address] = useState("")
  const [numTokens, setNumTokens] = useState(0)
  const [isCollapse, setCollapse] = useState(false)
  const [isMobileFilterCollapse, setMobileFilterCollapse] = useState(true)
  const [isLargeNFT, setLargeNFT] = useState(true)
  const [filterCount, setFilterCount] = useState(0)
  const [reloadCount, setReloadCount] = useState(0)
  const [currentTokenCount, setCurrentTokenCount] = useState(0)
  const [loadedNfts, setLoadedNfts] = useState<any[]>(
    []
  )
  const [nfts, setNfts] = useState<NftInfo[]>(
    []
  )
  const [hasMore, setHasMore] = useState(false)

  const dispatch = useDispatch()
  const uiListData = useSelector((state: State) => state.uiData)
  const { nft_column_count } = uiListData
  
  const filterData = useSelector((state: State) => state.filterData)
  const { filter_status } = filterData
  const [searchVal, setSearchVal] = useState("")
  
  const buyData = useSelector((state: State) => state.buyData)
  const { buy_status } = buyData
  const offerData = useSelector((state: State) => state.offerData)
  const { offer_status } = offerData
  const reloadData = useSelector((state: State) => state.reloadData)
  const { reload_status } = reloadData

  const [buyId, setBuyId] = useState("")
  const [isBuyShowing, setIsBuyShowing] = useState(false)
  const [offerId, setOfferId] = useState("")
  const [isOfferShowing, setIsOfferShowing] = useState(false)


  const closeFilterStatusButton = (fstatus) => {
    console.log(filter_status)
    filter_status.splice(filter_status.indexOf(fstatus), 1)
    //setFilterData(FILTER_STATUS, filter_status)
    dispatch(
      {
        type: FILTER_STATUS,
        payload: filter_status,
      }
    )
    return true
  }
  const closeFilterAllStatusButtons = () => {
    //setFilterData(FILTER_STATUS, [])
    dispatch(
      {
        type: FILTER_STATUS,
        payload: []
      }
    )
    return true
  }
  const handleSearch = (event) => {
    if (event.key.toLowerCase() === "enter") {
      setSearchVal(event.target.value)
    }
  }
  useEffect(() => {
    (async () => {
      
      if (id === undefined || id == "[name]")
        return false
      console.log("id", id)
      if (!client){
        return
      }
      const marketContract = Market(PUBLIC_MARKETPLACE).use(client)
      let collection = await marketContract.collection(parseInt(id))
      let ipfs_collection = await fetch(process.env.NEXT_PUBLIC_PINATA_URL + collection.uri)
      let res_collection = await ipfs_collection.json()
      console.log("collection:", collection)
      const response = await fetch(process.env.NEXT_PUBLIC_COLLECTION_TOKEN_LIST_URL)
      const paymentTokenList = await response.json()
      setPaymentTokens(paymentTokenList.tokens)
      let paymentTokensAddress = []
      let collectionDenom = ""
      for (let i = 0; i < paymentTokenList.tokens.length; i++){
        paymentTokensAddress.push(paymentTokenList.tokens[i].address)
        if (paymentTokenList.tokens[i].symbol.toLowerCase() == res_collection.tokens[0].toLowerCase()){
          collectionDenom = paymentTokenList.tokens[i].denom
        }
      }
      setCollectionAddress(collection.collection_address)
      setCw721Address(collection.cw721_address)
      
      const cwCollectionContract = Collection(collection.collection_address).use(client)
      let sales:any = await cwCollectionContract.getSales()
      console.log("Sales:", sales)
      let saleIds = []
      for (let i=0; i<sales.length; i++){
        saleIds.push(sales[i].token_id)
      }
      console.log("saleIds", sales, saleIds)
      const cw721Contract = CW721(collection.cw721_address).use(client)
      let numTokensForCollection = await cw721Contract.numTokens()
      setNumTokens(numTokensForCollection)
      let collectionNFTs = []
      collectionNFTs.splice(0,collectionNFTs.length)
      collectionNFTs.length = 0
      collectionNFTs = []
      console.log("NFTs:", collectionNFTs)
      
      
      let tokenIdsInfo = await cw721Contract.allTokens()
      let tokenIds:any
      if (parseInt(id) == marbleCollectionId){
        tokenIds = ["1", "1001", "2", "3", "4", "5", "6", "7", "8", "9", "10"]
      }else if (parseInt(id) == airdroppedCollectionId1 || parseInt(id) == airdroppedCollectionId2){
        tokenIds = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]
      }else{
        tokenIds = tokenIdsInfo.tokens
      }
      
      console.log("tokenIds:", tokenIds)
      let rCount = 0
      while (tokenIds.length > 0){
        for (let i = 0; i < tokenIds.length; i++){
          console.log("token ID", tokenIds[i])
          let nftInfo = await cw721Contract.nftInfo(tokenIds[i])
          let ipfs_nft = await fetch(process.env.NEXT_PUBLIC_PINATA_URL + nftInfo.token_uri)
          let res_nft = await ipfs_nft.json()
          res_nft["tokenId"] = tokenIds[i]
          res_nft["created"] = res_nft["owner"]
          res_nft["owner"] = await cw721Contract.ownerOf(res_nft["tokenId"])
          let res_uri = res_nft["uri"]
          if (res_uri.indexOf("https://") == -1){
            res_uri = process.env.NEXT_PUBLIC_PINATA_URL + res_uri
          }
          let nft_type = await getFileTypeFromURL(res_uri)
          res_nft['type'] = nft_type.fileType
          console.log("res_nft type:", res_nft['type'])
          if (saleIds.indexOf(parseInt(tokenIds[i])) != -1){
            let sale = sales[saleIds.indexOf(parseInt(tokenIds[i]))]
            let paymentToken: any
            if (sale.denom.hasOwnProperty("cw20")){
              paymentToken = paymentTokenList.tokens[paymentTokensAddress.indexOf(sale.denom.cw20)]
            }else{
              paymentToken = paymentTokenList.tokens[paymentTokensAddress.indexOf(sale.denom.native)]
            }
            res_nft["symbol"] = paymentToken.symbol
            res_nft["paymentToken"] = paymentToken
            res_nft["price"] = getRealTokenAmount({amount: sale.initial_price, denom: paymentToken.denom})
            res_nft["owner"] = sale.provider
            res_nft["sale"] = sale
          }else{
            res_nft["price"] = 0
            res_nft["sale"] = {}
          }
          
          collectionNFTs.push(res_nft)
        }
        let start_after = tokenIds[tokenIds.length - 1]
        tokenIds.splice(0,tokenIds.length)
        tokenIds.length = 0
        tokenIds = []
        if (parseInt(id) == marbleCollectionId){
          if ((rCount + 1) * 10 < 1000){
            for (let m=1; m < 11; m++){
              tokenIds.push(((rCount + 1) * 10 + m).toString())
            }  
          }
        }else if (parseInt(id) == airdroppedCollectionId1 || parseInt(id) == airdroppedCollectionId2){
          if ((rCount + 1) * 10 < numTokensForCollection){
            let maxToken = 11
            if ((rCount + 2) * 10 > numTokensForCollection){
              maxToken = numTokensForCollection - ((rCount + 1) * 10) + 1
            }
            for (let m=1; m < maxToken; m++){

              tokenIds.push(((rCount + 1) * 10 + m).toString())
            }
          }
        }else{
          tokenIdsInfo = await cw721Contract.allTokens(start_after)
          tokenIds = tokenIdsInfo.tokens
        }
        
        rCount++
        setReloadCount(rCount)
        setLoadedNfts(collectionNFTs)
        console.log("reload Cnt:", rCount)
      }
      
      console.log("NFTs:",collectionNFTs);
      
    })()
  }, [id, client])
  useEffect(() => {
    (async () => {
      
      if (id === undefined || id == "[name]")
        return false
      console.log("id", id)
      if (!client){
        return
      }
      let currentTraits = []
      //getMoreNfts()
      console.log("collectionNFTs:", loadedNfts.length)
      setNfts([])
      for (let i = 0; i < loadedNfts.length; i++){
        
        if (filter_status.length == 0 
          || filter_status.indexOf(loadedNfts[i].attributes[0].value) != -1
          || filter_status.indexOf(loadedNfts[i].attributes[1].value) != -1
          || filter_status.indexOf(loadedNfts[i].attributes[2].value) != -1
          || filter_status.indexOf(loadedNfts[i].attributes[3].value) != -1
          || filter_status.indexOf(loadedNfts[i].attributes[4].value) != -1
          || filter_status.indexOf(loadedNfts[i].attributes[5].value) != -1
          || filter_status.indexOf(loadedNfts[i].attributes[7].value) != -1
        ){

          currentTraits.push(loadedNfts[i])
        }
      }
      setTraits(currentTraits)
      let nftsForCollection = []
      let hasMoreFlag = false
      let i = 0
      let nftIndex = 0
      let isPageEnd = false
      if (currentTraits.length == 0)
        isPageEnd = true
      while (!isPageEnd){
        if (searchVal == "" || currentTraits[i].name.indexOf(searchVal) != -1){
          let uri = currentTraits[i].uri
          if (uri.indexOf("https://") == -1){
            uri = process.env.NEXT_PUBLIC_PINATA_URL + currentTraits[i].uri
          }
          if (currentTraits[i].price > 0){
            nftsForCollection.push({
              'tokenId': currentTraits[i].tokenId, 
              'address': '', 
              'image': uri, 
              'name': currentTraits[i].name, 
              'user': currentTraits[i].owner, 
              'price': currentTraits[i].price, 
              'total': 2, 
              'collectionName': "", 
              'sale': currentTraits[i].sale,
              'symbol': currentTraits[i].symbol,
              'paymentToken': currentTraits[i].paymentToken,
              'type': currentTraits[i].type,
              'created': currentTraits[i].created,
              'collectionId': id
            })
          }else{
            nftsForCollection.push({
              'tokenId': currentTraits[i].tokenId, 
              'address': '', 
              'image': uri, 
              'name': currentTraits[i].name, 
              'user': currentTraits[i].owner, 
              'price': currentTraits[i].price, 
              'total': 2, 
              'collectionName': "", 
              'sale': currentTraits[i].sale,
              'symbol': "Marble",
              'paymentToken': {},
              'type': currentTraits[i].type,
              'created': currentTraits[i].created,
              'collectionId': id
            })
          }
          
          hasMoreFlag = true
          nftIndex++
          if (nftIndex == pageCount){
            isPageEnd = true
          }
        }
        i++;
        if (i == currentTraits.length){
          isPageEnd = true
          hasMoreFlag = false
        }
      }
      nftCurrentIndex = i
      setNfts(nftsForCollection)
      setHasMore(hasMoreFlag)
    })();

  }, [filterCount, searchVal, reloadCount])

  const getMoreNfts = async () => {
    if (id === undefined || id == "[name]" || !hasMore)
      return false
    
    let nftsForCollection = []
    let hasMoreFlag = false

    let i = nftCurrentIndex
    let nftIndex = 0
    let isPageEnd = false
    if (i == traits.length){
      isPageEnd = true
    }
    while (!isPageEnd){
      if (searchVal == "" || traits[i].name.indexOf(searchVal) != -1){
        let uri = traits[i].uri
        if (uri.indexOf("https://") == -1){
          uri = process.env.NEXT_PUBLIC_PINATA_URL + traits[i].uri
        }

        if (traits[i].price > 0){
          nftsForCollection.push({
            'tokenId': traits[i].tokenId, 
            'address': '', 
            'image': uri, 
            'name': traits[i].name, 
            'user': traits[i].owner, 
            'price': traits[i].price, 
            'total': 2, 
            'collectionName': "", 
            'sale': traits[i].sale,
            'symbol': traits[i].symbol,
            'paymentToken': traits[i].paymentToken,
            'type': traits[i].type,
            'created': traits[i].created,
            'collectionId': id
          })
        }else{
          nftsForCollection.push({
            'tokenId': traits[i].tokenId, 
            'address': '', 
            'image': uri, 
            'name': traits[i].name, 
            'user': traits[i].owner, 
            'price': traits[i].price, 
            'total': 2, 
            'collectionName': "", 
            'sale': traits[i].sale,
            'type': traits[i].type,
            'created': traits[i].created,
            'collectionId': id
          })
        }

        hasMoreFlag = true
        nftIndex++
        if (nftIndex == pageCount){
          isPageEnd = true
        }
      }
      i++;
      if (i == traits.length){
        isPageEnd = true
        hasMoreFlag = false
      }
    }
    nftCurrentIndex = i
    console.log("More nftCurrentIndex", nftCurrentIndex)
    setNfts((nft)=>[...nft, ...nftsForCollection])
    setHasMore(hasMoreFlag)
  }

  useEffect(() => {
    if (isLargeNFT){
      if (nft_column_count <= 3)
        return
      //setUIData(NFT_COLUMN_COUNT, nft_column_count - 1)
      dispatch(
        {
          type: NFT_COLUMN_COUNT,
          payload: nft_column_count - 1
        }
      )
    }else{
      if (nft_column_count >= 5)
        return
      //setUIData(NFT_COLUMN_COUNT, nft_column_count +1)
      dispatch(
        {
          type: NFT_COLUMN_COUNT,
          payload: nft_column_count + 1
        }
      )
    }
    
  }, [dispatch, isLargeNFT])

  useEffect(() => {
    setBuyId(buy_status)
    setIsBuyShowing(true)
  }, [dispatch, buy_status])
  useEffect(() => {
    setOfferId(offer_status)
    setIsOfferShowing(true)
  }, [dispatch, offer_status])

  // useEffect(() => {
  //   let rCount = reloadCount + 1
  //   setReloadCount(rCount)
  // }, [dispatch, reload_status])
  return (
    <CollectionWrapper>
      
      <CollectionFilter isCollapse={isCollapse} setCollapse={setCollapse} />
      <NftList className={`${isCollapse?'collapse-close':'collapse-open'}`}>
        <SearchItem className="search-item">
          <ChakraProvider>
            <InputGroup >
              <Input
                pr='48px'
                type='text'
                placeholder='Search'
                onKeyDown={handleSearch} 
              />
              <InputRightElement width='48px'>
                <IconWrapper icon={<Search />} />
              </InputRightElement>
            </InputGroup>
            {/* <Select id='item_type'>
              <option>Single Items</option>
              <option>Bundles</option>
              <option>All Items</option>
            </Select>
            <Select id='sort_type'>
              <option>Recently Listed</option>
              <option>Recently Created</option>
              <option>Recently Sold</option>
              <option>Recently Received</option>
              <option>Ending Soon</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Highest Last Sale</option>
              <option>Most Viewed</option>
              <option>Most Favorited</option>
              <option>Oldest</option>
            </Select> */}
            <ColumnCount className="desktop-section">
              <IconButton 
                className={`column-type ${isLargeNFT?'active':''}`} 
                aria-label='Search database' 
                icon={<ColumnBig />} 
                onClick={() => {
                  if (isLargeNFT)
                    return
                  setLargeNFT(!isLargeNFT)
                  return false
                }}
              />
              <IconButton 
                className={`column-type ${!isLargeNFT?'active':''}`} 
                aria-label='Search database' 
                icon={<ColumnSmall />} 
                onClick={() => {
                  if (!isLargeNFT)
                    return
                  setLargeNFT(!isLargeNFT)
                  return false
                }}
              />
            </ColumnCount>
            <FilterSection className="mobile-section filter-section">
              <Button className="filter-header"
                variant="primary"
                iconRight={isMobileFilterCollapse && <IconWrapper icon={<ArrowLeft />}/> || !isMobileFilterCollapse && <IconWrapper icon={<Sidebar />}/> }
                onClick={() => {
                  setMobileFilterCollapse(!isMobileFilterCollapse)
                  return false
                }}
              >
                  Quick Filters
              </Button>
              {!isMobileFilterCollapse &&
                <CollectionFilter isCollapse={isCollapse} setCollapse={setCollapse} />
              }
            </FilterSection>
          </ChakraProvider>
        </SearchItem>
        <FilterItem>
          {tokens.map(token => (
            {token}
          ))}
          {filter_status.length != filterCount && setFilterCount(filter_status.length)}
          {filter_status.map(fstatus => (
            <Tag
              borderRadius='full'
              variant='solid'
              key={fstatus}
            >
              <TagLabel>{FILTER_STATUS_TXT[fstatus]}</TagLabel>
              <TagCloseButton onClick={()=>closeFilterStatusButton(fstatus)}/>
            </Tag>
          ))}
          {filter_status.length > 0 &&
            <Tag
              borderRadius='full'
              variant='solid'
            >
              <TagLabel>Clear All</TagLabel>
              <TagCloseButton onClick={()=>closeFilterAllStatusButtons()}/>
            </Tag>
          }
        </FilterItem>
        {reloadCount < 2 && 
          <LoadingProgress/>
        }
        {reloadCount >= 2 && 
        <InfiniteScroll
          dataLength={nfts.length}
          next={getMoreNfts}
          hasMore={hasMore}
          loader={<h3> Loading...</h3>}
          endMessage={<h4></h4>}
        >
        <NftTable data={nfts} type="buy"/>
        </InfiniteScroll>
        }
      </NftList>
    </CollectionWrapper>
  )
}

const CollectionWrapper = styled('div', {
  display: 'flex',
  ' .category-menus':{
    borderBottom: '$borderWidths$1 solid $borderColors$default',
    display: 'flex',
    justifyContent: 'space-between',
    overFlow: 'hidden',
    '&.desktop-section': {
      ' a':{
        minWidth: '8%',
      }
    },
    '&.mobile-section': {
      ' a':{
        minWidth: '18%',
      }
    },
    ' a':{
      
      textAlign: 'center',
      paddingBottom: '$8',
      '&.active':{
        borderBottom: '4px solid $selected',
      }
    }
  }
})
const TabWrapper = styled('div', {
  
  display: 'flex',
  justifyContent: 'center',
  ' .tab-link': {
    ' .active': {
      color: '$black',
    },
    borderBottomColor: '$textColors$primary',
    ' svg': {
      stroke: '$iconColors$primary'
    }
  }
})

const NftList = styled('div', {
  padding: '$16 0 0 $16',
  '&.collapse-open':{
    width: 'calc(100% - $25)',
  },
  '&.collapse-close':{
    width: 'calc(100% - $10)',
  },
  ' .nft-table':{
    display: 'flex',
    gap: '$16',
  }
})

const SearchItem = styled('div', {
  display: 'flex',
  gap: '$6',
  ' .chakra-input':{
    height: '$22',
    border: '$borderWidths$1 solid $borderColors$default',
  },
  ' .chakra-input__right-element':{
    height: '$22',
  },
  ' .chakra-select__wrapper':{
    width: '$26',
    ' select':{
      border: '$borderWidths$1 solid $borderColors$default',
      height: '$22',
      width: '$26',
    }
  }
  
})
const FilterItem = styled('div', {
  display: 'block',
  margin: '$4 0',
  ' >span':{
    background: '$backgroundColors$primary',
    color: '$textColors$primary',
    borderRadius: '$3',
    padding: '$4',
    margin: '0 $2 $1 0',
  }
})
const ColumnCount = styled('div', {
  display: 'flex',
  gap: '$2',
  ' button':{
    height: '$22',
    background: '$backgroundColors$main',
    border: '$borderWidths$1 solid $borderColors$default',
    ' svg': {
      ' rect': {
        fill: '$iconColors$disabled'
      }
    },
    '&.active':{
      ' svg': {
        ' rect': {
          fill: '$iconColors$primary'
        }
      } 
    }
  }
})
const FilterSection = styled('div', {
  display: 'flex',
})