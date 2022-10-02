import * as React from "react"
import { useCallback, useState, useEffect } from "react"
import { useRouter } from 'next/router'

import { Button } from 'components/Button'
import { styled } from 'components/theme'
import { IconWrapper } from 'components/IconWrapper'
import { Activity, Grid, Search, ColumnBig, ColumnSmall, Sidebar, ArrowLeft } from 'icons'
import { CollectionFilter } from "./filter"
import { NftTable } from "components/NFT"
import { CW721, Market, Collection, useSdk, PaymentToken, NftInfo, OWNED, CREATED, getRealTokenAmount, getFileTypeFromURL } from 'services/nft'
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
import { LoadingProgress } from 'components/LoadingProgress'
import { NFT_COLUMN_COUNT, UI_ERROR, PROFILE_STATUS, FILTER_STATUS_TXT, BUY_STATUS, OFFER_STATUS, RELOAD_STATUS } from "store/types"
import { BuyDialog } from 'features/nft/market/detail/BuyDialog'
import { OfferDialog } from 'features/nft/market/detail/OfferDialog'

const PUBLIC_MARKETPLACE = process.env.NEXT_PUBLIC_MARKETPLACE || ''

export const ProfileTab = ({index}) => {
  return (
    <TabWrapper>
      <Tab>
        <Button className={`tab-link ${index==0?'active':''}`}
            as="a"
            variant="ghost"
          >
            Owned
        </Button>
      </Tab>
      <Tab>
        <Button className={`tab-link ${index==1?'active':''}`}
            as="a"
            variant="ghost"
          >
            Created
        </Button>
      </Tab>
      <Tab className="hide">
        <Button className={`tab-link ${index==2?'active':''}`}
            as="a"
            variant="ghost"
          >
            Favorite
        </Button>
      </Tab>
      <Tab className="hide">
        <Button className={`tab-link ${index==3?'active':''}`}
            as="a"
            variant="ghost"
          >
            Activity
        </Button>
      </Tab>
      <Tab className="hide">
        <Button className={`tab-link ${index==4?'active':''}`}
            as="a"
            variant="ghost"
          >
            Offers
        </Button>
      </Tab>
    </TabWrapper>
  )
}
let nftCurrentIndex = 0
let collectionSlug = ""
let collectionNFTs = []
export const MyCollectedNFTs = (tabIndex: any) => {
  const pageCount = 10
  const router = useRouter()
  const query = router.query
  const { asPath, pathname } = useRouter();
  const { client } = useSdk()
  const { address, client: signingClient } = useRecoilValue(walletState)

  const [paymentTokens, setPaymentTokens] = useState<PaymentToken[]>()
  const [traits, setTraits] = useState([])
  const [tokens, setNFTIds] = useState<number[]>([])
  const [isCollapse, setCollapse] = useState(false)
  const [isMobileFilterCollapse, setMobileFilterCollapse] = useState(true)
  const [isLargeNFT, setLargeNFT] = useState(true)
  const [filterCount, setFilterCount] = useState(0)
  const [reloadCount, setReloadCount] = useState(0)
  const [currentTokenCount, setCurrentTokenCount] = useState(0)
  const [nfts, setNfts] = useState<NftInfo[]>(
    []
  )
  const [hasMore, setHasMore] = useState(false)

  const dispatch = useDispatch()
  const uiListData = useSelector((state: State) => state.uiData)
  const { nft_column_count } = uiListData
  
  const profileData = useSelector((state: State) => state.profileData)
  const { profile_status } = profileData
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
    console.log(profile_status)
    profile_status.splice(profile_status.indexOf(fstatus), 1)
    //setFilterData(profile_status, profile_status)
    dispatch(
      {
        type: PROFILE_STATUS,
        payload: profile_status,
      }
    )
    return true
  }
  const closeFilterAllStatusButtons = () => {
    //setFilterData(profile_status, [])
    dispatch(
      {
        type: PROFILE_STATUS,
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
      if (!client){
        return
      }
      const marketContract = Market(PUBLIC_MARKETPLACE).use(client)
      let collections = await marketContract.listCollections()
      const response = await fetch(process.env.NEXT_PUBLIC_COLLECTION_TOKEN_LIST_URL)
      const paymentTokenList = await response.json()
      setPaymentTokens(paymentTokenList.tokens)
      let paymentTokensAddress = []
      for (let i = 0; i < paymentTokenList.tokens.length; i++){
        paymentTokensAddress.push(paymentTokenList.tokens[i].address)
      }
      setNfts([])
      collectionNFTs.splice(0,collectionNFTs.length)
      collectionNFTs.length = 0
      collectionNFTs = []
      console.log("NFTs:", collectionNFTs)
      let rCount = 0
      for (let k = 0; k < collections.length; k++){
        let collection = await marketContract.collection(collections[k].id)
        let ipfs_collection = await fetch(process.env.NEXT_PUBLIC_PINATA_URL + collection.uri)
        let res_collection = await ipfs_collection.json()
        const response = await fetch(process.env.NEXT_PUBLIC_COLLECTION_TOKEN_LIST_URL)
        const paymentTokenList = await response.json()
        setPaymentTokens(paymentTokenList.tokens)
        let paymentTokensAddress = []
        let collectionDenom = ""
        for (let i = 0; i < paymentTokenList.tokens.length; i++){
          if (paymentTokenList.tokens[i].symbol.toLowerCase() == res_collection.tokens[0].toLowerCase()){
            collectionDenom = paymentTokenList.tokens[i].denom
          }
        }
        const cwCollectionContract = Collection(collection.collection_address).use(client)
        let sales:any = await cwCollectionContract.getSales()
        console.log("Sales:", sales)
        let saleIds = []
        for (let i=0; i<sales.length; i++){
          saleIds.push(sales[i].token_id)
        }
        console.log("saleIds", sales, saleIds)
        const cw721Contract = CW721(collection.cw721_address).use(client)
        let tokenIdsInfo:any
        let tokenIds: any
        if (collection.owner != address){
          tokenIdsInfo = await cw721Contract.tokens(address)
        }else{
          tokenIdsInfo = await cw721Contract.allTokens()
        }
        tokenIds = tokenIdsInfo.tokens
        console.log("tokenIds:", tokenIds)
        while(tokenIds.length > 0){
          for (let i = 0; i < tokenIds.length; i++){
            console.log("token ID", tokenIds[i])
            let nftInfo = await cw721Contract.nftInfo(tokenIds[i])
            let ipfs_nft = await fetch(process.env.NEXT_PUBLIC_PINATA_URL + nftInfo.token_uri)
            let res_nft = await ipfs_nft.json()
            res_nft["tokenId"] = tokenIds[i]
            res_nft["created"] = res_nft["owner"]
            res_nft["collectionId"] = collections[k].id
            res_nft["owner"] = await cw721Contract.ownerOf(res_nft["tokenId"])
            if (res_nft["created"] != address && res_nft["owner"] != address){
              continue
            }
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
          if (collection.owner != address){
            tokenIdsInfo = await cw721Contract.tokens(address, start_after)
          }else{
            tokenIdsInfo = await cw721Contract.allTokens(start_after)
          }
          tokenIds = tokenIdsInfo.tokens
          rCount++
          setReloadCount(rCount)
          
        }
        
        
      }
      console.log("NFTs:",collectionNFTs);
      
    })();
  }, [client])
  useEffect(() => {
    (async () => {
      if (collectionNFTs.length == 0){
        return
      }
      let currentTraits = []
      for (let i = 0; i < collectionNFTs.length; i++){
        console.log("attr:", profile_status, collectionNFTs[i].attributes[0].value)

        if (profile_status.length == 0 
          || profile_status.indexOf(collectionNFTs[i].attributes[0].value) != -1
          || profile_status.indexOf(collectionNFTs[i].attributes[1].value) != -1
          || profile_status.indexOf(collectionNFTs[i].attributes[2].value) != -1
          || profile_status.indexOf(collectionNFTs[i].attributes[3].value) != -1
          || profile_status.indexOf(collectionNFTs[i].attributes[4].value) != -1
          || profile_status.indexOf(collectionNFTs[i].attributes[5].value) != -1
          || profile_status.indexOf(collectionNFTs[i].attributes[7].value) != -1
        ){
          if (tabIndex.tabIndex == OWNED){
            if (collectionNFTs[i].owner == address){
              currentTraits.push(collectionNFTs[i])
            }
          }else if (tabIndex.tabIndex == CREATED){
            if (collectionNFTs[i].created == address){
              currentTraits.push(collectionNFTs[i])
            }
          }
          
        }
      }
      console.log("currentTraits", currentTraits)
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
              'collectionId': currentTraits[i].collectionId
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
              'collectionId': currentTraits[i].collectionId
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

  }, [filterCount, searchVal, reloadCount, tabIndex])

  const getMoreNfts = async () => {
    let id = '12'
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
            'collectionId': traits[i].collectionId
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
            'collectionId': traits[i].collectionId
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
          {profile_status.length != filterCount && setFilterCount(profile_status.length)}
          {profile_status.map(fstatus => (
            <Tag
              borderRadius='full'
              variant='solid'
              key={fstatus}
            >
              <TagLabel>{FILTER_STATUS_TXT[fstatus]}</TagLabel>
              <TagCloseButton onClick={()=>closeFilterStatusButton(fstatus)}/>
            </Tag>
          ))}
          {profile_status.length > 0 &&
            <Tag
              borderRadius='full'
              variant='solid'
            >
              <TagLabel>Clear All</TagLabel>
              <TagCloseButton onClick={()=>closeFilterAllStatusButtons()}/>
            </Tag>
          }
        </FilterItem>
        {reloadCount == 0 && 
          <LoadingProgress/>
        }
        {reloadCount != 0 && 
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
  gap: '$4',
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
