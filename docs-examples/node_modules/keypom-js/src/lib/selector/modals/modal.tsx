import React from "react";
import { createRoot } from "react-dom/client";
import {KeypomModal} from "./KeypomModal";

const MODAL_ELEMENT_ID = "keypom-trial-modal";

export type Theme = "dark" | "light" | "auto";

export interface ModalOptions {
  theme?: Theme;
  title: string;
  description: string;
  onHide?: (hideReason: "user-triggered") => void;
}

export type ModalHideReason = "user-triggered" | "wallet-navigation";

export interface KeypomTrialModal {
    show(): void;
    hide(): void;
}

let modalInstance: KeypomTrialModal | null = null;

export const setupKeypomModal = (
  options: ModalOptions,
  onSubmit
): KeypomTrialModal => {
  const el = document.createElement("div");
  el.id = MODAL_ELEMENT_ID;
  if (!document.getElementById(MODAL_ELEMENT_ID)) {
    document.body.appendChild(el);
  }

  const container = document.getElementById(MODAL_ELEMENT_ID);
  const root = createRoot(container!);

  const render = (visible = false) => {
    root.render(
      <KeypomModal
        options={options}
        visible={visible}
        hide={() => render(false)}
        onSubmit={onSubmit}
      />
    );
  };

  if (!modalInstance) {
    modalInstance = {
      show: () => {
        render(true);
      },
      hide: () => {
        render(false);
      },
    };
  }

  return modalInstance;
};