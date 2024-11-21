"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
// src/FastAuthProvider.tsx
const react_1 = __importDefault(require("react"));
const google_1 = require("@react-oauth/google");
const FastAuthProvider = ({ children, clientId, }) => {
    return ((0, jsx_runtime_1.jsx)(google_1.GoogleOAuthProvider, { clientId: clientId, children: children }));
};
exports.default = FastAuthProvider;
