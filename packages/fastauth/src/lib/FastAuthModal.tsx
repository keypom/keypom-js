import React from "react";
import { AccountState, WalletSelector } from "@near-wallet-selector/core";
import { setupModal as setupWalletSelectorModal } from "@near-wallet-selector/modal-ui";
import {
    GoogleOAuthProvider,
    GoogleLogin,
    CredentialResponse,
} from "@react-oauth/google";

interface FastAuthModalProps {
    selector: WalletSelector;
    options: any;
    isVisible: boolean;
    onClose: () => void;
}

const FastAuthModal: React.FC<FastAuthModalProps> = ({
    selector,
    options,
    isVisible,
    onClose,
}) => {
    if (!isVisible) return null;

    const handleGoogleSuccess = async (
        credentialResponse: CredentialResponse
    ) => {
        const idToken = credentialResponse.credential;
        await addSessionKey(idToken);
        onClose();
    };

    const handleGoogleError = () => {
        console.error("Google Sign-In failed");
    };

    const handleWalletSignIn = () => {
        onClose();
        const walletSelectorModal = setupWalletSelectorModal(selector, options);
        walletSelectorModal.show();
    };

    const addSessionKey = async (idToken: string) => {
        try {
            const response = await fetch(
                "https://fastauth-worker-dev.keypom.workers.dev/add-session-key",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ idToken }),
                }
            );
            const result = await response.json();
            if (result.success) {
                const newAccount: AccountState = {
                    accountId: result.accountId,
                    active: true,
                };

                selector.store.updateState((prevState) => ({
                    ...prevState,
                    accounts: [newAccount, ...prevState.accounts],
                    selectedWalletId: "google-wallet",
                }));
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error("Error adding session key:", error);
        }
    };

    return (
        <GoogleOAuthProvider clientId={options.clientId}>
            <div className="fastauth-modal-overlay">
                <div className="fastauth-modal-content">
                    <button onClick={onClose}>Close</button>
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                    />
                    <button onClick={handleWalletSignIn}>
                        Sign in with a Wallet
                    </button>
                </div>
            </div>
        </GoogleOAuthProvider>
    );
};

export default FastAuthModal;
