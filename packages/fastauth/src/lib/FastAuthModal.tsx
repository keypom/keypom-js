import React, { useState } from "react";
import { WalletSelector } from "@near-wallet-selector/core";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { CloseIcon } from "./icons/CloseIcon"; // You'll need to add this icon or replace it with your own
import { ClipLoader } from "react-spinners";
import { MPC_CONTRACT_ID, FASTAUTH_CONTRACT_ID } from "./constants";

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
    const [loading, setLoading] = useState(false);

    if (!isVisible) return null;

    const handleGoogleSuccess = async (
        credentialResponse: CredentialResponse
    ) => {
        const idToken = credentialResponse.credential;

        try {
            setLoading(true);
            const wallet = await selector.wallet("fastauth-wallet");
            await wallet.signIn({
                idToken,
                mpcContractId: MPC_CONTRACT_ID,
                fastAuthContractId: FASTAUTH_CONTRACT_ID,
                contractId: options.contractId,
                methodNames: options.methodNames,
            });
            onClose();
        } catch (error) {
            console.error("Error during FastAuth sign-in:", error);
        } finally {
            setLoading(false);
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
                    {loading ? (
                        <div className="fastauth-loading-indicator">
                            <ClipLoader
                                color="#5f8afa"
                                loading={loading}
                                size={50}
                            />
                        </div>
                    ) : (
                        <div className="fastauth-content">
                            <div className="google-login-button">
                                <GoogleLogin
                                    onSuccess={handleGoogleSuccess}
                                    onError={handleGoogleError}
                                    useOneTap={false}
                                    auto_select={false}
                                    context="signin"
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
                    )}
                </div>
            </div>
        </div>
    );
};

export default FastAuthModal;
