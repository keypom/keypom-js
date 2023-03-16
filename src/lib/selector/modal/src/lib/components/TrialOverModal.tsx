import React from "react";
import { MainBodyButton, MainBodyHeaders, PostTrialModules } from "../modal.types";
import { MainBody } from "./MainBody";
import { WalletOptions } from "./WalletOptions";

interface TrialOverProps {
    modules: PostTrialModules[];
    accountId: string;
    secretKey: string;
    hide: () => void;
    modulesTitle?: string;
    mainTitle?: string;
    mainBody?: string;
    headerOne?: MainBodyHeaders;
    headerTwo?: MainBodyHeaders;
    button?: MainBodyButton;
}

export const TrialOverModal: React.FC<TrialOverProps> = ({ modulesTitle, modules, accountId, secretKey, mainTitle, mainBody, headerOne, headerTwo, button, hide }) => {
    return (
        <div className="nws-modal">
            <div className="modal-left">
                <div className="modal-left-title">
                    <h2>{modulesTitle}</h2>
                </div>
                <WalletOptions
                    modules={modules}
                    accountId={accountId}
                    secretKey={secretKey}
                />
            </div>
            <div className="modal-right">
                <div className="nws-modal-body">
                    <MainBody
                        title={mainTitle}
                        body={mainBody}
                        headerOne={headerOne}
                        headerTwo={headerTwo}
                        button={button}
                        onCloseModal={() =>
                            hide()
                        }
                    />
                </div>
            </div>
        </div>
    );
};