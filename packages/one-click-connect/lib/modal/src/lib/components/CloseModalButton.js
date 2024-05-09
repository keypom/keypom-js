"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloseModalButton = void 0;
var react_1 = __importDefault(require("react"));
var CloseModalButton = function (_a) {
    var onClick = _a.onClick;
    return (react_1.default.createElement("button", { onClick: onClick, className: "close-button" },
        react_1.default.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", height: "24", viewBox: "0 0 24 24", width: "24", fill: "#C1C1C1" },
            react_1.default.createElement("path", { d: "M0 0h24v24H0z", fill: "none" }),
            react_1.default.createElement("path", { d: "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" }))));
};
exports.CloseModalButton = CloseModalButton;
