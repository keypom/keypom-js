import React from "react";
import {
  InsufficientBalanceCustomizations,
  MODAL_DEFAULTS,
} from "../modal.types";
import { MainBody } from "./MainBody";

interface InsufficientBalanceProps {
  customizations?: InsufficientBalanceCustomizations;
  hide: () => void;
}

export const InsufficientBalance: React.FC<InsufficientBalanceProps> = ({
  customizations,
  hide,
}) => {
  return (
    <div className="nws-modal" style={{ width: "70%", height: "27%" }}>
      <div className="modal-right" style={{ width: "100%" }}>
        <MainBody
          title={
            customizations?.title || MODAL_DEFAULTS.insufficientBalance.title
          }
          body={customizations?.body || MODAL_DEFAULTS.insufficientBalance.body}
          imageOne={null}
          imageTwo={null}
          button={null}
          onCloseModal={() => hide()}
        />
      </div>
    </div>
  );
};
