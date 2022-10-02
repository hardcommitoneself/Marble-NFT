import * as React from "react"
import { styled } from 'components/theme'
import {
  CircularProgress
} from '@chakra-ui/react'

export const LoadingProgress = () => {
  return (
    <LoadingContainer>
      <CircularProgress isIndeterminate />
    </LoadingContainer>
  )
}
const LoadingContainer = styled('div', {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  '.chakra-progress':{
    '.chakra-progress__indicator':{
      stroke: '#000',
    }
  }
})