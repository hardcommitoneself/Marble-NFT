//import styled from 'styled-components'
import styled from "styled-components";
import { NavigationSidebar } from "./NavigationSidebar";
import { FooterBar } from "./FooterBar";
import { useEffect, useState } from "react";
import TagManager from "react-gtm-module";
import { APP_NAME } from "../../util/constants";
import { Text } from "../Text";
import { Button } from "../Button";

const tagManagerArgs = {
  gtmId: process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID,
};

//TagManager.initialize(tagManagerArgs)

export const AppLayout = ({
  footerBar = <FooterBar />,
  children,
  fullWidth,
  hasBanner = false,
}) => {
  const [openNav, setOpenNav] = useState(false);

  useEffect(() => {
    TagManager.initialize(tagManagerArgs);
  }, []);
  return (
    <>
      {/* <StyledWrapper>
        <NavigationSidebar openNav={openNav} setOpenNav={setOpenNav} />
        <StyledBackground className={`main-section ${fullWidth ? 'fullWidth' :''}`}>
          <StyledContainer className="container">
          <main>{children}</main>
          </StyledContainer>
        </StyledBackground>
  
        <StyledFooter className="footer">
          <StyledFooterWrapper className="container">
            <StyledContainer>
            {footerBar}
            </StyledContainer>
          </StyledFooterWrapper>
        </StyledFooter>
      </StyledWrapper> */}
      <StyledWrapper>
        <NavigationSidebar openNav={openNav} setOpenNav={setOpenNav} />

        <div
          className={`main-section ${fullWidth ? "fullWidth" : ""} ${
            hasBanner ? "hasBanner" : ""
          }`}
        >
          <StyledContainer hasBanner={hasBanner}>
            <main>{children}</main>
          </StyledContainer>
        </div>

        <StyledFooter className="footer">
          <StyledFooterWrapper className="container">
            <StyledContainer>{footerBar}</StyledContainer>
          </StyledFooterWrapper>
        </StyledFooter>
      </StyledWrapper>
    </>
  );
};

// const StyledWrapper = styled('div', {
//   display: 'block',
//   backgroundColor: '$white',
// })

// const StyledContainer = styled('div', {
//   position: 'relative',
//   zIndex: '1',
//   display: 'flex',
//   flexDirection: 'column',
//   justifyContent: 'space-between',
//   padding: '0 40px',
// })

// const StyledBackground = styled('div', {
// position: 'relative',
// zIndex: '1',
// display: 'flex',
// flexDirection: 'column',
// justifyContent: 'space-between',
// padding: '0 40px',
// })

// const StyledFooter = styled('div', {
// position: 'relative',
// zIndex: '1',
// display: 'flex',
// marginTop: '100px',
// flexDirection: 'column',
// justifyContent: 'space-between',
// padding: '40px 0 0 0',
// backgroundColor: '$backgroundColors$footer',
// })

// const StyledFooterWrapper = styled('div', {
//   position: 'relative',
//   zIndex: '1',
//   display: 'flex',
//   flexDirection: 'column',
//   justifyContent: 'space-between',
//   padding: '0 40px',
// })
// const StyledBottom = styled('div', {
// position: 'relative',
// zIndex: '1',
// display: 'flex',
// flexDirection: 'column',
// justifyContent: 'space-between',
// padding: '0 $space$20',
// marginTop: '24px',
// })
// const Container = styled('div', {
//   display: 'flex',
// })

// const StyledDivForGrid = styled('div', {
//   display: 'flex',
//   justifyContent: 'flex-end',
//   flexGrow: '1',
//   rowGap: '$space$12',
//   '& a': {
//     padding: '0px',
//     '&:hover': {
//       background: 'transparent',
//     }
//   }
// })

const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  background-image: url("/images/background.jpg");
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  position: relative;
  color: white;
`;

const StyledContainer = styled.div<{ hasBanner: boolean }>`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const StyledFooter = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  margin-top: 100px;
  flex-direction: column;
  justify-content: space-between;
  padding: 40px 0 0 0;
`;

const StyledFooterWrapper = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;
