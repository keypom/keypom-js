import React from "react";
import { MODAL_DEFAULTS } from "../modal.types";
import { MainBody } from "./MainBody";

interface InvalidActionsProps {
    hide: () => void;
}

export const InvalidActions: React.FC<InvalidActionsProps> = ({
    hide
}) => {
    return (
        <div className="nws-modal" style={{ width: "70%", height: "27%" }}>
            <div className="modal-right" style={{ width: "100%" }}>
                <MainBody
                    title={MODAL_DEFAULTS.error.title}
                    body={MODAL_DEFAULTS.error.body}
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