import React, { useCallback, useEffect, useState } from "react";
import { MyForm } from "./Form";
import { ModalOptions, Theme } from "./modal";

interface ModalProps {
  options: ModalOptions;
  visible: boolean;
  hide: () => void;
  onSubmit: (e) => void;
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
  hide,
  onSubmit
}) => {
  const [userInputtedAccount, setUserInputtedAccount] = useState<string>();

  useEffect(() => {
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        hide();
      }
    };
    window.addEventListener("keydown", close);

    return () => window.removeEventListener("keydown", close);
  }, []);

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
            <h2>Left Title</h2>
          </div>
        </div>
        <div className="modal-right">
          <div className="nws-modal-body">
            <MyForm onSubmit={onSubmit} hide={hide}/>
          </div>
        </div>
      </div>
    </div>
  );
};
