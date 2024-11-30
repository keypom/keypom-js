// src/FastAuthModal.tsx

import React, { useState, useEffect, useCallback } from "react";
import { WalletSelector } from "@near-wallet-selector/core";
import { CloseIcon } from "./icons/CloseIcon";
import GoogleIcon from "./icons/GoogleIcon";
import DiscordIcon from "./icons/DiscordIcon";
import AppleIcon from "./icons/AppleIcon";
import WalletIcon from "./icons/WalletIcon";
import { KeyPair } from "near-api-js";
import { sha256 } from "js-sha256";
import { FastAuthModalOptions } from "./modal";
import { ENV_VARIABLES } from "./constants";

interface FastAuthModalProps {
    selector: WalletSelector;
    options: FastAuthModalOptions;
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
    const [sessionKeyPair, setSessionKeyPair] = useState<KeyPair | null>(null);
    const [popup, setPopup] = useState<Window | null>(null);

    const { localTesting } = options;
    const networkId = selector.options.network.networkId;
    const envNetwork = localTesting ? "local" : networkId;
    const env = ENV_VARIABLES[envNetwork];

    const { MPC_CONTRACT_ID, FASTAUTH_CONTRACT_ID, WORKER_BASE_URL } = env;

    const handleMessage = useCallback(
        async (event: MessageEvent) => {
            console.log("Received message:", event); // Log the entire event
            if (event.origin !== WORKER_BASE_URL) {
                console.warn(`Ignored message from origin: ${event.origin}`);
                return;
            }
            const data = event.data;
            console.log("Message data:", data); // Log the data payload
            if (data.type === "auth-success") {
                const { userIdHash } = data; // Extract userIdHash
                console.log(
                    "Authentication successful for userIdHash:",
                    userIdHash
                );
                try {
                    const wallet = await selector.wallet("fastauth-wallet");
                    console.log("Selected wallet:", wallet);
                    await wallet.signIn({
                        userIdHash,
                        sessionKeyPair,
                        contractId: options.contractId,
                        methodNames: options.methodNames,
                        mpcContractId: MPC_CONTRACT_ID,
                        fastAuthContractId: FASTAUTH_CONTRACT_ID,
                    });
                    console.log("Sign-in successful");
                    onClose();
                } catch (error) {
                    console.error("Error during FastAuth sign-in:", error);
                    alert(`Sign-in failed: ${error.message || error}`);
                }
            } else if (data.type === "auth-error") {
                console.error("Authentication failed:", data.error);
                alert(`Authentication failed: ${data.error}`);
            }
            if (popup && !popup.closed) {
                popup.close();
            }
            setPopup(null);
        },
        [
            selector,
            options,
            onClose,
            sessionKeyPair,
            MPC_CONTRACT_ID,
            FASTAUTH_CONTRACT_ID,
            popup,
        ]
    );

    useEffect(() => {
        window.addEventListener("message", handleMessage);
        return () => {
            window.removeEventListener("message", handleMessage);
        };
    }, [handleMessage]);

    // Update the type to include "apple"
    const handleSignInClick = (provider: "google" | "discord" | "apple") => {
        // Generate session keypair
        const keyPair = KeyPair.fromRandom("ed25519");
        const publicKeyStr = keyPair.getPublicKey().toString();
        const originHash = sha256(window.location.origin);

        // Set the state
        setSessionKeyPair(keyPair);

        // Open the popup with the computed publicKey and appId
        openAuthPopup(provider, publicKeyStr, originHash);
    };

    const openAuthPopup = (
        provider: "google" | "discord" | "apple",
        publicKey: string,
        appId: string
    ) => {
        // Encode the parentOrigin
        const parentOrigin = window.location.origin;

        // Construct the OAuth initiation URL
        const oauthInitiationUrl = `${WORKER_BASE_URL}/oauth/${provider}?parentOrigin=${encodeURIComponent(
            parentOrigin
        )}&publicKey=${encodeURIComponent(
            publicKey
        )}&appId=${encodeURIComponent(appId)}`;

        // Open the popup
        const popupWindow = window.open(
            oauthInitiationUrl,
            `${provider}Auth`,
            "width=600,height=700"
        );

        if (popupWindow) {
            setPopup(popupWindow);
            // Optional: Focus the popup
            popupWindow.focus();
        } else {
            alert(
                "Failed to open authentication popup. Please allow popups for this site."
            );
        }
    };

    const handleWalletSignIn = () => {
        if (walletSelectorModal) {
            onClose();
            walletSelectorModal.show();
        }
    };

    const handleClose = () => {
        console.log("Modal Closed!");
        if (popup && !popup.closed) {
            popup.close();
        }
        setSessionKeyPair(null);
        onClose();
    };

    // Prevent rendering modal if not visible
    if (!isVisible) return null;

    return (
        <div
            className={`fastauth-modal-wrapper ${
                options.theme === "dark" ? "dark-theme" : ""
            }`}
            style={modalWrapperStyles}
        >
            <div className="fastauth-modal" style={modalStyles}>
                <div
                    className="fastauth-modal-header"
                    style={modalHeaderStyles}
                >
                    <h3>Login or Sign Up</h3>
                    <button
                        className="fastauth-close-button"
                        onClick={handleClose}
                        style={closeButtonStyles}
                        aria-label="Close"
                    >
                        <CloseIcon />
                    </button>
                </div>
                <div className="fastauth-modal-body" style={modalBodyStyles}>
                    <div className="fastauth-content" style={contentStyles}>
                        {/* Social Login Buttons */}
                        <button
                            className="social-login-button"
                            onClick={() => handleSignInClick("google")}
                            style={socialButtonStyles}
                        >
                            <GoogleIcon className="social-login-icon" />
                            <span>Continue with Google</span>
                        </button>

                        <button
                            className="social-login-button"
                            onClick={() => handleSignInClick("discord")}
                            style={socialButtonStyles}
                        >
                            <DiscordIcon className="social-login-icon" />
                            <span>Continue with Discord</span>
                        </button>

                        <button
                            className="social-login-button"
                            onClick={() => handleSignInClick("apple")}
                            style={socialButtonStyles}
                        >
                            <AppleIcon className="social-login-icon" />
                            <span>Continue with Apple</span>
                        </button>

                        {/* Existing Wallet Button */}
                        <button
                            className="wallet-signin-button"
                            onClick={handleWalletSignIn}
                            style={walletButtonStyles}
                        >
                            <WalletIcon className="wallet-icon" />
                            <span>Sign in with Wallet</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Inline styles for simplicity; consider using CSS modules or styled-components in production
const modalWrapperStyles: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
};

const modalStyles: React.CSSProperties = {
    width: "400px",
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
    overflow: "hidden",
    position: "relative",
};

const modalHeaderStyles: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px",
    borderBottom: "1px solid #ddd",
};

const closeButtonStyles: React.CSSProperties = {
    background: "none",
    border: "none",
    cursor: "pointer",
};

const modalBodyStyles: React.CSSProperties = {
    padding: "16px",
};

const contentStyles: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
};

const socialButtonStyles: React.CSSProperties = {
    width: "100%",
    padding: "10px",
    margin: "8px 0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
    cursor: "pointer",
    border: "1px solid #ddd",
    borderRadius: "4px",
    backgroundColor: "#fff",
    transition: "background-color 0.3s, border-color 0.3s",
};

const walletButtonStyles: React.CSSProperties = {
    width: "100%",
    padding: "10px",
    margin: "16px 0 0 0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
    cursor: "pointer",
    border: "1px solid #ddd",
    borderRadius: "4px",
    backgroundColor: "#fff",
    transition: "background-color 0.3s, border-color 0.3s",
};

export default FastAuthModal;
