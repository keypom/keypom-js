"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importDefault(require("react"));
const google_1 = require("@react-oauth/google");
const FastAuthModal = ({ selector, options, isVisible, onClose, walletSelectorModal, }) => {
    if (!isVisible)
        return null;
    const handleGoogleSuccess = async (credentialResponse) => {
        const idToken = credentialResponse.credential;
        try {
            const wallet = await selector.wallet("fastauth-wallet");
            await wallet.signIn({
                idToken,
                contractId: options.contractId,
                methodNames: options.methodNames,
            });
            onClose();
        }
        catch (error) {
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
    return ((0, jsx_runtime_1.jsx)("div", { className: "fastauth-modal-overlay", children: (0, jsx_runtime_1.jsxs)("div", { className: "fastauth-modal-content", children: [(0, jsx_runtime_1.jsx)("button", { onClick: onClose, children: "Close" }), (0, jsx_runtime_1.jsx)(google_1.GoogleLogin, { onSuccess: handleGoogleSuccess, onError: handleGoogleError, theme: "outline", size: "large", text: "signin_with", shape: "rectangular", logo_alignment: "left", width: "300" }), (0, jsx_runtime_1.jsx)("button", { onClick: handleWalletSignIn, children: "Sign in with a Wallet" })] }) }));
};
exports.default = FastAuthModal;
