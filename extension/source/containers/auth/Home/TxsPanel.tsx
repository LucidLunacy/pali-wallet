/* eslint-disable no-nested-ternary */
import * as React from 'react';
import { FC, Fragment, useCallback, useState } from 'react';
import clsx from 'clsx';
import { v4 as uuid } from 'uuid';
import UpArrowIcon from '@material-ui/icons/ArrowUpward';
import GoTopIcon from '@material-ui/icons/VerticalAlignTop';
import IconButton from '@material-ui/core/IconButton';
import Spinner from '@material-ui/core/CircularProgress';
import Button from 'components/Button';
import { useController } from 'hooks/index';
import SyscoinIcon from 'assets/images/logosys.svg';
import { RootState } from 'state/store';
import IWalletState from 'state/wallet/types';
import { useSelector } from 'react-redux';

import { Transaction, Assets } from '../../../scripts/types';
import { formatDistanceDate, formatCurrency } from '../helpers';

import styles from './Home.scss';

interface ITxsPanel {
  address: string;
  assets: Assets[];
  getTransactionAssetData: any;
  getTransactionData: any;
  openAssetBlockExplorer: any;
  openBlockExplorer: any;
  setAssetSelected: any;
  setAssetTx: any;
  setAssetType: any;
  setOpenAssetBlockExplorer: any;
  setOpenBlockExplorer: any;
  setTx: any;
  setTxType: any;
  setTxidSelected: any;
  transactions: Transaction[];
  txidSelected: any;
}

const TxsPanel: FC<ITxsPanel> = ({ transactions, assets, setOpenBlockExplorer, setTxidSelected, setAssetSelected, setOpenAssetBlockExplorer, setTxType, setAssetType, getTransactionData, setTx, setAssetTx, getTransactionAssetData }) => {
  const controller = useController();
  const [isShowed, setShowed] = useState<boolean>(false);
  const [isActivity, setActivity] = useState<boolean>(true);
  const [scrollArea, setScrollArea] = useState<HTMLElement>();

  const { changingNetwork }: IWalletState = useSelector(
    (state: RootState) => state.wallet
  );

  const isShowedGroupBar = useCallback(
    (tx: Transaction, idx: number) => {
      return (
        idx === 0 ||
        new Date(tx.blockTime * 1e3).toDateString() !==
        new Date(transactions[idx - 1].blockTime * 1e3).toDateString()
      );
    },
    [transactions]
  );

  const handleFetchMoreTxs = () => {
    if (transactions.length) {
      controller.wallet.account.updateTxs();
    }
  };

  const handleScroll = useCallback((event) => {
    event.persist();

    if (event.target.scrollTop) setShowed(true);

    setScrollArea(event.target);
    const scrollOffset = event.target.scrollHeight - event.target.scrollTop;
    
    if (scrollOffset === event.target.clientHeight) {
      if (!changingNetwork) {
        handleFetchMoreTxs();
      }
    }
  }, []);

  const handleGoTop = () => {
    scrollArea!.scrollTo({ top: 0, behavior: 'smooth' });
    setShowed(false);
  };

  const getTxType = (tx: Transaction) => {
    if (tx.tokenType === "SPTAssetActivate") {
      return 'SPT creation';
    }

    if (tx.tokenType === "SPTAssetSend") {
      return 'SPT mint';
    }

    if (tx.tokenType === "SPTAssetUpdate") {
      return 'SPT update';
    }

    return 'Transaction';
  }

  return (
    <section
      className={clsx(styles.activity, { [styles.expanded]: isShowed })}
      onScroll={handleScroll}
    >
      {!isShowed ?
        <div className={styles.wrapper}>
          <div className={styles.center}>
            <Button
              type="button"
              theme={isActivity ? "btn-rectangle-primary" : "btn-rectangle-selected"}
              variant={styles.buttonActivity}
              onClick={() => { setActivity(false) }}
            >
              Assets
            </Button>

            <Button
              type="button"
              theme={isActivity ? "btn-rectangle-selected" : "btn-rectangle-primary"}
              variant={styles.buttonActivity}
              onClick={() => { setActivity(true) }}
            >
              Activity
            </Button>
          </div>
        </div>
        :
        <div className={styles.heading}>
          {isActivity ? "Activity" : "Assets"}
          <IconButton className={styles.goTop} onClick={handleGoTop}>
            <GoTopIcon />
          </IconButton>
        </div>
      }

      {changingNetwork && (
        <>
          <span className={styles.noTxComment}>
            <Spinner size={25} className={styles.spinner} />
          </span>
          <img
            src={SyscoinIcon}
            className={styles.syscoin}
            alt="syscoin"
            height="167"
            width="auto"
          />
        </>
      )}

      {isActivity ?
        transactions.length && !changingNetwork ? (
          <>
            <ul>
              {transactions.map((tx: Transaction, idx: number) => {
                const isConfirmed = tx.confirmations > 0;

                return (
                  <Fragment key={uuid()}>
                    {isShowedGroupBar(tx, idx) && (
                      <li className={styles.groupbar}>
                        {formatDistanceDate(new Date(tx.blockTime * 1000).toDateString())}
                      </li>
                    )}
                    <li
                      className={styles.transactionItem}
                      onClick={() => {
                        setOpenBlockExplorer(true);
                        setTxidSelected(tx.txid);
                        setTxType(tx.tokenType);
                        getTransactionData(tx.txid).then((response: any) => {
                          setTx(response);
                        })
                      }}>
                      <div>
                        {isConfirmed ? null : <Spinner size={25} className={styles.spinner} />}
                      </div>
                      <div>
                        <span title="Click here to go to view transaction in sys block explorer">
                          <span>
                            {new Date(tx.blockTime * 1000).toLocaleTimeString(navigator.language, {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          <small>{tx.txid}</small>
                          <small>{isConfirmed ? "Confirmed" : "Unconfirmed"}</small>
                          <small>{getTxType(tx)}</small>
                        </span>
                        <div className={styles.linkIcon}>
                          <UpArrowIcon />
                        </div>
                      </div>
                    </li>
                  </Fragment>
                );
              })}
            </ul>
          </>
        ) : (
          <>
            <span className={styles.noTxComment}>
              You have no transaction history.
            </span>

            {!changingNetwork && (
              <img
                src={SyscoinIcon}
                className={styles.syscoin}
                alt="syscoin"
                height="167"
                width="auto"
              />
            )}
          </>
        ) : assets.length && !changingNetwork ?
          <>
            <ul>
              {assets.map((asset: Assets) => {
                if (asset.assetGuid !== undefined) {
                  return (
                    <Fragment key={uuid()}>
                      <div
                        className={styles.assetItem}
                        onClick={() => {
                          setOpenAssetBlockExplorer(true);
                          setAssetSelected(asset.assetGuid);
                          setAssetType(asset.type)
                          getTransactionAssetData(asset.assetGuid).then((response: any) => {
                            setAssetTx(response);
                          })
                        }}
                      >
                        <div>
                          <span title="Click here to go to view transaction in sys block explorer">
                            <span>
                              {formatCurrency(String(asset.balance / 10 ** asset.decimals), asset.decimals)} {asset.symbol}
                            </span>
                          </span>
                          <div className={styles.linkIcon}>
                            <UpArrowIcon />
                          </div>
                        </div>
                      </div>
                    </Fragment>
                  );
                }
              })}
            </ul>
          </> : <>
            <span className={styles.noTxComment}>
              You have no tokens or NFTs.
            </span>

            {!changingNetwork && (
              <img
                src={SyscoinIcon}
                className={styles.syscoin}
                alt="syscoin"
                height="167"
                width="auto"
              />
            )}
          </>
      }
    </section>
  );
};

export default TxsPanel;
