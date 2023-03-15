import React, { useEffect } from "react";

import type {
  ModalOptions,
  Theme
} from "../modal.types";
import { WalletOptions } from "./WalletOptions";

import { MainBody } from "./MainBody";

interface ModalProps {
  options: ModalOptions;
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
      className={`nws-modal-wrapper ${getThemeClass(options?.theme)} ${
        visible ? "open" : ""
      }`}
    >
      <div
        className="nws-modal-overlay"
        onClick={() => {
          hide();
        }}
      />
      <div className="nws-modal">
        <div className="modal-left">
          <div className="modal-left-title">
            <h2>{options.modulesTitle}</h2>
          </div>
          <WalletOptions
            modules={options.modules}
            accountId={options.accountId}
            secretKey={options.secretKey}
          />
        </div>
        <div className="modal-right">
          <div className="nws-modal-body">
            <MainBody
              title={options.mainTitle}
              body={options.mainBody}
              headerOne={options.headerOne}
              headerTwo={options.headerTwo}
              button={options.button}
              onCloseModal={() =>
                hide()
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};
