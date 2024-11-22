import React from "react";
import { WalletSelector } from "@near-wallet-selector/core";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { CloseIcon } from "./icons/CloseIcon"; // You'll need to add this icon or replace it with your own

interface FastAuthModalProps {
    selector: WalletSelector;
    options: any;
    isVisible: boolean;
    onClose: () => void;
    walletSelectorModal: any; // Accept the walletSelectorModal prop
}

const FastAuthModal: React.FC<FastAuthModalProps> = ({
    selector,
    options,
    isVisible,
    onClose,
    walletSelectorModal,
}) => {
    if (!isVisible) return null;

    const handleGoogleSuccess = async (
        credentialResponse: CredentialResponse
    ) => {
        const idToken = credentialResponse.credential;

        try {
            const wallet = await selector.wallet("fastauth-wallet");
            await wallet.signIn({
                idToken,
                contractId: options.contractId,
                methodNames: options.methodNames,
            });
            onClose();
        } catch (error) {
            console.error("Error during FastAuth sign-in:", error);
        }
    };

    const handleGoogleError = () => {
        console.error("Google Sign-In failed");
    };

    const handleWalletSignIn = () => {
        if (walletSelectorModal) {
            onClose(); // Close the FastAuth modal before opening the wallet selector modal
            walletSelectorModal.show();
        }
    };

    return (
        <div
            className={`fastauth-modal-wrapper ${
                options.theme === "dark" ? "dark-theme" : ""
            }`}
        >
            <div className="fastauth-modal">
                <div className="fastauth-modal-header">
                    <h3>Sign in with Google</h3>
                    <button className="fastauth-close-button" onClick={onClose}>
                        <CloseIcon />
                    </button>
                </div>
                <div className="fastauth-modal-body">
                    <div className="fastauth-content">
                        <div className="google-login-button">
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={handleGoogleError}
                                theme="outline"
                                size="large"
                                text="signin_with"
                                shape="rectangular"
                                logo_alignment="left"
                                width="300"
                            />
                        </div>
                        <button
                            className="wallet-signin-button"
                            onClick={handleWalletSignIn}
                        >
                            Sign in with a Wallet
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FastAuthModal;
