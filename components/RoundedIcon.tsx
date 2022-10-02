import styled from 'styled-components'
import { useState, useEffect } from 'react'
import { HStack, Text, Stack } from '@chakra-ui/react'
import Link from 'next/link'

export const RoundedIcon = styled.img<{ size: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  border-radius: 50%;
  border: 1px solid #ffffff;
`

export const Flex = styled.div<{ direction: string }>`
  display: flex;
  cursor: pointer;
  flex-direction: ${({ direction }) => direction};
  align-items: center;
  column-gap: 15px;
  row-gap: 15px;
`

export const RoundedIconComponent = ({
  size,
  address,
  font = '14px',
  direction = 'row',
}) => {
  const [src, setSrc] = useState('')
  const [user, setUser] = useState('')
  useEffect(() => {
    ;(async () => {
    //   const { avatar, name } = await getLogoUriFromAddress(address)
      const avatar = '/logo.png'
      const name = ''
      setSrc(avatar)
      setUser(name)
    })()
  }, [address])
  return (
    <Link href={`/profile/${address}`}>
      <Flex direction={direction}>
        {size !== '0px' && <RoundedIcon size={size} src={src} />}
        <Text fontSize={font} fontWeight="800" fontFamily="Mulish">
          {user}
        </Text>
      </Flex>
    </Link>
  )
}
export const RoundedBidIconComponent = ({ size, address, font = '14px' }) => {
  const [src, setSrc] = useState('')
  const [user, setUser] = useState('')
  useEffect(() => {
    ;(async () => {
    //   const { avatar, name } = await getLogoUriFromAddress(address)
      const avatar = '/logo.png'
      const name = ''
      setSrc(avatar)
      setUser(name)
    })()
  }, [address])
  return (
    <Link href={`/profile/${address}`}>
      <HStack style={{ cursor: 'pointer' }}>
        <RoundedIcon size={size} src={src} />
        <Stack>
          <Text fontSize="14px">Bid By</Text>
          <Text fontSize={font} fontWeight="800" fontFamily="Mulish">
            {user}
          </Text>
        </Stack>
      </HStack>
    </Link>
  )
}
