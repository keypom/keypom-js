import React from "react";
import {
    MODAL_DEFAULTS,
    OffboardingWallet,
    TrialOverCustomizations,
} from "../modal.types";
import { MainBody } from "./MainBody";
import { OffboardingWallets } from "./OffboardingWallets";

interface TrialOverProps {
    accountId: string;
    secretKey: string;
    wallets: OffboardingWallet[];
    hide: () => void;
    customizations?: TrialOverCustomizations;
}

export const TrialOver: React.FC<TrialOverProps> = ({
    wallets,
    accountId,
    secretKey,
    customizations,
    hide,
}) => {
    return (
        <div className="nws-modal">
            <div className="modal-left">
                <OffboardingWallets
                    customizations={customizations?.offboardingOptions}
                    wallets={wallets}
                    accountId={accountId}
                    secretKey={secretKey}
                />
            </div>
            <div className="modal-right">
                <div className="nws-modal-body">
                    <MainBody
                        title={
                            customizations?.mainBody?.title ||
                            MODAL_DEFAULTS.trialOver.mainBody.title
                        }
                        body={
                            customizations?.mainBody?.body ||
                            MODAL_DEFAULTS.trialOver.mainBody.body
                        }
                        imageOne={
                            customizations?.mainBody?.imageOne ||
                            MODAL_DEFAULTS.trialOver.mainBody.imageOne
                        }
                        imageTwo={
                            customizations?.mainBody?.imageTwo ||
                            MODAL_DEFAULTS.trialOver.mainBody.imageTwo
                        }
                        button={null}
                        onCloseModal={() => hide()}
                    />
                </div>
            </div>
        </div>
    );
};
