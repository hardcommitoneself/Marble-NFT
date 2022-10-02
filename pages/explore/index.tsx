import * as React from 'react'
import {
    ChakraProvider,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
  } from '@chakra-ui/react'
import styled from 'styled-components'
import { AppLayout } from 'components/Layout/AppLayout'
import { Explore } from 'features/nft/market/explore'

export default function Explores() {
    return (
        <AppLayout fullWidth={true}>
            <Tabs overflow="auto">
                <StyledTabList>
                    <StyledTab>{`NFTs(${5})`}</StyledTab>
                    <StyledTab>{`Collections(${10})`}</StyledTab>
                    <StyledTab>{`Profiles(${12})`}</StyledTab>
                </StyledTabList>

                <TabPanels>
                    <TabPanel>
                        {/* <NFTExplorer /> */}
                    </TabPanel>
                    <TabPanel>
                        <Explore />
                    </TabPanel>
                    <TabPanel>
                        {/* <Profiles profileCounts={profiles} /> */}
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </AppLayout>
    )
}

const StyledTabList = styled(TabList)`
  width: fit-content;
  border-bottom: 2px solid;
  border-color: rgba(255, 255, 255, 0.1) !important;
  font-weight: 400;
  .css-1ltezim[aria-selected='true'] {
    border-color: #ffffff;
    font-weight: 600;
    color: white;
  }
`

const StyledTab = styled(Tab)`
  font-size: 22px;
  font-weight: 400;
  padding: 20px;
  margin: 0 20px;
`