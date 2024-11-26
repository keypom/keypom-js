import React, { useState, useEffect } from "react";
import { WalletSelector } from "@near-wallet-selector/core";
import { CloseIcon } from "./icons/CloseIcon";
import { ClipLoader } from "react-spinners";
import { KeyPair } from "near-api-js";
import {
    AUTH_ORIGIN,
    FASTAUTH_CONTRACT_ID,
    MPC_CONTRACT_ID,
} from "./constants";
import GoogleButton from "react-google-button";
import { sha256 } from "js-sha256";

interface FastAuthModalProps {
    selector: WalletSelector;
    options: any;
    isVisible: boolean;
    onClose: () => void;
    walletSelectorModal: any;
}

const FastAuthModal: React.FC<FastAuthModalProps> = ({
    selector,
    options,
    isVisible,
    onClose,
    walletSelectorModal,
}) => {
    const [loading, setLoading] = useState(false);
    const [iframeVisible, setIframeVisible] = useState(false);
    const [sessionKeyPair, setSessionKeyPair] = useState<KeyPair | null>(null);
    const [publicKeyString, setPublicKeyString] = useState<string | null>(null);
    const [appId, setAppId] = useState<string | null>(null);

    useEffect(() => {
        const handleMessage = async (event: MessageEvent) => {
            if (event.origin !== AUTH_ORIGIN) return;
            const data = event.data;
            if (data.type === "auth-success") {
                const { userIdHash } = data; // Extract googleId
                try {
                    setLoading(true);
                    const wallet = await selector.wallet("fastauth-wallet");
                    await wallet.signIn({
                        userIdHash,
                        sessionKeyPair,
                        contractId: options.contractId,
                        methodNames: options.methodNames,
                        mpcContractId: MPC_CONTRACT_ID,
                        fastAuthContractId: FASTAUTH_CONTRACT_ID,
                    });
                    onClose();
                } catch (error) {
                    console.error("Error during FastAuth sign-in:", error);
                } finally {
                    setLoading(false);
                }
            } else if (data.type === "auth-error") {
                console.error("Authentication failed:", data.error);
            }
            setIframeVisible(false);
        };

        window.addEventListener("message", handleMessage);
        return () => {
            window.removeEventListener("message", handleMessage);
        };
    }, [selector, options, onClose, sessionKeyPair]);

    useEffect(() => {
        if (!iframeVisible) {
            setSessionKeyPair(null);
            setPublicKeyString(null);
        }
    }, [iframeVisible]);

    const handleSignInClick = () => {
        // Generate session keypair
        const keyPair = KeyPair.fromRandom("ed25519");
        setSessionKeyPair(keyPair);

        const publicKeyString = keyPair.getPublicKey().toString();
        setPublicKeyString(publicKeyString);

        // Compute the appId from the window.origin hash
        const originHash = sha256(window.location.origin).toString();
        setAppId(originHash);

        // Open the iframe with the session public key and appId as URL parameters
        setIframeVisible(true);
    };

    const handleWalletSignIn = () => {
        if (walletSelectorModal) {
            onClose();
            walletSelectorModal.show();
        }
    };

    // Prevent rendering modal if not visible
    if (!isVisible) return null;

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
                            {iframeVisible && publicKeyString ? (
                                <iframe
                                    src={`${AUTH_ORIGIN}/index.html?publicKey=${encodeURIComponent(
                                        publicKeyString
                                    )}&appId=${encodeURIComponent(appId)}`}
                                    title="Authentication"
                                    className="fastauth-auth-iframe"
                                    sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
                                ></iframe>
                            ) : (
                                <>
                                    <GoogleButton onClick={handleSignInClick} />
                                    <button
                                        className="wallet-signin-button"
                                        onClick={handleWalletSignIn}
                                    >
                                        Sign in with a Wallet
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FastAuthModal;
