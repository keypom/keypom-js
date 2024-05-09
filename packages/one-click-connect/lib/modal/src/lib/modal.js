"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupModal = void 0;
var react_1 = __importDefault(require("react"));
var client_1 = require("react-dom/client");
var KeypomModal_1 = require("./components/KeypomModal");
var modal_types_1 = require("./modal.types");
var MODAL_ELEMENT_ID = "near-wallet-selector-modal";
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
        if (modalType === void 0) { modalType = { id: modal_types_1.MODAL_TYPE_IDS.TRIAL_OVER }; }
        root.render(react_1.default.createElement(KeypomModal_1.KeypomModal, { options: options, modalType: modalType, visible: visible, hide: function () { return render(false); } }));
    };
    if (!modalInstance) {
        modalInstance = {
            show: function (modalType) {
                render(true, modalType);
            },
            hide: function () {
                render(false);
            },
        };
    }
    return modalInstance;
};
exports.setupModal = setupModal;
