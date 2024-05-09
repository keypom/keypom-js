import React from "react";
import { InvalidActionCustomizations, MODAL_DEFAULTS } from "../modal.types";
import { MainBody } from "./MainBody";

interface InvalidActionsProps {
    customizations?: InvalidActionCustomizations;
    hide: () => void;
}

export const InvalidActions: React.FC<InvalidActionsProps> = ({
    customizations,
    hide,
}) => {
    return (
        <div className="nws-modal" style={{ width: "70%", height: "27%" }}>
            <div className="modal-right" style={{ width: "100%" }}>
                <MainBody
                    title={
                        customizations?.title ||
                        MODAL_DEFAULTS.invalidAction.title
                    }
                    body={
                        customizations?.body ||
                        MODAL_DEFAULTS.invalidAction.body
                    }
                    imageOne={null}
                    imageTwo={null}
                    button={null}
                    onCloseModal={() => hide()}
                />
            </div>
        </div>
    );
};
