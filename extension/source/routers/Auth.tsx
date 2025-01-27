import React, { useEffect } from 'react';
import { useAlert } from 'react-alert';
import { browser } from 'webextension-polyfill-ts';
import {
  Switch,
  Route,
  Redirect,
  useLocation,
  useHistory,
} from 'react-router-dom';
import { useTransition, animated } from 'react-spring';
import Start from 'containers/auth/Start';
import Home from 'containers/auth/Home';
import Send, { SendConfirm } from 'containers/auth/Send';
import UpdateAsset, { UpdateConfirm } from 'containers/auth/UpdateAsset';
import Create, { CreateTokenConfirm } from 'containers/auth/Create';
import IssueAsset, { IssueTokenConfirm } from 'containers/auth/IssueAsset';
import IssueNFT, { CreateAndIssueNFTConfirm } from 'containers/auth/IssueNFT';
import Receive from 'containers/auth/Receive';
import Import from 'containers/common/Import';
import ConnectWallet from 'containers/auth/ConnectWallet';
import ConnectedAccounts from 'containers/auth/ConnectWallet/ConnectedAccounts';
import { useController } from 'hooks/index';
import { useSelector } from 'react-redux';
import { RootState } from 'state/store';
import IWalletState from 'state/wallet/types';
import TransferOwnership, {
  TransferOwnershipConfirm,
} from 'containers/auth/TransferOwnership';

import { getHost } from '../scripts/Background/helpers';

import { SendMatchProps } from './types';
import SignPSBT from 'containers/auth/SignPSBT';
import MintNFT, { MintNFTConfirm } from 'containers/auth/MintNFT';
import SignAndSend from 'containers/auth/SignAndSend';

const Auth = () => {
  const location = useLocation();
  const alert = useAlert();
  const history = useHistory();
  const controller = useController();
  const isUnlocked = !controller.wallet.isLocked();

  const transitions = useTransition(location, (locat) => locat.pathname, {
    initial: { opacity: 1 },
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
    config: { duration: 200 },
  });

  const {
    accounts,
    tabs,
    confirmingTransaction,
    creatingAsset,
    issuingNFT,
    issuingAsset,
    updatingAsset,
    transferringOwnership,
    signingTransaction,
    signingPSBT,
    mintNFT,
  }: IWalletState = useSelector((state: RootState) => state.wallet);
  const { currentURL, canConnect } = tabs;

  const connectedAccounts = accounts.filter((account) => {
    return (
      account.connectedTo.findIndex((url: any) => {
        return url == getHost(currentURL);
      }) > -1
    );
  });

  useEffect(() => {
    if (
      isUnlocked
    ) {
      window.addEventListener('mousemove', () => {
        browser.runtime.sendMessage({
          type: 'SET_MOUSE_MOVE',
          target: 'background',
        });
      });
    }
  }, [
    isUnlocked,
  ]);

  useEffect(() => {
    const redirectRoute = controller.appRoute();

    if (
      redirectRoute == '/send/confirm' &&
      !controller.wallet.account.getTransactionItem().tempTx
    ) {
      history.push('/home');

      return;
    }

    if (
      redirectRoute == '/updateAsset/confirm' &&
      !controller.wallet.account.getTransactionItem().updateAssetItem
    ) {
      history.push('/home');

      return;
    }

    if (!isUnlocked && accounts.length > 0) {
      history.push('/app.html');

      return;
    }

    if (
      confirmingTransaction &&
      controller.wallet.account.getTransactionItem().tempTx &&
      isUnlocked
    ) {
      history.push('/send/confirm');

      return;
    }

    if (signingTransaction && isUnlocked) {
      history.push('/sign');

      return;
    }

    if (mintNFT && isUnlocked) {
      history.push('/mintNFT');

      return;
    }

    if (signingPSBT && isUnlocked) {
      history.push('/signPsbt');

      return;
    }

    if (creatingAsset && isUnlocked) {
      history.push('/create');

      return;
    }

    if (issuingAsset && isUnlocked) {
      history.push('/issueAsset');

      return;
    }

    if (issuingNFT && isUnlocked) {
      history.push('/issueNFT');

      return;
    }

    if (updatingAsset && isUnlocked) {
      history.push('/updateAsset');

      return;
    }

    if (transferringOwnership && isUnlocked) {
      history.push('/transferOwnership');

      return;
    }

    if (
      !confirmingTransaction &&
      controller.wallet.account.getTransactionItem().tempTx
    ) {
      history.push('/home');

      return;
    }

    if (canConnect && isUnlocked) {
      if (connectedAccounts.length <= 0) {
        history.push('/connect-wallet');

        return;
      }

      history.push('/connected-accounts');

      return;
    }

    if (!canConnect && isUnlocked) {
      if (connectedAccounts.length > 0) {
        history.push('/home');

        return;
      }

      history.push('/home');

      return;
    }

    if (confirmingTransaction && !canConnect && isUnlocked) {
      history.push('/send/confirm');

      return;
    }

    if (redirectRoute !== '/app.html') {
      history.push(redirectRoute);
    }
  }, [canConnect, isUnlocked, confirmingTransaction, updatingAsset]);

  useEffect(() => {
    alert.removeAll();
    controller.appRoute(location.pathname);
  }, [location]);

  return (
    <>
      {transitions.map(({ item, props, key }) => (
        <animated.div
          style={{
            ...props,
            position: 'absolute',
            height: '100%',
            width: '100%',
          }}
          key={key}
        >
          <Switch location={item}>
            <Route path="/app.html" component={Start} exact>
              {isUnlocked && <Redirect to="/home" />}
            </Route>
            {!isUnlocked && <Route path="/import" component={Import} exact />}
            {isUnlocked && <Route path="/home" component={Home} exact />}
            {isUnlocked && canConnect && (
              <Route path="/connect-wallet" component={ConnectWallet} exact />
            )}
            {isUnlocked && canConnect && connectedAccounts.length > 0 && (
              <Route
                path="/connected-accounts"
                component={ConnectedAccounts}
                exact
              />
            )}
            {isUnlocked && (
              <Route path="/send/confirm" component={SendConfirm} exact />
            )}
            {isUnlocked && (
              <Route path="/sign" component={SignAndSend} exact />
            )}
            {isUnlocked && (
              <Route path="/signPsbt" component={SignPSBT} exact />
            )}
            {isUnlocked && <Route path="/create" component={Create} exact />}
            {isUnlocked && (
              <Route
                path="/create/confirm"
                component={CreateTokenConfirm}
                exact
              />
            )}
            {isUnlocked && (
              <Route path="/issueAsset" component={IssueAsset} exact />
            )}
            {isUnlocked && (
              <Route
                path="/issueAsset/confirm"
                component={IssueTokenConfirm}
                exact
              />
            )}
            {isUnlocked && (
              <Route path="/mintNFT" component={MintNFT} exact />
            )}
            {isUnlocked && (
              <Route
                path="/mintNFT/confirm"
                component={MintNFTConfirm}
                exact
              />
            )}
            {isUnlocked && (
              <Route path="/issueNFT" component={IssueNFT} exact />
            )}
            {isUnlocked && (
              <Route
                path="/issueNFT/confirm"
                component={CreateAndIssueNFTConfirm}
                exact
              />
            )}
            {isUnlocked && (
              <Route path="/updateAsset" component={UpdateAsset} exact />
            )}
            {isUnlocked && (
              <Route
                path="/updateAsset/confirm"
                component={UpdateConfirm}
                exact
              />
            )}
            {isUnlocked && (
              <Route
                path="/transferOwnership"
                component={TransferOwnership}
                exact
              />
            )}
            {isUnlocked && (
              <Route
                path="/transferOwnership/confirm"
                component={TransferOwnershipConfirm}
                exact
              />
            )}
            {isUnlocked && <Route path="/send" component={Send} exact />}
            {isUnlocked && (
              <Route
                path="/send/:address"
                render={({ match }: SendMatchProps) => (
                  <Send initAddress={match.params.address} />
                )}
                exact
              />
            )}
            {isUnlocked && <Route path="/receive" component={Receive} exact />}
          </Switch>
        </animated.div>
      ))}
    </>
  );
};

export default Auth;
