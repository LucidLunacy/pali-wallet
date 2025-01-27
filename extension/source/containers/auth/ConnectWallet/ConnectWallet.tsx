import React, { useState } from 'react';
import { browser } from 'webextension-polyfill-ts';
import Header from 'containers/common/Header';
import Button from 'components/Button';
import checkGreen from 'assets/images/svg/check-green.svg';
import { ellipsis } from 'containers/auth/helpers';
import Spinner from '@material-ui/core/CircularProgress';
import clsx from 'clsx';
import { useSelector } from 'react-redux';
import { RootState } from 'state/store';
import IWalletState from 'state/wallet/types';
import { useHistory } from 'react-router';
import { getHost } from 'scripts/Background/helpers';

import styles from './ConnectWallet.scss';
import { useAlert } from 'react-alert';

const ConnectWallet = () => {
  const history = useHistory();
  const alert = useAlert()

  const { accounts, activeAccountId, tabs }: IWalletState =
    useSelector((state: RootState) => state.wallet);
  const [accountId, setAccountId] = useState<number>(-1);
  const { currentSenderURL } = tabs;
  const [continueConnection, setContinueConnection] = useState(false);
  const connectedAccount = accounts.find((account) => {
    return account.id === accountId;
  });

  const handleSelectAccount = (id: number) => {
    setAccountId(id);
  };

  const handleConfirmConnection = () => {
    try {
      browser.runtime.sendMessage({
        type: 'SELECT_ACCOUNT',
        target: 'background',
        id: accountId,
      });

      browser.runtime
        .sendMessage({
          type: 'CONFIRM_CONNECTION',
          target: 'background',
        })
        .then(() => {
          history.push('/home');

          browser.runtime.sendMessage({
            type: 'CLOSE_POPUP',
            target: 'background',
          });

          return true;
        });

      return true;
    } catch (error) {
      alert.removeAll();
      alert.error('Sorry, an internal error has occurred.');

      return false;
    }
  };

  const handleCancelConnection = () => {
    history.push('/home');

    if (accountId > -1) {
      browser.runtime
        .sendMessage({
          type: 'RESET_CONNECTION_INFO',
          target: 'background',
          id: accountId,
          url: currentSenderURL,
        })
        .then(() => {
          browser.runtime
            .sendMessage({
              type: 'CLOSE_POPUP',
              target: 'background',
            });
        });

      return;
    }

    browser.runtime.sendMessage({
      type: 'CLOSE_POPUP',
      target: 'background',
    });
  };

  return (
    <div>
      {continueConnection ? (
        <div className={styles.wrapper}>
          <Header showLogo />

          <h1>
            Connect with <b>Pali Wallet</b>
          </h1>

          <p>2/2</p>

          <div className={styles.list}>
            <p>Site: {currentSenderURL}</p>
            {connectedAccount && (
              <div>
                <p>Connect to account {connectedAccount?.label}</p>
                <p>{ellipsis(connectedAccount?.address.main)}</p>
              </div>
            )}
          </div>

          <small>
            Only connect with sites you trust. <a href="#">Learn more.</a>
          </small>

          <div className={styles.actions}>
            <Button
              type="button"
              theme="btn-outline-secondary"
              variant={clsx(styles.button, styles.cancel)}
              onClick={handleCancelConnection}
              linkTo="/home"
            >
              Cancel
            </Button>

            <Button
              type="button"
              theme="btn-outline-primary"
              variant={styles.button}
              linkTo="/home"
              onClick={handleConfirmConnection}
            >
              Confirm
            </Button>
          </div>
        </div>
      ) : (
        <div className={styles.wrapper}>
          <Header showLogo />

          <h1>
            Connect with <b>Pali Wallet</b>
          </h1>

          <p>1/2</p>
          <p>{getHost(`${currentSenderURL}`)}</p>
          <p>Choose account</p>

          {accounts.length > 0 ? (
            <ul className={styles.listAccounts}>
              {accounts.map((acc: any) => (
                <li
                  key={acc.id}
                  onClick={() => handleSelectAccount(acc.id)}
                  className={styles.account}
                >
                  <div className={styles.label}>
                    <p>
                      {acc.label}{' '}
                      {acc.id === activeAccountId && <small>(active)</small>}
                    </p>
                    <small>{ellipsis(acc.address.main)}</small>
                  </div>

                  {acc.id === accountId && <img src={checkGreen} alt="check" />}
                </li>
              ))}
            </ul>
          ) : (
            <div className={styles.loading}>
              <Spinner />
            </div>
          )}

          <small>
            Only connect with sites you trust. <a href="#">Learn more.</a>
          </small>

          <div className={styles.actions}>
            <Button
              type="button"
              theme="btn-outline-secondary"
              variant={clsx(styles.button, styles.cancel)}
              onClick={handleCancelConnection}
            // linkTo="/home"
            >
              Cancel
            </Button>

            <Button
              type="button"
              theme="btn-outline-primary"
              variant={styles.button}
              disabled={accountId === -1}
              onClick={() => setContinueConnection(true)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>

  );
};

export default ConnectWallet;
