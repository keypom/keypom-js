import React from "react";
import { createRoot } from "react-dom/client";

import { KeypomModal } from "./components/KeypomModal";
import type { KeypomTrialModal, ModalOptions } from "./modal.types";

const MODAL_ELEMENT_ID = "near-wallet-selector-modal";
export const MODAL_TYPE = {
  TRIAL_OVER: "trial-over",
  ERROR: {
    INVALID_CONTRACT: "invalid-contract",
    INVALID_METHOD: "invalid-method",
    INVALID_AMOUNT: "invalid-amount",
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
