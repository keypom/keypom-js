"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupModal = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importDefault(require("react"));
const client_1 = require("react-dom/client");
const FastAuthModal_1 = __importDefault(require("./FastAuthModal"));
const modal_ui_1 = require("@near-wallet-selector/modal-ui"); // Import setupModal
let root = null;
function setupModal(selector, options) {
    let isVisible = false;
    let walletSelectorModal = null;
    const show = () => {
        isVisible = true;
        renderModal();
    };
    const hide = () => {
        isVisible = false;
        renderModal();
    };
    const renderModal = () => {
        const container = document.getElementById("fastauth-wallet-selector-modal") ||
            document.createElement("div");
        container.id = "fastauth-wallet-selector-modal";
        document.body.appendChild(container);
        if (!root) {
            root = (0, client_1.createRoot)(container);
        }
        if (!walletSelectorModal) {
            walletSelectorModal = (0, modal_ui_1.setupModal)(selector, {
                contractId: options.contractId,
                methodNames: options.methodNames,
                theme: options.theme,
                description: options.description,
                // Include other options as needed
            });
        }
        root.render((0, jsx_runtime_1.jsx)(FastAuthModal_1.default, { selector: selector, options: options, isVisible: isVisible, onClose: hide, walletSelectorModal: walletSelectorModal }));
    };
    return {
        show,
        hide,
    };
}
exports.setupModal = setupModal;
