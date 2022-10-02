import * as React from 'react'
import styled from 'styled-components'

const home = () => {
    return (
        <Container>
            
        </Container>
    )
}

const DestinationGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  column-gap: 60px;
  @media (max-width: 480px) {
    display: flex;
    flex-direction: column;
    row-gap: 15px;
  }
`
const PartnerGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  column-gap: 10px;
  overflow: auto;
  @media (max-width: 480px) {
    width: 100vw;
  }
`
const StyledButton = styled.button`
  width: 326px;
  height: 68px;
  background: white;
  border-radius: 16px;
  box-shadow: 0px 4px 40px rgba(42, 47, 50, 0.09),
    inset 0px 7px 8px rgba(0, 0, 0, 0.2);
  color: black;
  font-size: 18px;
  font-weight: bold;
  @media (max-width: 480px) {
    width: 100%;
    height: 56px;
    font-size: 16px;
  }
`
const MarbleCardGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  @media (max-width: 480px) {
    display: flex;
    flex-direction: column-reverse;
  }
`
const StyledImg = styled.img`
  margin: 0 auto;
`

const Container = styled.div`
  color: white;
`
const StyledP = styled.div`
  color: white;
  font-size: 20px;
  opacity: 0.5;
  font-family: Mulish;
  text-align: center;
  width: 700px;
  @media (max-width: 1450px) {
    font-size: 18px;
  }
  @media (max-width: 480px) {
    font-size: 16px;
    padding: 0 20px;
    width: 100%;
  }
`
const Collections = styled.div`
  padding: 50px 0;
`

const Paper = styled.div<{ width?: string }>`
  border-radius: 30px;
  background: rgba(255, 255, 255, 0.06);
  border: rgba(255, 255, 255, 0.2);
  box-shadow: 0px 7px 14px 0px #0000001a;
  backdrop-filter: blur(30px);
  padding: 40px 80px;
  width: ${({ width }) => width || '100%'};
  display: flex;
  align-items: center;
  @media (max-width: 1450px) {
    padding: 20px;
  }
`
const PartnerPaper = styled(Paper)`
  @media (max-width: 1450px) {
    width: 120px;
    height: 50px;
  }
`
const StyledPaper = styled.div`
  border-radius: 30px;
  background: rgba(255, 255, 255, 0.06);
  border: rgba(255, 255, 255, 0.2);
  box-shadow: 0px 7px 14px 0px #0000001a;
  backdrop-filter: blur(30px);
  justify-content: center;
  padding: 40px 80px;
  flex-direction: column;
  h1 {
    font-size: 36px;
    font-weight: 700;
    text-align: center;
  }
  @media (max-width: 1450px) {
    padding: 40px 40px;
  }
  @media (max-width: 480px) {
    display: flex;
    flex-direction: row;
    padding: 10px;
    align-items: center;
    column-gap: 10px;
    justify-content: start;
    h1 {
      font-size: 20px;
      font-weight: 700;
      text-align: left;
    }
    div {
      text-align: left;
    }
  }
`

const TextTitle = styled.div`
  font-size: 46px;
  font-weight: 700;
  text-align: center;
  @media (max-width: 1550px) {
    font-size: 40px;
  }
  @media (max-width: 480px) {
    font-size: 24px;
  }
`

const TextContent = styled.div<{ textAlign?: string }>`
  font-size: 26px;
  text-align: ${({ textAlign }) => (textAlign ? textAlign : 'center')};
  font-weight: 300;
  opacity: 0.5;
  font-family: Mulish;
  @media (max-width: 1440px) {
    font-size: 20px;
  }
  @media (max-width: 480px) {
    font-size: 16px;
  }
`

const Round = styled.div`
  width: 180px;
  height: 180px;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  border-radius: 50%;
  margin: 50px auto;
  @media (max-width: 480px) {
    width: 70px;
    height: 70px;
    margin: 0;
    img {
      width: 30px;
      height: 30px;
    }
  }
`
const Title = styled.div`
  font-size: 65px;
  font-weight: 700;
  @media (max-width: 1550px) {
    font-size: 40px;
  }
  @media (max-width: 480px) {
    font-size: 30px;
    text-align: center;
  }
`
export default home