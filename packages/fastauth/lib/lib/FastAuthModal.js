"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importDefault(require("react"));
const modal_ui_1 = require("@near-wallet-selector/modal-ui");
const google_1 = require("@react-oauth/google");
const FastAuthModal = ({ selector, options, isVisible, onClose, }) => {
    if (!isVisible)
        return null;
    const handleGoogleSuccess = async (credentialResponse) => {
        const idToken = credentialResponse.credential;
        await addSessionKey(idToken);
        onClose();
    };
    const handleGoogleError = () => {
        console.error("Google Sign-In failed");
    };
    const handleWalletSignIn = () => {
        onClose();
        const walletSelectorModal = (0, modal_ui_1.setupModal)(selector, options);
        walletSelectorModal.show();
    };
    const addSessionKey = async (idToken) => {
        try {
            const response = await fetch("https://fastauth-worker-dev.keypom.workers.dev/add-session-key", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ idToken }),
            });
            const result = await response.json();
            if (result.success) {
                const newAccount = {
                    accountId: result.accountId,
                    active: true,
                };
                selector.store.updateState((prevState) => ({
                    ...prevState,
                    accounts: [newAccount, ...prevState.accounts],
                    selectedWalletId: "google-wallet",
                }));
            }
            else {
                throw new Error(result.error);
            }
        }
        catch (error) {
            console.error("Error adding session key:", error);
        }
    };
    return ((0, jsx_runtime_1.jsx)(google_1.GoogleOAuthProvider, { clientId: options.clientId, children: (0, jsx_runtime_1.jsx)("div", { className: "fastauth-modal-overlay", children: (0, jsx_runtime_1.jsxs)("div", { className: "fastauth-modal-content", children: [(0, jsx_runtime_1.jsx)("button", { onClick: onClose, children: "Close" }), (0, jsx_runtime_1.jsx)(google_1.GoogleLogin, { onSuccess: handleGoogleSuccess, onError: handleGoogleError }), (0, jsx_runtime_1.jsx)("button", { onClick: handleWalletSignIn, children: "Sign in with a Wallet" })] }) }) }));
};
exports.default = FastAuthModal;
