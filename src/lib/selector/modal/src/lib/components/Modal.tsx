import React, { useCallback, useEffect, useState } from "react";
import type {
  EventEmitterService,
  ModuleState,
  WalletSelector,
} from "@near-wallet-selector/core";

import type {
  ModalEvents,
  ModalHideReason,
  ModalOptions,
  Theme,
} from "../modal.types";
import type { ModalRoute } from "./Modal.types";
import { WalletNetworkChanged } from "./WalletNetworkChanged";
import { WalletOptions } from "./WalletOptions";
import { AlertMessage } from "./AlertMessage";
import { DerivationPath } from "./DerivationPath";
import { WalletConnecting } from "./WalletConnecting";
import { WalletNotInstalled } from "./WalletNotInstalled";

import { WalletHome } from "./WalletHome";
import { WalletConnected } from "./WalletConnected";
import { translate } from "@near-wallet-selector/core";

interface ModalProps {
  options: ModalOptions;
  visible: boolean;
  hide: () => void;
  emitter: EventEmitterService<ModalEvents>;
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

export const Modal: React.FC<ModalProps> = ({
  options,
  visible,
  hide,
  emitter,
}) => {
  useEffect(() => {
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        hide();
      }
    };
    window.addEventListener("keydown", close);

    return () => window.removeEventListener("keydown", close);
  }, [emitter, hide]);

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
            <WalletHome
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
