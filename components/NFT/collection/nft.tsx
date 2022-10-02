import * as React from "react";
import { useState } from "react";
import Link from 'next/link'
import { NftCollection } from "services/nft";
import styled from 'styled-components'
import { ChakraProvider, Stack, HStack, LinkBox } from '@chakra-ui/react'
import { isClientMobie } from 'util/device'
import { RoundedIconComponent } from 'components/RoundedIcon'

interface NftCollectionProps {
  readonly collections: NftCollection[];
  readonly activeCategoryId: number;
}

export function NftCollectionTable({ collections, activeCategoryId }: NftCollectionProps): JSX.Element {
  return (
    <>
      {/* <CollectionsDiv className="collections">
      {collections.map((collection, idx) => (
        (activeCategoryId == 0 || collection.cat_ids.split(",").indexOf(activeCategoryId.toString()) != -1) && (
          <Link href={`/collection/${collection.id}`} passHref key={idx}>
          <CollectionDiv className="collection" key={idx}>
            <ImgDiv className="nft-img-div">
            {collection.type == 'image' &&
              <Image src={collection.image} alt="NFT Image"/>
            }
            {collection.type == 'video' &&
            <video controls>
              <source src={collection.image}/>
            </video>
            }
            {collection.type == 'audio' &&
            <audio controls>
              <source src={collection.image}/>
            </audio>
            }
              
            </ImgDiv>
            <BannerDiv className="nft-banner-div">
              {collection.type == 'image' &&
                <Image src={collection.image} alt="NFT Image"/>
              }
              {collection.type == 'video' &&
              <video>
                <source src={collection.image}/>
              </video>
              }
              {collection.type == 'audio' &&
              <audio>
                <source src={collection.image}/>
              </audio>
              }
            </BannerDiv>
            <TextDiv>
            <h2>{collection.name}</h2>
            <h5><span>by</span> <a href="#">{collection.creator}</a></h5>
            <p>{collection.description}</p>
            </TextDiv>
          </CollectionDiv>
          </Link>
        )
      ))}
      </CollectionsDiv> */}
      <Container>
        {collections.map((collection, idx) => (
            <Link href={`/collection/${collection.id}`} passHref key={idx}>
              <LinkBox
                as="picture"
                transition="transform 0.6s cubic-bezier(0.165, 0.84, 0.44, 1) 0s"
                _hover={{
                  transform: 'scale(1.05)',
                }}
              >
                <CollectionDiv className="collection" key={idx}>
                  <ImgDiv className="nft-img-div">
                    {
                      collection.type == 'image' && 
                        <Image src={collection.image} alt="NFT Image" />
                    }
                    {
                      collection.type == 'video' &&
                        <video controls>
                          <source src={collection.image}/>
                        </video>
                    }
                    {
                      collection.type == 'audio' &&
                        <audio controls>
                          <source src={collection.image}/>
                        </audio>
                    }
                  </ImgDiv>
                  <HStack marginTop="30px">
                    <BannerDiv className="nft-banner-div">
                      {collection.type == 'image' &&
                        <Image src={collection.image} alt="NFT Image"/>
                      }
                      {collection.type == 'video' &&
                      <video>
                        <source src={collection.image}/>
                      </video>
                      }
                      {collection.type == 'audio' &&
                      <audio>
                        <source src={collection.image}/>
                      </audio>
                      }
                    </BannerDiv>
                    <Stack>
                      <Title>{collection.name}</Title>
                      <RoundedIconComponent
                        size="0px"
                        address={collection.creator}
                        font={isClientMobie ? '15px' : '20px'}
                      />
                    </Stack>
                  </HStack>
                </CollectionDiv>
              </LinkBox>
            </Link>
          ))}
      </Container>
    </>
  );
}

const Container = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 50px 30px;
`
const CollectionDiv = styled.div`
  border-radius: 20px;
  box-shadow: 0px 4px 40px rgba(42, 47, 50, 0.09), inset 0px 7px 24px #6d6d78;
  border: 1px solid;
  border-image-source: linear-gradient(
    90.65deg,
    #ffffff 0.82%,
    rgba(0, 0, 0, 0) 98.47%
  );
  background: linear-gradient(0deg, #050616, #050616) padding-box,
    linear-gradient(90.65deg, #ffffff 0.82%, rgba(0, 0, 0, 0) 98.47%) border-box;
  padding: 30px;
  height: 100%;
  cursor: pointer;
  @media (max-width: 1450px) {
    padding: 15px;
  }
  @media (max-width: 480px) {
    width: 320px;
  }
`

const ImgDiv = styled.div`
  width: 100%;
  display: block;
  position: relative;
`

const Image = styled.img`
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  width: 100%;
  object-fit: cover;
  object-position: center;
  border-radius: 20px;
`
const Logo = styled.img<{ size: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  border-radius: 50%;
`
const Title = styled.div`
  font-size: 20px;
  overflow-wrap: anywhere;
  @media (max-width: 1450px) {
    font-size: 18px;
  }
`

const BannerDiv = styled.div`
  display: inline-block;
  width: 74px;
  height: 74px;
  border-radius: 50%;
  justify-content: center;
  text-align: center;

  & img {
    width: 70px;
    height: 70px;
    border-radius: 50%;
  }

  & video {
    width: 70px;
    height: 70px;
    border-radius: 50%;
  }
`