import React from "react";
import { MainBodyButton, MainBodyHeaders, MODAL_DEFAULTS, PostTrialModules } from "../modal.types";
import { MainBody } from "./MainBody";
import { ModuleList } from "./ModuleList";

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

export const TrialOver: React.FC<TrialOverProps> = ({ 
    modulesTitle, 
    modules, 
    accountId, 
    secretKey, 
    mainTitle, 
    mainBody, 
    headerOne, 
    headerTwo, 
    button, 
    hide 
}) => {
    return (
        <div className="nws-modal">
            <div className="modal-left">
                <ModuleList
                    modulesTitle={modulesTitle}
                    modules={modules}
                    accountId={accountId}
                    secretKey={secretKey}
                />
            </div>
            <div className="modal-right">
                <div className="nws-modal-body">
                    <MainBody
                        title={mainTitle || MODAL_DEFAULTS.trialOver.mainBody.title}
                        body={mainBody || MODAL_DEFAULTS.trialOver.mainBody.body}
                        headerOne={headerOne || MODAL_DEFAULTS.trialOver.mainBody.headerOne}
                        headerTwo={headerTwo || MODAL_DEFAULTS.trialOver.mainBody.headerTwo}
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