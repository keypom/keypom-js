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
const react_1 = __importStar(require("react"));
const CloseIcon_1 = require("./icons/CloseIcon");
const react_spinners_1 = require("react-spinners");
const near_api_js_1 = require("near-api-js");
const constants_1 = require("./constants");
const react_google_button_1 = __importDefault(require("react-google-button"));
const js_sha256_1 = require("js-sha256");
const FastAuthModal = ({ selector, options, isVisible, onClose, walletSelectorModal, }) => {
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [iframeVisible, setIframeVisible] = (0, react_1.useState)(false);
    const [sessionKeyPair, setSessionKeyPair] = (0, react_1.useState)(null);
    const [publicKeyString, setPublicKeyString] = (0, react_1.useState)(null);
    const [appId, setAppId] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        const handleMessage = async (event) => {
            if (event.origin !== constants_1.AUTH_ORIGIN)
                return;
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
                        mpcContractId: constants_1.MPC_CONTRACT_ID,
                        fastAuthContractId: constants_1.FASTAUTH_CONTRACT_ID,
                    });
                    onClose();
                }
                catch (error) {
                    console.error("Error during FastAuth sign-in:", error);
                }
                finally {
                    setLoading(false);
                }
            }
            else if (data.type === "auth-error") {
                console.error("Authentication failed:", data.error);
            }
            setIframeVisible(false);
        };
        window.addEventListener("message", handleMessage);
        return () => {
            window.removeEventListener("message", handleMessage);
        };
    }, [selector, options, onClose, sessionKeyPair]);
    (0, react_1.useEffect)(() => {
        if (!iframeVisible) {
            setSessionKeyPair(null);
            setPublicKeyString(null);
        }
    }, [iframeVisible]);
    const handleSignInClick = () => {
        // Generate session keypair
        const keyPair = near_api_js_1.KeyPair.fromRandom("ed25519");
        setSessionKeyPair(keyPair);
        const publicKeyString = keyPair.getPublicKey().toString();
        setPublicKeyString(publicKeyString);
        // Compute the appId from the window.origin hash
        const originHash = (0, js_sha256_1.sha256)(window.location.origin).toString();
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
    if (!isVisible)
        return null;
    return ((0, jsx_runtime_1.jsx)("div", { className: `fastauth-modal-wrapper ${options.theme === "dark" ? "dark-theme" : ""}`, children: (0, jsx_runtime_1.jsxs)("div", { className: "fastauth-modal", children: [(0, jsx_runtime_1.jsxs)("div", { className: "fastauth-modal-header", children: [(0, jsx_runtime_1.jsx)("h3", { children: "Sign in with Google" }), (0, jsx_runtime_1.jsx)("button", { className: "fastauth-close-button", onClick: onClose, children: (0, jsx_runtime_1.jsx)(CloseIcon_1.CloseIcon, {}) })] }), (0, jsx_runtime_1.jsx)("div", { className: "fastauth-modal-body", children: loading ? ((0, jsx_runtime_1.jsx)("div", { className: "fastauth-loading-indicator", children: (0, jsx_runtime_1.jsx)(react_spinners_1.ClipLoader, { color: "#5f8afa", loading: loading, size: 50 }) })) : ((0, jsx_runtime_1.jsx)("div", { className: "fastauth-content", children: iframeVisible && publicKeyString ? ((0, jsx_runtime_1.jsx)("iframe", { src: `${constants_1.AUTH_ORIGIN}/index.html?publicKey=${encodeURIComponent(publicKeyString)}&appId=${encodeURIComponent(appId)}`, title: "Authentication", className: "fastauth-auth-iframe", sandbox: "allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox" })) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(react_google_button_1.default, { onClick: handleSignInClick }), (0, jsx_runtime_1.jsx)("button", { className: "wallet-signin-button", onClick: handleWalletSignIn, children: "Sign in with a Wallet" })] })) })) })] }) }));
};
exports.default = FastAuthModal;
