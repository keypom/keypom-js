import React, { Fragment } from "react";
import type { Wallet } from "@near-wallet-selector/core";
import { ModalHeader } from "./ModalHeader";
import { translate } from "@near-wallet-selector/core";

interface WalletConnectingProps {
  wallet: Wallet | undefined;
  onBack: () => void;
  onCloseModal: () => void;
}

export const WalletConnecting: React.FC<WalletConnectingProps> = ({
  wallet,
  onCloseModal,
}) => {
  return (
    <Fragment>
      <ModalHeader title="" onCloseModal={onCloseModal} />
      <div className="connecting-wrapper">
        <div className="content">
          <div className="icon">
            <img src={wallet?.metadata.iconUrl} alt={wallet?.metadata.name} />
          </div>
          <h3 className="connecting-name">{wallet?.metadata.name}</h3>
          <div className="connecting-details">
            <span>
              {translate("modal.wallet.connectingTo")} {wallet?.metadata.name}
              ...
            </span>
          </div>
          <div className="connecting-message">
            <span>
              {translate(`modal.wallet.connectingMessage.${wallet?.type}`)}
            </span>
          </div>
        </div>
      </div>
    </Fragment>
  );
};
