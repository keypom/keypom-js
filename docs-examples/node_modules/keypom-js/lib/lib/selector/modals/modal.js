"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupKeypomModal = void 0;
var react_1 = __importDefault(require("react"));
var client_1 = require("react-dom/client");
var KeypomModal_1 = require("./KeypomModal");
var MODAL_ELEMENT_ID = "keypom-trial-modal";
var modalInstance = null;
var setupKeypomModal = function (options, onSubmit) {
    var el = document.createElement("div");
    el.id = MODAL_ELEMENT_ID;
    if (!document.getElementById(MODAL_ELEMENT_ID)) {
        document.body.appendChild(el);
    }
    var container = document.getElementById(MODAL_ELEMENT_ID);
    var root = (0, client_1.createRoot)(container);
    var render = function (visible) {
        if (visible === void 0) { visible = false; }
        root.render(react_1.default.createElement(KeypomModal_1.KeypomModal, { options: options, visible: visible, hide: function () { return render(false); }, onSubmit: onSubmit }));
    };
    if (!modalInstance) {
        modalInstance = {
            show: function () {
                render(true);
            },
            hide: function () {
                render(false);
            },
        };
    }
    return modalInstance;
};
exports.setupKeypomModal = setupKeypomModal;
