import * as React from "react"
import { useCallback, useState, useReducer, useEffect } from "react"
import { useRouter } from 'next/router'
import axios from 'axios'
import Link from 'next/link'
import { styled } from 'components/theme'
import { Button } from 'components/Button'
import { IconWrapper } from 'components/IconWrapper'
import { YourSite, Discord, Instagram, MediumM, Telegram, Template1, CheckIcon } from 'icons'

import {
  NftInfo,
  NftCategory,
  NftCollection,
  CollectionToken
} from "services/nft"
import { 
  ChakraProvider, 
  Input, 
  InputGroup, 
  InputLeftAddon,
  Image,
  Textarea,
  Select, 
  AspectRatio,
  Stack,
  HStack,
  Radio, 
  RadioGroup,
  useRadioGroup,
  useRadio,
  Switch,
  Box,
  useToast,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Tag,
  TagLabel,
  TagCloseButton,
} from '@chakra-ui/react'
import { toast } from 'react-toastify'
import DropZone from "components/DropZone"
import FeaturedImageUpload from "components/FeaturedImageUpload"
import BannerImageUpload from "components/BannerImageUpload"
import { useRecoilValue, useSetRecoilState } from 'recoil'
import { walletState, WalletStatusType } from 'state/atoms/walletAtoms'
import { Market, useSdk } from 'services/nft'

const PUBLIC_CW721_CONTRACT = process.env.NEXT_PUBLIC_CW721_CONTRACT || ''
const PUBLIC_MARKETPLACE = process.env.NEXT_PUBLIC_MARKETPLACE || ''
const PUBLIC_CW20_CONTRACT = process.env.NEXT_PUBLIC_CW20_CONTRACT || ''
const PUBLIC_CW721_BASE_CODE_ID = process.env.NEXT_PUBLIC_CW721_BASE_CODE_ID || 388

const PUBLIC_PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY || ''
const PUBLIC_PINATA_SECRET_API_KEY = process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY || ''
const PUBLIC_PINATA_URL = process.env.NEXT_PUBLIC_PINATA_URL || ''
let themeValue = "1"
function RadioCard(props) {
  const { getInputProps, getCheckboxProps } = useRadio(props)
  const input = getInputProps()
  const checkbox = getCheckboxProps()
  
  return (
    <Box as='label'>
      <input {...input} />
      <Box
        {...checkbox}
        cursor='pointer'
        borderWidth='1px'
        borderRadius='md'
        boxShadow='md'
        _checked={{
          // boxShadow: 'outline',
        }}
        _focus={{
          // boxShadow: 'outline',
        }}
        className={props.isChecked?'active':''}
        px={5}
        py={3}
      >
        {props.children}
      </Box>
    </Box>
  )
}

let collectionTokenArr = []
let collectionTokenCount = 0
export const CollectionCreate = () => {
  const router = useRouter()
  //const toast = useToast()
  const [nftcategories, setNftCategories] = useState<NftCategory[]>(
    []
  )
  const [isJsonUploading, setJsonUploading] = useState(false)
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("0")
  const [website, setWebsite] = useState("")
  const [discord, setDiscord] = useState("")
  const [instagram, setInstagram] = useState("")
  const [medium, setMedium] = useState("")
  const [telegram, setTelegram] = useState("")
  const [maximumRoyaltyFee, setMaximumRoyaltyFee] = useState("")
  const [explicit, setExplicit] = useState("")
  const [collectionIpfsHash, setCollectionIpfsHash] = useState("")
  const { client } = useSdk()
  const { address, client: signingClient } = useRecoilValue(walletState)
  const [token, setToken] = useState("")
  const [tokens, setTokens] = useState<number[]>([])
  const [collectionTokens, setCollectionTokens] = useState<CollectionToken[]>([])
  const [tokenReomveCount, setTokenReomveCount] = useState(0)
  const [inputFields, setInputFields] = useState([{address:address, rate: 0}])
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

  const handleNameChange = (event) => {
    setName(event.target.value)
  }
  const handleSlugChange = (event) => {
    setSlug(event.target.value)
  }
  const handleDescriptionChange = (event) => {
    setDescription(event.target.value)
  }
  const handleCategoryChange = (event) => {
    setCategory(event.target.value)
  }
  const handleWebsiteChange = (event) => {
    setWebsite(event.target.value)
  }
  const handleDiscordChange = (event) => {
    setDiscord(event.target.value)
  }
  const handleInstagramChange = (event) => {
    setInstagram(event.target.value)
  }
  const handleMediumChange = (event) => {
    setMedium(event.target.value)
  }
  const handleTelegramChange = (event) => {
    setTelegram(event.target.value)
  }
  const handleMaximumRoyaltyFeeChange = (event) => {
    setMaximumRoyaltyFee(event.target.value)
  }
  const handleTokenChange = (event) => {
    setToken(event.target.value)
    if (tokens.indexOf(parseInt(event.target.value)) == -1){
      console.log("tokens", tokens, event.target.value)
      if (event.target.value == "")
        return
      let tokenIds = tokens
      tokenIds.push(parseInt(event.target.value))
      setTokens(tokenIds)
      collectionTokenArr = tokenIds
      collectionTokenCount++
      setTokenReomveCount(collectionTokenCount)
    }
  }
  
  // reducer function to handle state changes
  const reducer = (state, action) => {
    switch (action.type) {
      case "SET_IN_DROP_ZONE":
        return { ...state, inDropZone: action.inDropZone }
      case "ADD_FILE_TO_LIST":
        return { ...state, fileList: state.fileList.concat(action.files) }
      case "SET_LOGO":
        console.log("state logo", action.logo)
        return { ...state, logo: action.logo}
      case "SET_FEATURED_IMAGE":
        return { ...state, featuredImage: action.featuredImage}
      case "SET_BANNER":
        return { ...state, banner: action.banner}
      default:
        return state
    }
  }

  // destructuring state and dispatch, initializing fileList to empty array
  const [data, dispatch] = useReducer(reducer, {
    inDropZone: false,
    fileList: [],
    logo: "",
    featuredImage: "",
    banner: "",
  })

  const options = ['1', '2', '3']
  const { getRootProps, getRadioProps } = useRadioGroup({
    name: 'template',
    defaultValue: '1',
    onChange: console.log,
  })
  const group = getRootProps()
  

  useEffect(() => {
    (async () => {
      let res_categories = await fetch(process.env.NEXT_PUBLIC_CATEGORY_URL)
      let categories = await res_categories.json()
      setNftCategories(categories.categories)
      const response = await fetch(process.env.NEXT_PUBLIC_COLLECTION_TOKEN_LIST_URL)
      const collectionTokenList = await response.json()
      setCollectionTokens(collectionTokenList.tokens)
    })()

  }, [])

  useEffect(() => {
    console.log("collectionTokenArr", collectionTokenArr)

  }, [tokenReomveCount])
  
  const createCollection = async(e) => {
    
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

    if (name == "")
    {
      toast.warning(
        `Please input the collection name.`,
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
    if (data.logo == "")
    {
      toast.warning(
        `Please upload a logo image.`,
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
    
    let tokenSymbols = []
    for (let i = 0; i < tokens.length; i++){
      tokenSymbols.push(collectionTokens[tokens[i]].symbol)
    }
    // if (tokenSymbols.length == 0){
    //   toast.warning(
    //     `Please select a payment token.`,
    //     {
    //       position: 'top-right',
    //       autoClose: 5000,
    //       hideProgressBar: true,
    //       closeOnClick: true,
    //       pauseOnHover: true,
    //       draggable: true,
    //       progress: undefined,
    //     }
    //   )
    //   return  
    // }

    if (maximumRoyaltyFee == ""){
      toast.warning(
        `Please input the maximum royalty fee.`,
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
    let total_royalty_rate:number = 0
    let royaltiesArr:any = []
    const royalties = [...inputFields]

    for (let i = 0; i < royalties.length; i++){
      total_royalty_rate += parseFloat(royalties[i]["rate"].toString())
      royalties[i]["rate"] = royalties[i]["rate"]
      royaltiesArr.push({"address": royalties[i]['address'], "rate": royalties[i]["rate"] * 10000})
    }
    if (total_royalty_rate > parseFloat(maximumRoyaltyFee)){
      toast.warning(
        `Total royalty rate should be smaller than Maximum Royalty Fee.`,
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
    const jsonData = {}
    jsonData["logo"] = data.logo
    jsonData["featuredImage"] = data.featuredImage
    jsonData["banner"] = data.banner
    jsonData["name"] = name
    jsonData["slug"] = ""
    jsonData["description"] = description
    jsonData["category"] = category
    jsonData["website"] = website
    jsonData["discord"] = discord
    jsonData["instagram"] = instagram
    jsonData["medium"] = medium
    jsonData["telegram"] = telegram
    jsonData["royalties"] = royaltiesArr
    jsonData["network"] = "JUNO"
    jsonData["tokens"] = ["BLOCK"]//tokenSymbols
    jsonData["maximumRoyaltyFee"] = parseFloat(maximumRoyaltyFee) * 10000
    jsonData["themeValue"] = themeValue
    jsonData["explicit"] = explicit
    jsonData["owner"] = address
    const pinataJson = {
      "pinataMetadata": 
      {
        "name": name, 
        keyvalues:
        {
          "slug": slug
        }
      }, 
      "pinataContent": jsonData
    }
    console.log(pinataJson)
    setJsonUploading(true)
    let url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`
    let response = await axios
        .post(url, pinataJson, {
            maxBodyLength: Infinity, //this is needed to prevent axios from erroring out with large files
            headers: {
                'Content-Type': `application/json`,
                pinata_api_key: PUBLIC_PINATA_API_KEY,
                pinata_secret_api_key: PUBLIC_PINATA_SECRET_API_KEY
            }
        })
    let ipfsHash = ""
    if (response.status == 200){
      console.log(response)
      setCollectionIpfsHash(response.data.IpfsHash)
      ipfsHash = response.data.IpfsHash
    }
    setJsonUploading(false)
    
    if (!address || !signingClient) {
      console.log("unauthorized user")
      return
    }
    const marketContract = Market(PUBLIC_MARKETPLACE).useTx(signingClient)
    const collection = await marketContract.addCollection(
      address, 10000, name, "BLOCK", Number(PUBLIC_CW721_BASE_CODE_ID), Number(parseFloat(maximumRoyaltyFee) * 10000), royaltiesArr, ipfsHash
    )
    console.log("Collection:", collection)
    toast.success(
      `You have created your collection successfully.`,
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
  return (
    <Container>
      <p><span className="required">*</span> Required Fields</p>
      <LogoFeaturedContinaer className="logo-featured-container collection-item">
        <LogoContainer>
          <h3>Logo image <span className="required">*</span></h3>
          <p>This image will also be used for navigation. 350*350 recommended.</p>
          <AspectRatio maxW='350px' ratio={1}>
            <DropZone data={data} dispatch={dispatch} item="logo"/>
          </AspectRatio>
        </LogoContainer>
        <FeaturedContainer className="hide">
          <h3>Featured image</h3>
          <p>This image will also be used for Featured your collection on home page, category pages, or other promotional areas of OpenSea. 600*400 recommended.</p>
          <AspectRatio maxW='600px' ratio={1.5}>
            <FeaturedImageUpload data={data} dispatch={dispatch} item="featured"/>
          </AspectRatio>
        </FeaturedContainer>
      </LogoFeaturedContinaer>
      <BannerContainer className="collection-item hide">
        <h3>Banner image</h3>
        <p>This image will appear at the top of your collection page. Avoid including too much text in this banner image, as the dimemsions change on different devices. 1400*400 recommended.</p>
        <AspectRatio maxW='1400px' ratio={3.5}>
          <BannerImageUpload data={data} dispatch={dispatch} item="collection-banner"/>
        </AspectRatio>
      </BannerContainer>
      <ChakraProvider>
        <CollectionItem className="collection-item">
          <h3>Name <span className="required">*</span></h3>
          <Input
                  pr='48px'
                  type='text'
                  placeholder='Example: Treasures of the Sea'
                  value={name} onChange={handleNameChange}
                />
        </CollectionItem>
        <CollectionItem className="collection-item hide">
          <h3>URL <span className="required">*</span></h3>
          <p>Customize your URL on Marble NFT Marketplace. Must only contain lowercase letters, numbers, and hyphens.</p>
          <InputGroup size='sm'>
            <InputLeftAddon children={`${window.location.origin}/`} />
            <Input placeholder='collection-name' value={slug} onChange={handleSlugChange}/>
          </InputGroup>
        </CollectionItem>
        <CollectionItem className="collection-item">
          <h3>Description</h3>
          <p>Markdown syntax is supported. 0 of 1000 characters used.</p>
          <Textarea value={description} onChange={handleDescriptionChange}/>
        </CollectionItem>
        <CollectionItem className="collection-item">
          <h3>Category</h3>
          <p>Adding a category will help make your item discoverable on Marble NFT Marketplace.</p>
          <Select id='category_id' value={category} onChange={handleCategoryChange}>
            {nftcategories.length > 0 && nftcategories.map((category, idx) => (
                <option value={category.id} key={`cat${idx}`}>{category.name=='All'?'':category.name}</option>
            ))}
          </Select>
        </CollectionItem>
        <CollectionItem className="collection-item">
          <h3>Link</h3>
          <Stack spacing={0} className="link-group">
            <InputGroup className="link-item first-item">
              <InputLeftAddon pointerEvents='none'>
                <YourSite/>
              </InputLeftAddon>
              <Input type='text' placeholder='yoursite.io' value={website} onChange={handleWebsiteChange}/>
            </InputGroup>
            <InputGroup className="link-item">
              <InputLeftAddon pointerEvents='none'>
                <Discord/>https://discord.gg/
              </InputLeftAddon>
              <Input placeholder='abcdef' value={discord} onChange={handleDiscordChange}/>
            </InputGroup>
            <InputGroup className="link-item">
              <InputLeftAddon pointerEvents='none'>
                <Instagram/>https://www.instagram.com/
              </InputLeftAddon>
              <Input type='text' placeholder='YourInstagramHandle' value={instagram} onChange={handleInstagramChange}/>
            </InputGroup>
            <InputGroup className="link-item">
              <InputLeftAddon pointerEvents='none'>
                <MediumM/>https://medium.com/@
              </InputLeftAddon>
              <Input type='text' placeholder='YourMediumHandle' value={medium} onChange={handleMediumChange}/>
            </InputGroup>
            <InputGroup className="link-item last-item">
              <InputLeftAddon pointerEvents='none'>
                <Telegram/>https://t.me/
              </InputLeftAddon>
              <Input type='text' placeholder='abcdef' value={telegram} onChange={handleTelegramChange}/>
            </InputGroup>
          </Stack>
        </CollectionItem>
        <CollectionItem className="collection-item">
          <h3>Creator earnings</h3>
          <p>Collec a free when a user re-sells an item you originally created. This is deducted from the final sale price and paid monthly to a payout of your choosing.</p>
          <Link href="#" passHref>Learn more about creator earnings.</Link>
          
          <RatesContainer>
            <h4>Royalty</h4>
            <h4>Maximum Royalty Fee <span className="required">*</span></h4>
            <Input
                    type='number'
                    value={maximumRoyaltyFee} onChange={handleMaximumRoyaltyFeeChange}
                  />
            {inputFields.map((data, index)=>{
                const {address, rate}= data;
                return(
                  <div className="rate-item" key={index}>
                    <Input type="text" readOnly={index!==0?false:true} onChange={(evnt)=>handleChange(index, evnt)} value={address} name="address" className="form-control"  placeholder="Address" />
                    <Input type="number" onChange={(evnt)=>handleChange(index, evnt)} value={rate} name="rate" className="form-control"  placeholder="Rate" />
                    <Button disabled={index!==0?false:true} onClick={removeInputFields}>x</Button>
                  </div>
                )
              })
            }

            <div className="add-rate-item">
              <Button onClick={addInputField}>Add New</Button>
            </div>
          </RatesContainer>
        </CollectionItem>
        <CollectionItem className="collection-item">
          <h3>Blockchain</h3>
          <HStack spacing={0} className="chain-group">
            <Image alt="Token Icon" className="token-icon" src="/juno.png"/><span>JUNO</span>
          </HStack>
        </CollectionItem>
        <CollectionItem className="collection-item hide">
          <h3>Payment tokens</h3>
          <HStack spacing={0} className="chain-group">
          
            {collectionTokens.length > 0 && collectionTokens.map((token, idx) => (
              <Button
                key={`token${idx}`}
                variant="secondary"
                className={`${tokens.indexOf(idx) != -1?'active':'default'}`}
                onClick={() => {

                  // if (tokens.indexOf(idx) == -1){
                  //   let tokenIds = tokens
                  //   tokenIds.push(idx)
                  //   setTokens(tokenIds)
                  //   collectionTokenCount++
                  //   setTokenReomveCount(collectionTokenCount)
                  // }else{
                  //   let tokenIds = tokens
                  //   tokenIds.splice(tokenIds.indexOf(idx), 1)
                  //   console.log("Tokens", tokenIds)
                  //   setTokens(tokenIds)
                  //   collectionTokenCount--
                  //   setTokenReomveCount(collectionTokenCount)
                  // }
                  if (tokens.indexOf(idx) == -1){
                    let tokenIds = []
                    tokenIds.push(idx)
                    setTokens(tokenIds)
                    collectionTokenCount++
                    setTokenReomveCount(collectionTokenCount)
                  }else{
                    let tokenIds = tokens
                    tokenIds.splice(tokenIds.indexOf(idx), 1)
                    console.log("Tokens", tokenIds)
                    setTokens([])
                    collectionTokenCount--
                    setTokenReomveCount(collectionTokenCount)
                  }
                  return false
                }}
              >
                
                <Image alt="Token Icon" className="token-icon" src={collectionTokens[idx].logoUri}/>{token.name}
                <span className={`${tokens.indexOf(idx) != -1?'visible-yes':'visible-no'}`}>
                <CheckIcon />
                </span>
              </Button>
            ))}
          
          </HStack>
        </CollectionItem>
        <CollectionItem className="collection-item hide">
          <h3>Display theme</h3>
          <p>Change how your items are shown.</p>
          <Stack spacing={0} className="theme-group">
            <HStack {...group}>
              {options.map((value) => {
                const radio = getRadioProps({ value })
                if (radio.isChecked){
                  themeValue = radio.value.toString()
                }
                
                return (
                  <RadioCard key={value} value={value} {...radio}>
                    {value == '1' &&
                      <Template>
                        <CheckboxItem className="check-icon"><CheckIcon/></CheckboxItem>
                        <Design>
                          <Template1/><Template1/><Template1/>
                        </Design>
                        <h3>Padded</h3>
                        <p>Recommended for assets with transparent background</p>
                      </Template>
                    }
                    {value == '2' &&
                      <Template>
                        <CheckboxItem className="check-icon"><CheckIcon/></CheckboxItem>
                        <Design>
                          <Template1/><Template1/><Template1/>
                        </Design>
                        <h3>Contained</h3>
                        <p>Recommended for assets that are not a 1:1 ratio</p>
                      </Template>
                    }
                    {value == '3' &&
                      <Template>
                        <CheckboxItem className="check-icon"><CheckIcon/></CheckboxItem>
                        <Design>
                          <Template1/><Template1/><Template1/>
                        </Design>
                        <h3>Covered</h3>
                        <p>Recommended for assets that can extend to the edge</p>
                      </Template>
                    }
                  </RadioCard>
                )
              })}
            </HStack>
          </Stack>
        </CollectionItem>
        <CollectionItem className="collection-item hide">
          <h3>Explicit & sensitive content</h3>
          <ExplicitItem>
            <p>Set this collection as explicit and senstive content</p>
            <Switch value="yes" id='explicit-senstive' onChange={(e) => e.target.checked?setExplicit(e.target.value):setExplicit("")}/>
          </ExplicitItem>
        </CollectionItem>
        <CollectionItem className="collection-item">
          <Button className="btn-default"
            css={{
              'background': '$black',
              'color': '$white',
              'stroke': '$white',
            }}
            variant="primary"
            size="large"
            onClick={(e) => {
              
              createCollection(e)
            
            }}

            disabled={isJsonUploading}
          >
            Create
          </Button>
          {collectionIpfsHash != "" &&
            <span className="hide">
            Pinata IpfsHash: <Link href={`https://gateway.pinata.cloud/ipfs/${collectionIpfsHash}`} passHref>{collectionIpfsHash}</Link>
            </span>
          }
        </CollectionItem>
      </ChakraProvider>
    </Container>
  )
}

const Container = styled('div', {
  maxWidth: '1400px',
  '.collection-item':{
    marginBottom: '$16',
  },
  'h3':{
    fontWeight: 'bold',
  },
  'p':{
    color: '$textColors$secondary',
  }
})
const LogoFeaturedContinaer = styled('div', {

})
const LogoContainer = styled('div', {

})
const FeaturedContainer = styled('div', {

})
const BannerContainer = styled('div', {

})
const CollectionItem = styled('div', {
  '.link-group':{
    border: '1px solid $chakraborder',
    borderRadius: '$2',
    '.link-item':{
      borderLeft: '0px',
      borderRight: '0px',
      borderTop: '0px',
      borderBottom: '1px solid $chakraborder',
      '>div':{
        border: '0px',
        borderRadius: '0px',
        background: 'transparent',
        paddingRight: '1px',
        'svg':{
          marginRight: '$8',
          width: '26px',
          height: '25px',
          'path':{
            fill: '$chakraicon',
          }
        }
      },
      '>input':{
        border: '0px',
        borderRadius: '0px',
        paddingLeft: '0px',
        boxShadow: 'none',
      },
      '&.last-item':{
        border: '0px',
      }
    }
  },
  '.chain-group':{
    border: '1px solid $chakraborder',
    borderRadius: '$2',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    'img':{
      width: '$8',
      margin: '$4'
    },
    'button':{
      '&.active':{
        background: '$backgroundColors$tertiary',
        fontWeight: 'bold',
      }
    }
  },
  '.theme-group':{
    
    'p':{
      textAlign: 'center',
    },
    'div':{
      gap: '$8',
      ' label':{
        maxWidth: '380px',
      },
    },
    'div[data-checked]':{
      border: '1px solid $borderColors$themeSelected',
    },
    '.active':{
      ' .check-icon':{
        display: 'block',
      }
    }

  }
})
const CheckboxItem = styled('div', {
  display: 'none',
  position: 'absolute',
  top: '$space$27',
  right: '$space$27',
  'svg':{
    background: '$black',
    borderRadius: '50%',
    width: '$9',
    height: '$9',
    padding: '$space$3',
    border: '$borderWidths$3 solid $white',
    boxShadow: '0px 4px 44px $backgroundColors$secondary'
  }
})
const Template = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '$8',
  position: 'relative',
})
const Design = styled('div', {
  display: 'flex',
  justifyContent: 'center',
  gap: '$4',
})
const ExplicitItem = styled('div', {
  display: 'flex',
  '.chakra-switch':{
    marginLeft: 'auto',
    '>span[data-checked]':{
      background: '$black',
    }
  }
})
const TokenItem = styled('div', {
  'flexDirection': 'row',
  'display': 'flex',
  'justifyContent': 'center',
  'alignItems': 'center',
})
const CollectionTokenItem = styled('div', {
  'flexDirection': 'row',
  'display': 'flex',
  'justifyContent': 'center',
  'alignItems': 'center',
})

const RatesContainer = styled('div', {
  display: 'flex',
  justifyContent: 'space-between',
  flexDirection: 'column',
  '.rate-item': {
    display: 'flex',
    justifyContent: 'left',
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