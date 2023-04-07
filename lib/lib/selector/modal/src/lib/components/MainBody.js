"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MainBody = void 0;
var react_1 = __importDefault(require("react"));
var modal_types_1 = require("../modal.types");
var CloseModalButton_1 = require("./CloseModalButton");
var MainBody = function (_a) {
    var title = _a.title, body = _a.body, headerOne = _a.headerOne, headerTwo = _a.headerTwo, button = _a.button, onCloseModal = _a.onCloseModal;
    return (react_1.default.createElement("div", { className: "wallet-home-wrapper" },
        react_1.default.createElement("div", { className: "nws-modal-header-wrapper" },
            react_1.default.createElement("div", { className: "nws-modal-header" },
                react_1.default.createElement("h3", { className: 'middleTitle' }, title),
                react_1.default.createElement(CloseModalButton_1.CloseModalButton, { onClick: onCloseModal }))),
        react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement("h4", null, body),
            react_1.default.createElement("div", { className: "wallet-info-wrapper what-wallet-hide" },
                headerOne && (react_1.default.createElement("div", { className: "wallet-what" },
                    react_1.default.createElement("div", { className: "icon-side" },
                        react_1.default.createElement("svg", { width: "40", height: "40", viewBox: "0 0 40 40", fill: "none", xmlns: "http://www.w3.org/2000/svg" },
                            react_1.default.createElement("path", { d: "M33.5 1.83325L30.1666 5.16658M17.4818 17.8514C19.1406 19.5103 20.1666 21.8019 20.1666 24.3333C20.1666 29.3959 16.0626 33.4999 11 33.4999C5.93735 33.4999 1.8333 29.3959 1.8333 24.3333C1.8333 19.2706 5.93735 15.1666 11 15.1666C13.5313 15.1666 15.8229 16.1926 17.4818 17.8514ZM17.4818 17.8514L24.3333 10.9999M24.3333 10.9999L29.3333 15.9999L35.1666 10.1666L30.1666 5.16658M24.3333 10.9999L30.1666 5.16658", stroke: "currentColor", strokeWidth: "3", strokeLinecap: "round", strokeLinejoin: "round" }))),
                    react_1.default.createElement("div", { className: "content-side" },
                        react_1.default.createElement("h3", null, (headerOne === null || headerOne === void 0 ? void 0 : headerOne.title) || modal_types_1.MODAL_DEFAULTS.trialOver.mainBody.headerOne.title),
                        react_1.default.createElement("p", null, (headerTwo === null || headerTwo === void 0 ? void 0 : headerTwo.description) || modal_types_1.MODAL_DEFAULTS.trialOver.mainBody.headerOne.description)))),
                headerTwo && (react_1.default.createElement("div", { className: "wallet-what" },
                    react_1.default.createElement("div", { className: "icon-side" },
                        react_1.default.createElement("svg", { width: "40", height: "41", viewBox: "0 0 40 41", fill: "none", xmlns: "http://www.w3.org/2000/svg" },
                            react_1.default.createElement("circle", { cx: "28.3333", cy: "23.8333", r: "1.66667", fill: "currentColor" }),
                            react_1.default.createElement("path", { d: "M35 12.1667H7C5.89543 12.1667 5 11.2712 5 10.1667V7.5C5 6.39543 5.89543 5.5 7 5.5H31.6667", stroke: "currentColor", strokeWidth: "3", strokeLinecap: "round", strokeLinejoin: "round" }),
                            react_1.default.createElement("path", { d: "M35 12.1667V35.5H7C5.89543 35.5 5 34.6046 5 33.5V8.83334", stroke: "currentColor", strokeWidth: "3", strokeLinecap: "round", strokeLinejoin: "round" }))),
                    react_1.default.createElement("div", { className: "content-side" },
                        react_1.default.createElement("h3", null, headerTwo.title || modal_types_1.MODAL_DEFAULTS.trialOver.mainBody.headerTwo.title),
                        react_1.default.createElement("p", null, headerTwo.description || modal_types_1.MODAL_DEFAULTS.trialOver.mainBody.headerTwo.description)))),
                react_1.default.createElement("div", { className: "button-spacing" }),
                button && (react_1.default.createElement("button", { className: "middleButton", onClick: function () {
                        if (button.newTab) {
                            window.open(button.url, '_blank');
                        }
                        else {
                            window.location.replace(button.url || 'https://keypom.xyz/');
                            window.location.reload();
                        }
                    } }, button.text || "Next Steps"))))));
};
exports.MainBody = MainBody;
