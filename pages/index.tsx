import React from 'react'
import { AppLayout } from '../components/Layout/AppLayout'
import { PageHeader } from '../components/Layout/PageHeader'
import { Explore } from '../features/nft/market/explore'
import { styled } from 'components/theme'
import { useState } from "react";
import { useConnectWallet } from '../hooks/useConnectWallet'
import { useRecoilState } from 'recoil'
import { walletState, WalletStatusType } from '../state/atoms/walletAtoms'
import HomePage from  "../features/home";

export default function Home() {
  const [fullWidth, setFullWidth] = useState(true);
  const { mutate: connectWallet } = useConnectWallet()
  const [{ key }, setWalletState] = useRecoilState(walletState)
  function resetWalletConnection() {
    setWalletState({
      status: WalletStatusType.idle,
      address: '',
      key: null,
      client: null,
    })
  }
  return (
    <AppLayout fullWidth={fullWidth}>
        <Container className="middle mauto">
          {/* <Explore/> */}
          <HomePage />
        </Container>
    </AppLayout>
  )
}

const Container = styled('div', {

})
