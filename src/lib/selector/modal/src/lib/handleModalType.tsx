import React from "react";
import { ClaimTrial } from "./components/ClaimTrial";
import { InvalidActions } from "./components/InvalidActions";
import { TrialOver } from "./components/TrialOver";
import { ModalOptions, MODAL_TYPE } from "./modal.types";

export const renderModalType = (modalType: string, options: ModalOptions, hide: () => void) => {
  switch (modalType) {
    case MODAL_TYPE.TRIAL_OVER:
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
    case MODAL_TYPE.ERROR:
      return <InvalidActions hide={hide} />
    case MODAL_TYPE.CLAIM_TRIAL:
      return <ClaimTrial hide={hide} />
    default: return null;
  }
}