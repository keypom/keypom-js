import React, { useEffect, useState } from "react";
import { renderModalType } from "../handleModalType";

import { ModalType, MODAL_TYPE_IDS, Theme, ModalCustomizations } from "../modal.types";

interface ModalProps {
  options: ModalCustomizations;
  modalType: ModalType;
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
  hide,
}) => {
  useEffect(() => {
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape" && modalType.id !== MODAL_TYPE_IDS.BEGIN_TRIAL) {
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
      className={`nws-modal-wrapper ${getThemeClass(options.theme)} ${
        visible ? "open" : ""
      }`}
    >
      <div
        className="nws-modal-overlay"
        onClick={() => {
          if (modalType.id !== MODAL_TYPE_IDS.BEGIN_TRIAL) {
            hide();
          }
        }}
      />
      {renderModalType(modalType, options, hide)}
    </div>
  );
};
