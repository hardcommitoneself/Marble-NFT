import React from "react";
import { useEffect, useState } from "react";
import { Menu, MenuButton, MenuList, MenuItem } from "@chakra-ui/react";
import Link from "next/link";
import { Button } from "../Button";
{
  /*import { Text } from '../Text'
import { Logo } from '../../icons/Logo'
import { LogoText } from '../../icons/LogoText'*/
}
import { useConnectWallet } from "../../hooks/useConnectWallet";
import { useRecoilState } from "recoil";
import { walletState, WalletStatusType } from "../../state/atoms/walletAtoms";
import { useRouter } from "next/router";
import { isMobile } from "util/device";
import { RoundedIcon, RoundedIconComponent } from "components/RoundedIcon";
import { default_image } from "../../util/constants";

import {
  Search,
  User,
  RoundedLeft,
  UpRightArrow,
  ArrowDown,
  Exchange,
  Presale,
  Open,
  Dao,
  NFTs,
  Dash,
  NewDash,
  Airdrop,
  Astronaut,
  Ellipse,
  Nav,
} from "../../icons";
import { IconWrapper } from "../IconWrapper";
import { ConnectedWalletButton } from "../ConnectedWalletButton";

import { styled } from "../theme";
import {
  StyledWrapper,
  StyledListForLinks,
  StyledLink,
  StyledDivForLogo,
  CreateButton,
} from "./styled";
import { __TEST_MODE__ } from "../../util/constants";

export function NavigationSidebar({ openNav, setOpenNav }) {
  const { mutate: connectWallet } = useConnectWallet();
  const [{ key }, setWalletState] = useRecoilState(walletState);

  function resetWalletConnection() {
    setWalletState({
      status: WalletStatusType.idle,
      address: "",
      key: null,
      client: null,
    });
  }

  const { pathname } = useRouter();
  const getActiveStylesIfActive = (path) =>
    pathname === path ||
    (pathname.indexOf("/collection/") != -1 &&
      path.indexOf("/collection/") != -1)
      ? {
          borderBottom: "3px solid $white",
          background:
            "linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.22) 100%)",
        }
      : { borderBottom: "3px solid transparent", background: "transparent" };

  const isActive = (path) => (pathname === path ? "active" : "");
  const StyledImageForLogoText = styled("img", {
    borderRadius: "0%",
  });
  return (
    <>
      {/* <StyledWrapper className={`wrap-header ${openNav ? 'open' :''}`}>
        <StyledMenuContainer className="wrap-menu container">
          <IconWrapper
            className="mobile-nav"
              type="button"
              icon={<Nav />}
              onClick={() => {
                setOpenNav(!openNav)
              }}
          />
          <Link href="/" passHref>
            <StyledDivForLogo as="a">
              <StyledImageForLogoText className="logo-img" src="/images/logotext.svg" />
            </StyledDivForLogo>
          </Link>

          <StyledListForLinks className="top-menu-links">
          <div className="dropdown">
            <Link href="https://app.marbledao.finance/dashboard" passHref>
              <button className="dropbtn">
                  Dashboard
                    <NewDash />
              </button>
            </Link>
          </div>
          <div className="dropdown">
            <button className="dropbtn">
              DeFi
              <ArrowDown />
            </button>
            <div className="dropdown-content">
              <Link href="https://app.marbledao.finance/" passHref>
                <a className="dropdown-item">
                  <Exchange />
                  <span className={isActive('/')}>Swap</span>
                </a>
              </Link>
              <Link href="https://app.marbledao.finance/transfer" passHref>
                <a className="dropdown-item">
                  <UpRightArrow />
                  <span className={isActive('https://app.marbledao.finance/transfer')}>Transfer</span>
                </a>
              </Link>
              <Link href="https://app.marbledao.finance/presale-claim" passHref>
                <a className="dropdown-item">
                  <Airdrop />
                  <span className={isActive('https://app.marbledao.finance/presale-claim')}>
                    Presale Claim
                  </span>
                </a>
              </Link>
              <Link href="https://app.marbledao.finance/early-lp" passHref>
                <a className="dropdown-item">
                  <Ellipse />
                  <span className={isActive('https://app.marbledao.finance/early-lp')}>
                    Early LPers
                  </span>
                </a>
              </Link>
            </div>
          </div>
          <div className="dropdown">
              <button className="dropbtn">
                NFT Marketplace<span className="span-mark">Beta</span>
                <ArrowDown />
              </button>
              <div className="dropdown-content">
                <Link href="/" passHref>
                  <a className="dropdown-item">
                    <Search />
                    <span className={isActive('/')}>
                    Explore
                    </span>
                  </a>
                </Link>
                { Boolean(key?.name) &&
                <Link href="/profile" passHref>
                  <a className="dropdown-item">
                    <User />
                    <span className={isActive('/profile')}>
                    Profile
                    </span>
                  </a>
                </Link>
                }
                {Boolean(key?.name) &&
                <Link href="/collection/create" passHref>
                  <a className="dropdown-item">
                    <Astronaut />
                    <span className={isActive('/collection/create')}>
                    Create Collection
                    </span>
                  </a>
                </Link>
                }
                { Boolean(key?.name) &&
                <Link href="/nft/create" passHref>
                  <a className="dropdown-item">
                    <Astronaut />
                    <span className={isActive('/nft/create')}>
                    Create NFT
                    </span>
                  </a>
                </Link>
                }
                
              </div>
            </div>
          <div className="dropdown">
            <button className="dropbtn">
              Airdrop
              <ArrowDown />
            </button>
            <div className="dropdown-content">
              <Link
                href="https://app.marbledao.finance/airdrop"
                passHref
              >
                <a className="dropdown-item">
                  <span className={isActive('/airdrop')}>Marble GovDrop</span>
                </a>
              </Link>
              <Link
                href="https://app.marbledao.finance/block-airdrop"
                passHref
              >
                <a className="dropdown-item">
                  <span className={isActive('/block-airdrop')}>Block Drop</span>
                </a>
              </Link>
            </div>
          </div>
          <div className="dropdown">
            <button className="dropbtn">
              Governance
              <ArrowDown />
            </button>
            <div className="dropdown-content">
              <Link
                href="https://daodao.zone/dao/juno1zz3gc2p9ntzgjt8dh4dfqnlptdynxlgd4j7u2lutwdg5xwlm4pcqyxnecp"
                passHref
              >
                <a className="dropdown-item" target="__blank">
                  <Dao />
                  <span>New DAO</span>
                </a>
              </Link>
              <Link
                href="https://daodao.zone/dao/juno1ay840g97ngja9k0f9lnywqxwk49245snw69kpwz0ry9qv99q367q3m4x8v"
                passHref
              >
                <a className="dropdown-item" target="__blank">
                  <Dao />
                  <span>Old DAO</span>
                </a>
              </Link>
            </div>
          </div>
          </StyledListForLinks>

          <ConnectedWalletButton
            connected={Boolean(key?.name)}
            walletName={key?.name}
            onConnect={() => connectWallet(null)}
            onDisconnect={resetWalletConnection}
          />

        </StyledMenuContainer>
      </StyledWrapper>
      <MobileMenu className={`mobile-menu ${openNav ? 'open' :''}`}>

        <StyledListForLinks className={`top-menu-links ${openNav ? 'open' :''}`}>
        <Link href="https://app.marbledao.finance/dashboard" passHref>
          <Button className="top-menu"
            as="a"
            variant="ghost"
            iconCenter={<IconWrapper icon={<NewDash />} />}
            css={getActiveStylesIfActive('https://app.marbledao.finance/dashboard')}
          >
            Dashboard
          </Button>
        </Link>
        <Link href="https://app.marbledao.finance" passHref>
          <Button
            className="top-menu"
            as="a"
            variant="ghost"
            iconCenter={<IconWrapper icon={<Exchange />} />}
            css={getActiveStylesIfActive('https://app.marbledao.finance')}
          >
            Swap
          </Button>
        </Link>
        <Link href="https://app.marbledao.finance/transfer" passHref>
          <Button
            className="top-menu"
            as="a"
            variant="ghost"
            iconCenter={<IconWrapper icon={<UpRightArrow />} />}
            css={getActiveStylesIfActive('https://app.marbledao.finance/transfer')}
          >
            Transfer
          </Button>
        </Link>
        <Link href="https://app.marbledao.finance/pools" passHref>
          <Button
            className="top-menu"
            as="a"
            variant="ghost"
            iconCenter={<IconWrapper icon={<Open />} />}
            css={getActiveStylesIfActive('https://app.marbledao.finance/pools')}
          >
            Liquidity
          </Button>
        </Link>
        <Link href="/" passHref>
          <Button
            className="top-menu"
            as="a"
            variant="ghost"
            iconCenter={<IconWrapper icon={<Astronaut />} />}
            css={getActiveStylesIfActive('/')}
          >
            Explore NFTs
          </Button>
        </Link>
        { Boolean(key?.name) &&
        <Link href={{
            pathname: '/profile',
            query: { key: key, user: key.bech32Address },
          }} passHref>
          <Button
            className="top-menu"
            as="a"
            variant="ghost"
            iconCenter={<IconWrapper icon={<Astronaut />} />}
            css={getActiveStylesIfActive('/profile')}
          >
            Profile NFTs
          </Button>
        </Link>
        }
        <Link href="https://app.marbledao.finance/marblenauts-nft" passHref>
          <Button
            className="top-menu"
            as="a"
            variant="ghost"
            iconCenter={<IconWrapper icon={<Astronaut />} />}
            css={getActiveStylesIfActive('https://app.marbledao.finance/marblenauts-nft')}
          >
            The Marblenauts NFTs
          </Button>
        </Link>
        <Link href="https://app.marbledao.finance/airdrop" passHref>
          <Button
            className="top-menu"
            as="a"
            variant="ghost"
            iconCenter={<IconWrapper icon={<Airdrop />} />}
            css={getActiveStylesIfActive('https://app.marbledao.finance/airdrop')}
          >
            Marble GovDrop
          </Button>
        </Link>
        <Link href="https://app.marbledao.finance/block-airdrop" passHref>
          <Button
            className="top-menu"
            as="a"
            variant="ghost"
            iconCenter={<IconWrapper icon={<Airdrop />} />}
            css={getActiveStylesIfActive('https://app.marbledao.finance/block-airdrop')}
          >
            BLOCK Airdrop
          </Button>
        </Link>
        <Link
          href="https://daodao.zone/dao/juno1zz3gc2p9ntzgjt8dh4dfqnlptdynxlgd4j7u2lutwdg5xwlm4pcqyxnecp"
          passHref
        >
          <Button
            className="top-menu"
            as="a"
            target="__blank"
            variant="ghost"
            iconCenter={<IconWrapper icon={<Dao />} />}
            css={getActiveStylesIfActive('/dao')}
          >
            New DAO
          </Button>
        </Link>
        <Link
          href="https://daodao.zone/dao/juno1ay840g97ngja9k0f9lnywqxwk49245snw69kpwz0ry9qv99q367q3m4x8v"
          passHref
        >
          <Button
            className="top-menu"
            as="a"
            target="__blank"
            variant="ghost"
            iconCenter={<IconWrapper icon={<Dao />} />}
            css={getActiveStylesIfActive('/dao')}
          >
            Old DAO
          </Button>
        </Link>
        </StyledListForLinks>
      </MobileMenu> */}
      {isMobile() ? (
        <></>
      ) : (
        <StyledWrapper className={`wrap-header ${openNav ? "open" : ""}`}>
          <StyledMenuContainer className="wrap-menu container">
            <StyledListForLinks className="top-menu-links">
              <Link href="/" passHref>
                <StyledDivForLogo as="a">
                  <img className="logo-img" src="/images/logotext.svg" />
                </StyledDivForLogo>
              </Link>

              <VerticalDivider />

              <StyledLink>
                <Link href="https://app.marbledao.finance/dashboard" passHref>
                  <a className="dropdown-item">
                    <span>Feed</span>
                  </a>
                </Link>
              </StyledLink>

              <StyledLink>
                <Link href="/explore" passHref>
                  <a className="dropdown-item">
                    <span className={isActive("/explore")}>Browse</span>
                  </a>
                </Link>
              </StyledLink>

              <StyledLink>
                <a
                  className="dropdown-item"
                  href="https://near.marbledao.finance/"
                  target="__blank"
                >
                  <span className={isActive("/defi")}>DeFi</span>
                </a>
              </StyledLink>
            </StyledListForLinks>

            <ButtonField>
              {Boolean(key?.name) ? (
                <Menu>
                  <MenuButton
                    borderRadius="50%"
                    border="3px solid rgba(255, 255, 255, 0.2)"
                  >
                    <RoundedIcon size="36px" src={default_image} />
                  </MenuButton>
                  <StyledMenuList>
                    <Link href={`/profile/${key?.name}`}>
                      <ProfileMenuItem>
                        <Flex>
                          <RoundedIconComponent
                            size="58px"
                            address={key?.name}
                          />
                        </Flex>
                        <RoundedLeft />
                      </ProfileMenuItem>
                    </Link>
                    <StyledMenuItem>
                      <VFlex>
                        <p>Wallet Balance</p>
                        <h1>{99.99} BLOCK</h1>
                      </VFlex>
                      <AddressWrapper>
                        <p>{key?.name}</p>&nbsp;
                        <GreenRound />
                      </AddressWrapper>
                    </StyledMenuItem>
                    <StyledMenuItem>
                      <Flex>
                        {/* <Setting /> */}
                        &nbsp; Settings
                      </Flex>
                      <RoundedLeft />
                    </StyledMenuItem>
                    <StyledMenuItem>
                      <Flex>
                        {/* <Help /> */}
                        &nbsp; Help
                      </Flex>
                      <RoundedLeft />
                    </StyledMenuItem>
                    <StyledMenuItem onClick={resetWalletConnection}>
                      <Flex>
                        {/* <Disconnect /> */}
                        &nbsp; Disconnect
                      </Flex>
                      <RoundedLeft />
                    </StyledMenuItem>
                  </StyledMenuList>
                </Menu>
              ) : (
                <ConnectedWalletButton
                  connected={Boolean(key?.name)}
                  walletName={key?.name}
                  onConnect={() => connectWallet(null)}
                  onDisconnect={resetWalletConnection}
                />
              )}
              {key?.name && (
                <Link href="/create">
                  <CreateButton>Create</CreateButton>
                </Link>
              )}
            </ButtonField>
          </StyledMenuContainer>
        </StyledWrapper>
      )}
    </>
  );
}

// const StyledWrapper = styled('div', {
//   color: '$colors$white',
//   backgroundColor: '$black',
//   borderRight: '1px solid $borderColors$inactive',
// })

// const StyledMenuContainer = styled('div', {
//   display: 'flex',
//   flexDirection: 'column',
//   position: 'relative',
//   zIndex: '$1',
//   ' a':{
//     color: '$colors$white',
//     display: 'flex',
//     ' svg':{
//       color: '$colors$white',
//       stroke: '$colors$white',
//     },
//   }
// })

// const StyledListForLinks = styled('div', {
//   display: 'flex',
//   rowGap: '$space$2',
//   flexDirection: 'row',
//   ' .span-mark':{
//     border: '2px solid $white'
//   }
// })

// const StyledDivForLogo = styled('div', {
//   columnGap: '$space$4',
//   alignItems: 'center',
//   '& [data-logo]': {
//     marginBottom: '$2',
//   },
// })

// const MobileMenu = styled('div', {

// })

const GreenRound = styled("div", {
  width: "12px",
  height: "12px",
  background: "#24BE74",
  borderRadius: "50%",
});
const AddressWrapper = styled("div", {
  background:
    "linear-gradient(180deg, rgba(0, 0, 0, 0.06) 0%, rgba(0, 0, 0, 0.37) 100%)",
  boxShadow:
    "0px 7px 14px rgba(0, 0, 0, 0.1), inset 0px 14px 24px rgba(17, 20, 29, 0.4)",
  backdropFilter: "blur(30px)",
  borderRadius: "10px",
  display: "flex",
  " p": {
    fontSize: "14px",
  },
  padding: "10px",
  alignItems: "center",
});
const Flex = styled("div", {
  display: "flex",
  alignItems: "center",
  " p": {
    fontSize: "22px",
  },
});
const VFlex = styled("div", {
  " p": {
    fontSize: "14px",
    fontWeight: "400",
    fontFamily: "Mulish",
  },
  " h1": {
    fontSize: "20px",
    fontWeight: "700",
  },
});

const StyledMenuList = styled(MenuList, {
  boxShadow:
    "0px 7px 14px rgba(0, 0, 0, 0.1), inset 0px 14px 24px rgba(17, 20, 29, 0.4)",
  background:
    "linear-gradient(180deg, rgba(0, 0, 0, 0.06) 0%, #000000 100%) !important",
  borderRadius: "24px",
  border: "1px solid rgba(255,255,255,0.2)",
  padding: "20px",
  width: "400px",
  backdropFilter: "blur(30px)",
});
const StyledMenuItem = styled("div", {
  background: "rgba(05, 06, 22, 0.2)",
  boxShadow: "0px 4px 40px rgba(42, 47, 50, 0.09), inset 0px 7px 24px #6D6D78",
  backDropFilter: "blur(40px)",
  borderRadius: "20px",
  padding: "20px 25px",
  margin: "10px 0",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  cursor: "pointer",
  "&:hover": {
    opacity: "0.7 !important",
  },
});
const ProfileMenuItem = styled("div", {
  backDropFilter: "blur(40px)",
  margin: "5px 0",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  cursor: "pointer",
});

const StyledMenuContainer = styled("div", {
  display: "flex",
  flexDirection: "column",

  position: "relative",
  zIndex: "$2",
  padding: "0 0",
  width: "100%",
  " a": {
    color: "$colors$white",
    display: "flex",
    " svg": {
      color: "$colors$white",
      stroke: "$colors$white",
    },
  },
});

const ButtonField = styled("div", {
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
});

const VerticalDivider = styled("div", {
  width: "1px",
  height: "80%",
  border: "1px solid #363B4E",
  margin: "0 10px",
});
const HorizontalDivider = styled("div", {
  height: "1px",
  width: "100%",
  background: "#363B4E",
});
const MobileMenu = styled(`div`, {
  position: "fixed",
  background: "linear-gradient(180deg, rgba(0, 0, 0, 0.06) 0%, #000000 100%)",
  boxShadow:
    "0px 7px 14px rgba(0, 0, 0, 0.1), inset 0px 14px 24px rgba(17, 20, 29, 0.4)",
  backdropFilter: "blur(30px)",
  left: 0,
  top: 0,
  overflow: "auto",
  height: "100vh",
  width: "80vw",
});

const MobileMenuWrapper = styled("div", {
  padding: "30px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  rowGap: "36px",
});
const MobileWrapper = styled("div", {
  display: "flex",
  justifyContent: "space-between",
  padding: "20px",
  alignItems: "center",
  zIndex: "2",
  background: "rgba(8,12,28,0,6)",
});
const MobileProfileInfo = styled("div", {
  background: "rgba(5,6,21,0.2)",
  boxShadow: "0px 4px 40px rgba(42, 47, 50, 0.09), inset 0px 7px 24px #6D6D78",
  backdropFilter: "blur(40px)",
  borderRadius: "20px",
  display: "flex",
  justifyContent: "space-between",
  padding: "15px",
  width: "100%",
});
const MobileWalletInfo = styled("div", {
  "& p": {
    fontSize: "12px",
  },
  "& h2": {
    fontFamily: "Trajan",
    fontSize: "16px",
  },
});

const MobileLinkWrapper = styled("div", {
  width: "100%",
  textAlign: "left",
  display: "flex",
  flexDirection: "column",
  rowGap: "36px",
});
