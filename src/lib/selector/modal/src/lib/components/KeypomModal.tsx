import React, { useEffect } from "react";
import { MODAL_DEFAULTS, MODAL_TYPE } from "../modal";

import type {
  ModalOptions,
  Theme
} from "../modal.types";
import { MainBody } from "./MainBody";

import { TrialOver } from "./TrialOver";

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

const renderModalType = (modalType: string, options: ModalOptions, hide: () => void) => {
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
      return (
        <div className="nws-modal" style={{width: "70%", height: "27%"}}>
          <div className="modal-right" style={{width: "100%"}}>
              <MainBody
                title={MODAL_DEFAULTS.error.title}
                body={MODAL_DEFAULTS.error.body}
                headerOne={null}
                headerTwo={null}
                button={options.button}
                onCloseModal={() =>
                  hide()
                }
              />
          </div>
        </div>
      )
    default: return null;
  }
}

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
      {renderModalType(modalType, options, hide)}
    </div>
  );
};
