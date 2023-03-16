import React, { useEffect } from "react";

import type {
  ModalOptions,
  Theme
} from "../modal.types";

import { TrialOverModal } from "./TrialOverModal";

interface ModalProps {
  options: ModalOptions;
  modalType: string;
  visible: boolean;
  hide: () => void;
}

const getThemeClass = (theme?: Theme) => {
  switch (theme) {
    case "dark":
      return "dark-theme";
    case "light":
      return "light-theme";
    default:
      return "";
  }
};

export const KeypomModal: React.FC<ModalProps> = ({
  options,
  modalType,
  visible,
  hide
}) => {
  useEffect(() => {
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        hide();
      }
    };
    window.addEventListener("keydown", close);

    return () => window.removeEventListener("keydown", close);
  }, [hide]);

  if (!visible) {
    return null;
  }

  return (
    <div
      className={`nws-modal-wrapper ${getThemeClass(options?.theme)} ${visible ? "open" : ""
        }`}
    >
      <div
        className="nws-modal-overlay"
        onClick={() => {
          hide();
        }}
      />
      <TrialOverModal
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
    </div>
  );
};
