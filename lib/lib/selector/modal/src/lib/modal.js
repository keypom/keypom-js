"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupModal = exports.MODAL_DEFAULTS = exports.MODAL_TYPE = void 0;
var core_1 = require("@near-wallet-selector/core");
var react_1 = __importDefault(require("react"));
var client_1 = require("react-dom/client");
var KeypomModal_1 = require("./components/KeypomModal");
var MODAL_ELEMENT_ID = "near-wallet-selector-modal";
exports.MODAL_TYPE = {
    TRIAL_OVER: "trial-over",
    ERROR: "action-error"
};
exports.MODAL_DEFAULTS = {
    trialOver: {
        mainBody: {
            title: "Your Trial Has Ended",
            body: "To continue using NEAR, secure your account with a wallet.",
            headerOne: {
                title: (0, core_1.translate)("modal.wallet.secureAndManage"),
                description: (0, core_1.translate)("modal.wallet.safelyStore")
            },
            headerTwo: {
                title: (0, core_1.translate)("modal.wallet.logInToAny"),
                description: (0, core_1.translate)("modal.wallet.noNeedToCreate")
            },
        },
        moduleList: {
            modulesTitle: "Choose a Wallet",
        }
    },
    error: {
        title: "Invalid Action",
        body: "Your trial does not allow you to perform this action. For more information, please contact the site administrator."
    }
};
var modalInstance = null;
var setupModal = function (options) {
    var el = document.createElement("div");
    el.id = MODAL_ELEMENT_ID;
    if (!document.getElementById(MODAL_ELEMENT_ID)) {
        document.body.appendChild(el);
    }
    var container = document.getElementById(MODAL_ELEMENT_ID);
    var root = (0, client_1.createRoot)(container);
    var render = function (visible, modalType) {
        if (visible === void 0) { visible = false; }
        if (modalType === void 0) { modalType = exports.MODAL_TYPE.TRIAL_OVER; }
        root.render(react_1.default.createElement(KeypomModal_1.KeypomModal, { options: options, modalType: modalType, visible: visible, hide: function () { return render(false); } }));
    };
    if (!modalInstance) {
        modalInstance = {
            show: function (modalType) {
                render(true, modalType);
            },
            hide: function () {
                render(false);
            }
        };
    }
    return modalInstance;
};
exports.setupModal = setupModal;
