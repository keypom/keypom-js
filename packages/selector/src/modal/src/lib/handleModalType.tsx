import React from "react";
import { BeginTrial } from "./components/BeginTrial";
import { InsufficientBalance } from "./components/InsufficientBalance";
import { InvalidActions } from "./components/InvalidActions";
import { TrialOver } from "./components/TrialOver";
import { ModalCustomizations, ModalType, MODAL_TYPE_IDS } from "./modal.types";

export const renderModalType = (
  modalType: ModalType,
  options: ModalCustomizations,
  hide: () => void
) => {
  switch (modalType.id) {
    case MODAL_TYPE_IDS.TRIAL_OVER:
      return (
        <TrialOver
          accountId={modalType.meta.accountId}
          secretKey={modalType.meta.secretKey}
          wallets={options.wallets}
          customizations={options.trialOver}
          hide={hide}
        />
      );
    case MODAL_TYPE_IDS.ACTION_ERROR:
      return (
        <InvalidActions hide={hide} customizations={options.invalidAction} />
      );
    case MODAL_TYPE_IDS.INSUFFICIENT_BALANCE:
      return (
        <InsufficientBalance
          hide={hide}
          customizations={options.insufficientBalance}
        />
      );
    case MODAL_TYPE_IDS.BEGIN_TRIAL:
      console.log("modalType.meta", modalType.meta);
      return (
        <BeginTrial
          hide={hide}
          secretKey={modalType.meta.secretKey}
          redirectUrlBase={modalType.meta.redirectUrlBase}
          includedCid={modalType.meta.includedCid}
          delimiter={modalType.meta.delimiter}
          customizations={options.beginTrial}
        />
      );
    default:
      return null;
  }
};
