import React from "react";
import { WalletSelector } from "@near-wallet-selector/core";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";

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
            walletSelectorModal.show();
        }
    };

    return (
        <div className="fastauth-modal-overlay">
            <div className="fastauth-modal-content">
                <button onClick={onClose}>Close</button>
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
                <button onClick={handleWalletSignIn}>
                    Sign in with a Wallet
                </button>
            </div>
        </div>
    );
};

export default FastAuthModal;
