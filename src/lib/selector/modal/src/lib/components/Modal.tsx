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
  const [route, setRoute] = useState<ModalRoute>({
    name: "WalletHome",
  });
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [selectedWallet, setSelectedWallet] = useState<ModuleState>();
  const [bridgeWalletUri, setBridgeWalletUri] = useState<string>();

  useEffect(() => {
    setRoute({
      name: "WalletHome",
    });

    setBridgeWalletUri("");
    // eslint-disable-next-line
  }, [visible]);

  const handleDismissClick = useCallback(
    ({ hideReason }: { hideReason?: ModalHideReason }) => {
      setAlertMessage(null);
      setRoute({
        name: "WalletHome",
      });

      if (hideReason === "user-triggered") {
        emitter.emit("onHide", { hideReason });
      }

      if (hideReason === "wallet-navigation") {
        emitter.emit("onHide", { hideReason });
      }
      hide();
    },
    [hide, emitter]
  );

  useEffect(() => {
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleDismissClick({ hideReason: "user-triggered" });
      }
    };
    window.addEventListener("keydown", close);

    return () => window.removeEventListener("keydown", close);
  }, [handleDismissClick]);

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
          handleDismissClick({ hideReason: "user-triggered" });
        }}
      />
      <div className="nws-modal">
        <div className="modal-left">
          <div className="modal-left-title">
            <h2>{translate("modal.wallet.connectYourWallet")}</h2>
          </div>
          <WalletOptions
            handleWalletClick={(module) => {
              console.log(module);
            }}
          />
        </div>
        <div className="modal-right">
          <div className="nws-modal-body">
            {route.name === "WalletHome" && (
              <WalletHome
                onCloseModal={() =>
                  handleDismissClick({ hideReason: "user-triggered" })
                }
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
