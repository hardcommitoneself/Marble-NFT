import { styled } from "components/theme";
import { Wallet } from "../icons/Wallet";
import { Text } from "./Text";
import { IconWrapper } from "./IconWrapper";
import { Button } from "./Button";
import { useBaseTokenInfo } from "../hooks/useTokenInfo";
import { useTokenBalance } from "../hooks/useTokenBalance";
import { formatTokenBalance } from "../util/conversion";
import { Logout } from "../icons/Logout";
import { Copy } from "../icons/Copy";
import { CSS } from "@stitches/react";
import { useRecoilValue } from "recoil";
import { walletState } from "../state/atoms/walletAtoms";
import { useState } from "react";
import styledComponent from "styled-components";

type ConnectedWalletButtonProps = { css?: CSS } & {
  walletName?: string;
  onConnect: () => void;
  onDisconnect: () => void;
  connected: boolean;
};

export const ConnectedWalletButton = ({
  onConnect,
  connected,
  onDisconnect,
  walletName,
  ...props
}: ConnectedWalletButtonProps) => {
  const baseToken = useBaseTokenInfo();
  const { balance } = useTokenBalance(baseToken?.symbol);
  const { address } = useRecoilValue(walletState);
  const [openWallet, setOpenWallet] = useState(false);

  if (!connected) {
    return (
      <ConnectWalletContainer onClick={onConnect}>
        Connect Wallet
      </ConnectWalletContainer>
    );
  }

  return (
    <StyledWalletContainer className="connect-wallet">
      <StyledWalletButton {...props} role="button">
        <IconWrapper
          className="mobile-icon"
          size="38px"
          icon={<Wallet />}
          onClick={() => {
            setOpenWallet(!openWallet);
          }}
        />
        <IconWrapper className="desktop-icon" size="16px" icon={<Wallet />} />
        <div data-content="" className="wallet-status">
          <Text variant="link" color="white">
            {walletName}
          </Text>
          <Text
            variant="legend"
            css={{
              "-webkit-background-clip": "text",
              color: "$white",
            }}
          >
            {formatTokenBalance(balance, { includeCommaSeparation: true })}{" "}
            {baseToken?.symbol}
          </Text>
        </div>

        <StyledDivForActions
          className={`wallet-action ${openWallet ? "open" : "close"}`}
        >
          <StyledDivForInlineActions>
            {/*
            <Button
              variant="ghost"
              size="small"
              onClick={() => {
                navigator.clipboard.writeText(address)
              }}
              icon={<IconWrapper icon={<Copy />} />}

            />
            */}
            <Button
              variant="ghost"
              size="small"
              onClick={onDisconnect}
              icon={<IconWrapper icon={<Logout />} />}
            />
          </StyledDivForInlineActions>
        </StyledDivForActions>
      </StyledWalletButton>
    </StyledWalletContainer>
  );
};

const ConnectWalletContainer = styledComponent.div`
  background: #ffffff;
  box-shadow: 0px 4px 40px rgba(42, 47, 50, 0.09),
    inset 0px 7px 8px rgba(0, 0, 0, 0.2);
  border-radius: 16px;
  cursor: pointer;
  color: black;
  width: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  margin-left: 25px;
  font-weight: 700;
  font-size: 16px;
  height: 75%;
  @media (max-width: 1550px) {
    height: 75%;
    width: 150px;
    border-radius: 10px;
    font-size: 12px;
  }
  @media (max-width: 480px) {
    height: 48px;
    margin-left: 0;
  }
`;

const StyledDivForActions = styled("div", {
  position: "absolute",
  right: 0,
  top: 0,
  padding: "0",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  height: "100%",
  background:
    "linear-gradient(to right, $colors$white0 0%, $colors$white95 5%, $colors$white)",
  borderRadius: "$2",
  opacity: 1,
  transition: "opacity .1s ease-out",
});

const StyledDivForInlineActions = styled("div", {
  display: "flex",
  columnGap: "$space$2",
});

const StyledWalletContainer = styled("div", {
  alignItems: "center",
  justifyContent: "flex-end",
  display: "flex",
});

const StyledWalletButton = styledComponent.div`
  background: #ffffff;
  box-shadow: 0px 4px 40px rgba(42, 47, 50, 0.09),
    inset 0px 7px 8px rgba(0, 0, 0, 0.2);
  border-radius: 16px;
  cursor: pointer;
  color: black;
  width: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  margin-left: 25px;
  font-weight: 700;
  font-size: 16px;
  height: 75%;
  @media (max-width: 1550px) {
    height: 75%;
    width: 150px;
    border-radius: 10px;
    font-size: 12px;
  }
  @media (max-width: 480px) {
    height: 48px;
    margin-left: 0;
  }
`;
