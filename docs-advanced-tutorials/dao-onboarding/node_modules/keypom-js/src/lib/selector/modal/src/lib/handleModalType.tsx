import React from "react";
import { ClaimTrial } from "./components/ClaimTrial";
import { InvalidActions } from "./components/InvalidActions";
import { TrialOver } from "./components/TrialOver";
import { ModalOptions, ModalType, MODAL_TYPE_IDS } from "./modal.types";

export const renderModalType = (modalType: ModalType, options: ModalOptions, hide: () => void) => {
  switch (modalType.id) {
    case MODAL_TYPE_IDS.TRIAL_OVER:
      return (
        <TrialOver
          modulesTitle={options.modulesTitle}
          modules={options.modules}
          accountId={options.accountId}
          secretKey={options.secretKey}
          mainTitle={options.mainTitle}
          mainBody={options.mainBody}
          headerOne={options.headerOne}
          headerTwo={options.headerTwo}
          button={options.button}
          hide={hide}
        />
      )
    case MODAL_TYPE_IDS.ERROR:
      return <InvalidActions hide={hide} />
    case MODAL_TYPE_IDS.CLAIM_TRIAL:
      return <ClaimTrial hide={hide} secretKey={modalType.meta.secretKey} redirectUrlBase={modalType.meta.redirectUrlBase} delimiter={modalType.meta.delimiter}/>
    default: return null;
  }
}