import React from "react";
import { MODAL_DEFAULTS } from "../modal.types";
import { MainBody } from "./MainBody";

interface InsufficientBalanceProps {
    hide: () => void;
}

export const InsufficientBalance: React.FC<InsufficientBalanceProps> = ({
    hide
}) => {
    return (
        <div className="nws-modal" style={{ width: "70%", height: "27%" }}>
            <div className="modal-right" style={{ width: "100%" }}>
                <MainBody
                    title={MODAL_DEFAULTS.insufficientBalance.title}
                    body={MODAL_DEFAULTS.insufficientBalance.body}
                    headerOne={null}
                    headerTwo={null}
                    onCloseModal={() =>
                        hide()
                    }
                />
            </div>
        </div>
    );
};