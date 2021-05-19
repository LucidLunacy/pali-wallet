import React, { useState } from 'react';
import clsx from 'clsx';
import { useSelector } from 'react-redux';

import Layout from 'containers/common/Layout';
import Button from 'components/Button';
import { useController } from 'hooks/index';
import CheckIcon from '@material-ui/icons/CheckCircle';

import TextInput from 'components/TextInput';
import { RootState } from 'state/store';
import { ellipsis } from '../helpers';
import IWalletState, { IAccountState } from 'state/wallet/types';
import { useAlert } from 'react-alert';

import styles from './IssueNFT.scss';
import { browser } from 'webextension-polyfill-ts';

const IssueNFT = () => {
  const controller = useController();
  const alert = useAlert();

  const { accounts, activeAccountId, currentSenderURL }: IWalletState = useSelector(
    (state: RootState) => state.wallet
  );

  const connectedAccount = accounts.find((account: IAccountState) => {
    return account.connectedTo.find((url: any) => {
      return url === currentSenderURL;
    });
  });

  const mintNFT = controller.wallet.account.getIssueNFT();
  const [confirmed, setConfirmed] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [fee, setFee] = useState(0.00001);
  const [recommend, setRecommend] = useState(0.00001);

  const handleGetFee = () => {
    controller.wallet.account.getRecommendFee().then(response => { setRecommend(response); setFee(response); })
  };

  const handleConfirm = () => {
    if (accounts[activeAccountId].balance > 0) {
      controller.wallet.account.confirmIssueNFT().then(result => {
        if (result) {
          console.log(result.message)
          alert.removeAll();
          alert.error(result.message);

          return;
        }

        setConfirmed(true);
        setLoading(false);
      });
    }
  }

  const handleClosePopup = () => {
    browser.runtime.sendMessage({
      type: "CLOSE_POPUP",
      target: "background"
    });
  }

  const handleCancelTransactionOnSite = () => {
    browser.runtime.sendMessage({
      type: "CANCEL_TRANSACTION",
      target: "background"
    });

    browser.runtime.sendMessage({
      type: "CLOSE_POPUP",
      target: "background"
    });
  }

  return confirmed ? (
    <Layout title="Your transaction is underway" showLogo>
      <CheckIcon className={styles.checked} />

      <div
        className="body-description"
      >
        Your Tokens is in minting process, you can check the transaction under your history.
      </div>

      <Button
        type="button"
        theme="btn-gradient-primary"
        variant={ styles.next }
        linkTo="/home"
        onClick={ handleClosePopup }
      >
        Ok
      </Button>
    </Layout>
  ) : (
    <Layout title="Mint NFT" showLogo>
      <div className={styles.wrapper}>
        <section className={styles.fee}>
          <TextInput
            type="number"
            placeholder="Enter fee"
            fullWidth
            name="fee"
            value={fee}
            onChange={(event) => setFee(Number(event.target.value))}
          />
          <Button
            type="button"
            variant={styles.textBtn}
            onClick={handleGetFee}
          >
            Recommend
          </Button>
        </section>

        <section className={styles.data}>
          <div className={styles.flex}>
            <p>{mintNFT?.rbf}</p>
            <p>on</p>
          </div>

          <div className={styles.flex}>
            <p>Receiver</p>
            <p>{mintNFT?.receiver}</p>
          </div>

          <div className={styles.flex}>
            <p>Fee</p>
            <p>{fee}</p>
          </div>

          <div className={styles.flex}>
            <p>Asset guid</p>
            <p>{mintNFT?.assetGuid}</p>
          </div>

          <div className={styles.flex}>
            <p>NFT Hash</p>
            <p>{mintNFT?.nfthash}</p>
          </div>

          <div className={styles.flex}>
            <p>Site</p>
            <p>{currentSenderURL}</p>
          </div>

          <div className={styles.flex}>
            <p>Max total</p>
            <p>{fee}</p>
          </div>
        </section>

        <section className={styles.confirm}>
          <div className={styles.actions}>
            <Button
              type="button"
              theme="btn-outline-secondary"
              variant={clsx(styles.button, styles.close)}
              onClick={handleCancelTransactionOnSite}
            >
              Reject
            </Button>

            <Button
              type="submit"
              theme="btn-outline-primary"
              variant={styles.button}
              onClick={handleConfirm}
              loading={loading}
              disabled={loading || !fee}
            >
              Confirm
            </Button>
          </div>
        </section>
      </div>
    </Layout>
  );
}

export default IssueNFT;