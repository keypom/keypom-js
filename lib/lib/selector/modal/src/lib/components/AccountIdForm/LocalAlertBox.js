"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var styled_components_1 = __importDefault(require("styled-components"));
var utils_1 = require("./utils");
var LocalAlertBoxContainer = styled_components_1.default.div(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n    font-weight: 500;\n    margin-top: -25px;\n    padding-bottom: 9px;\n    line-height: 16px;\n\n    &.problem {\n        color: #ff585d;\n    }\n    &.success {\n        color: #00C08B;\n    }\n\n    &.dots {\n        color: #4a4f54;\n\n        :after {\n            content: '.';\n            animation: link 1s steps(5, end) infinite;\n        \n            @keyframes link {\n                0%, 20% {\n                    color: rgba(0,0,0,0);\n                    text-shadow:\n                        .3em 0 0 rgba(0,0,0,0),\n                        .6em 0 0 rgba(0,0,0,0);\n                }\n                40% {\n                    color: #4a4f54;\n                    text-shadow:\n                        .3em 0 0 rgba(0,0,0,0),\n                        .6em 0 0 rgba(0,0,0,0);\n                }\n                60% {\n                    text-shadow:\n                        .3em 0 0 #4a4f54,\n                        .6em 0 0 rgba(0,0,0,0);\n                }\n                80%, 100% {\n                    text-shadow:\n                        .3em 0 0 #4a4f54,\n                        .6em 0 0 #4a4f54;\n                }\n            }\n        }\n    }\n\n    @media screen and (max-width: 991px) {\n        font-size: 12px;\n    }\n"], ["\n    font-weight: 500;\n    margin-top: -25px;\n    padding-bottom: 9px;\n    line-height: 16px;\n\n    &.problem {\n        color: #ff585d;\n    }\n    &.success {\n        color: #00C08B;\n    }\n\n    &.dots {\n        color: #4a4f54;\n\n        :after {\n            content: '.';\n            animation: link 1s steps(5, end) infinite;\n        \n            @keyframes link {\n                0%, 20% {\n                    color: rgba(0,0,0,0);\n                    text-shadow:\n                        .3em 0 0 rgba(0,0,0,0),\n                        .6em 0 0 rgba(0,0,0,0);\n                }\n                40% {\n                    color: #4a4f54;\n                    text-shadow:\n                        .3em 0 0 rgba(0,0,0,0),\n                        .6em 0 0 rgba(0,0,0,0);\n                }\n                60% {\n                    text-shadow:\n                        .3em 0 0 #4a4f54,\n                        .6em 0 0 rgba(0,0,0,0);\n                }\n                80%, 100% {\n                    text-shadow:\n                        .3em 0 0 #4a4f54,\n                        .6em 0 0 #4a4f54;\n                }\n            }\n        }\n    }\n\n    @media screen and (max-width: 991px) {\n        font-size: 12px;\n    }\n"])));
/**
 * Renders request status.
 *
 * @param localAlert {object} request status, can be null in case not completed yet / no outgoing request
 * @param localAlert.success {boolean} true if request was succesful
 * @param localAlert.messageCode {string} localization code of status message to display
 */
var LocalAlertBox = function (_a) {
    var localAlert = _a.localAlert, accountId = _a.accountId, dots = _a.dots;
    return ((localAlert === null || localAlert === void 0 ? void 0 : localAlert.show) ? (react_1.default.createElement(LocalAlertBoxContainer, { className: (0, utils_1.classNames)(['alert-info', { 'success': localAlert.success }, { 'problem': !localAlert.success }, { 'dots': dots }]) }, localAlert.messageCode)) : null);
};
exports.default = LocalAlertBox;
var templateObject_1;
