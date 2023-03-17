import React from "react";
import { createRoot } from "react-dom/client";

import { KeypomModal } from "./components/KeypomModal";
import type { KeypomTrialModal, ModalOptions } from "./modal.types";

const MODAL_ELEMENT_ID = "near-wallet-selector-modal";
export const MODAL_TYPE = {
  TRIAL_OVER: "trial-over",
  ERROR: "action-error"
}
export const MODAL_DEFAULTS = {
  trialOver: {
    mainBody: {
      title: "Your Trial Has Ended",
      body: "To continue using NEAR, secure your account with a wallet.",
      headerOne: {
        title: "Secure & Manage Your Digital Assets",
        description: "No need to create new accounts or credentials. Connect your wallet and you are good to go!"
      },
      headerTwo: {
        title: "Log In to Any NEAR App",
        description: "No need to create new accounts or credentials. Connect your wallet and you are good to go!"
      },
    },
    moduleList: {
      modulesTitle: "Choose a Wallet",
    }
  },
  error: {
    title: "Invalid Action",
    body: "Your trial does not allow you to perform this action. For more information, please contact the site administrator."
  }
}

let modalInstance: KeypomTrialModal | null = null;

export const setupModal = (
  options: ModalOptions
): KeypomTrialModal => {
  const el = document.createElement("div");
  el.id = MODAL_ELEMENT_ID;
  if (!document.getElementById(MODAL_ELEMENT_ID)) {
    document.body.appendChild(el);
  }

  const container = document.getElementById(MODAL_ELEMENT_ID);
  const root = createRoot(container!);

  const render = (visible = false, modalType = MODAL_TYPE.TRIAL_OVER) => {
    root.render(
      <KeypomModal
        options={options}
        modalType={modalType}
        visible={visible}
        hide={() => render(false)}
      />
    );
  };

  if (!modalInstance) {
    modalInstance = {
      show: (modalType) => {
        render(true, modalType);
      },
      hide: () => {
        render(false);
      }
    };
  }

  return modalInstance;
};
