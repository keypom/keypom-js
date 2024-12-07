"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
// src/FastAuthModal.tsx
const react_1 = __importStar(require("react"));
const CloseIcon_1 = require("./icons/CloseIcon");
const GoogleIcon_1 = __importDefault(require("./icons/GoogleIcon"));
const DiscordIcon_1 = __importDefault(require("./icons/DiscordIcon"));
const AppleIcon_1 = __importDefault(require("./icons/AppleIcon"));
const WalletIcon_1 = __importDefault(require("./icons/WalletIcon"));
const near_api_js_1 = require("near-api-js");
const js_sha256_1 = require("js-sha256");
const constants_1 = require("./constants");
const FastAuthModal = ({ selector, options, isVisible, onClose, walletSelectorModal, }) => {
    const [sessionKeyPair, setSessionKeyPair] = (0, react_1.useState)(null);
    const [popup, setPopup] = (0, react_1.useState)(null);
    const { localTesting } = options;
    const networkId = selector.options.network.networkId;
    const envNetwork = localTesting ? "local" : networkId;
    const env = constants_1.ENV_VARIABLES[envNetwork];
    const { MPC_CONTRACT_ID, FASTAUTH_CONTRACT_ID, WORKER_BASE_URL } = env;
    const handleMessage = (0, react_1.useCallback)(async (event) => {
        console.log("Received message:", event); // Log the entire event
        if (event.origin !== WORKER_BASE_URL) {
            console.warn(`Ignored message from origin: ${event.origin}`);
            return;
        }
        const data = event.data;
        console.log("Message data:", data); // Log the data payload
        if (data.type === "auth-success") {
            const { userIdHash } = data; // Extract userIdHash
            console.log("Authentication successful for userIdHash:", userIdHash);
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
            }
            catch (error) {
                console.error("Error during FastAuth sign-in:", error);
                alert(`Sign-in failed: ${error.message || error}`);
            }
        }
        else if (data.type === "auth-error") {
            console.error("Authentication failed:", data.error);
            alert(`Authentication failed: ${data.error}`);
        }
        if (popup && !popup.closed) {
            popup.close();
        }
        setPopup(null);
    }, [
        selector,
        options,
        onClose,
        sessionKeyPair,
        MPC_CONTRACT_ID,
        FASTAUTH_CONTRACT_ID,
        popup,
    ]);
    (0, react_1.useEffect)(() => {
        window.addEventListener("message", handleMessage);
        return () => {
            window.removeEventListener("message", handleMessage);
        };
    }, [handleMessage]);
    // Update the type to include "apple"
    const handleSignInClick = (provider) => {
        // Generate session keypair
        const keyPair = near_api_js_1.KeyPair.fromRandom("ed25519");
        const publicKeyStr = keyPair.getPublicKey().toString();
        const originHash = (0, js_sha256_1.sha256)(window.location.origin);
        // Set the state
        setSessionKeyPair(keyPair);
        // Open the popup with the computed publicKey and appId
        openAuthPopup(provider, publicKeyStr, originHash);
    };
    const openAuthPopup = (provider, publicKey, appId) => {
        // Encode the parentOrigin
        const parentOrigin = window.location.origin;
        // Construct the OAuth initiation URL
        const oauthInitiationUrl = `${WORKER_BASE_URL}/oauth/${provider}?parentOrigin=${encodeURIComponent(parentOrigin)}&publicKey=${encodeURIComponent(publicKey)}&appId=${encodeURIComponent(appId)}`;
        // Open the popup
        const popupWindow = window.open(oauthInitiationUrl, `${provider}Auth`, "width=600,height=700");
        if (popupWindow) {
            setPopup(popupWindow);
            // Optional: Focus the popup
            popupWindow.focus();
        }
        else {
            alert("Failed to open authentication popup. Please allow popups for this site.");
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
    if (!isVisible)
        return null;
    return ((0, jsx_runtime_1.jsx)("div", { className: `fastauth-modal-wrapper ${options.theme === "dark" ? "dark-theme" : ""}`, style: modalWrapperStyles, children: (0, jsx_runtime_1.jsxs)("div", { className: "fastauth-modal", style: modalStyles, children: [(0, jsx_runtime_1.jsxs)("div", { className: "fastauth-modal-header", style: modalHeaderStyles, children: [(0, jsx_runtime_1.jsx)("h3", { children: "Login or Sign Up" }), (0, jsx_runtime_1.jsx)("button", { className: "fastauth-close-button", onClick: handleClose, style: closeButtonStyles, "aria-label": "Close", children: (0, jsx_runtime_1.jsx)(CloseIcon_1.CloseIcon, {}) })] }), (0, jsx_runtime_1.jsx)("div", { className: "fastauth-modal-body", style: modalBodyStyles, children: (0, jsx_runtime_1.jsxs)("div", { className: "fastauth-content", style: contentStyles, children: [(0, jsx_runtime_1.jsxs)("button", { className: "social-login-button", onClick: () => handleSignInClick("google"), style: socialButtonStyles, children: [(0, jsx_runtime_1.jsx)(GoogleIcon_1.default, { className: "social-login-icon" }), (0, jsx_runtime_1.jsx)("span", { children: "Continue with Google" })] }), (0, jsx_runtime_1.jsxs)("button", { className: "social-login-button", onClick: () => handleSignInClick("discord"), style: socialButtonStyles, children: [(0, jsx_runtime_1.jsx)(DiscordIcon_1.default, { className: "social-login-icon" }), (0, jsx_runtime_1.jsx)("span", { children: "Continue with Discord" })] }), (0, jsx_runtime_1.jsxs)("button", { className: "social-login-button", onClick: () => handleSignInClick("apple"), style: socialButtonStyles, children: [(0, jsx_runtime_1.jsx)(AppleIcon_1.default, { className: "social-login-icon" }), (0, jsx_runtime_1.jsx)("span", { children: "Continue with Apple" })] }), (0, jsx_runtime_1.jsxs)("button", { className: "wallet-signin-button", onClick: handleWalletSignIn, style: walletButtonStyles, children: [(0, jsx_runtime_1.jsx)(WalletIcon_1.default, { className: "wallet-icon" }), (0, jsx_runtime_1.jsx)("span", { children: "Sign in with Wallet" })] })] }) })] }) }));
};
// Inline styles for simplicity; consider using CSS modules or styled-components in production
const modalWrapperStyles = {
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
const modalStyles = {
    width: "400px",
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
    overflow: "hidden",
    position: "relative",
};
const modalHeaderStyles = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px",
    borderBottom: "1px solid #ddd",
};
const closeButtonStyles = {
    background: "none",
    border: "none",
    cursor: "pointer",
};
const modalBodyStyles = {
    padding: "16px",
};
const contentStyles = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
};
const socialButtonStyles = {
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
const walletButtonStyles = {
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
exports.default = FastAuthModal;
