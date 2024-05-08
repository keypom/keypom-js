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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BeginTrial = exports.accountAddressPatternNoSubaccount = void 0;
var react_1 = __importStar(require("react"));
var modal_types_1 = require("../modal.types");
var MainBody_1 = require("./MainBody");
var core_1 = require("@keypom/core");
var selector_utils_1 = require("../../../../utils/selector-utils");
/**
 * regex for the body of an account not including TLA and not allowing subaccount
 */
exports.accountAddressPatternNoSubaccount = /^([a-z\d]+[-_])*[a-z\d]+$/;
var BeginTrial = function (_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
    var hide = _a.hide, secretKey = _a.secretKey, redirectUrlBase = _a.redirectUrlBase, includedCid = _a.includedCid, delimiter = _a.delimiter, customizations = _a.customizations;
    var _o = (0, react_1.useState)(""), userInput = _o[0], setUserInput = _o[1];
    var _p = (0, react_1.useState)(""), accountId = _p[0], setAccountId = _p[1];
    var _q = (0, react_1.useState)(false), isClaimingTrial = _q[0], setIsClaimingTrial = _q[1];
    var _r = (0, react_1.useState)(false), dropClaimed = _r[0], setDropClaimed = _r[1];
    var _s = (0, react_1.useState)("grey"), borderColor = _s[0], setBorderColor = _s[1];
    var _t = (0, react_1.useState)(((_c = (_b = customizations === null || customizations === void 0 ? void 0 : customizations.landing) === null || _b === void 0 ? void 0 : _b.subText) === null || _c === void 0 ? void 0 : _c.landing) ||
        modal_types_1.MODAL_DEFAULTS.beginTrial.landing.subText.landing), messageText = _t[0], setMessageText = _t[1];
    var networkId = (0, core_1.getEnv)().networkId;
    var accountIdSuffix = networkId == "testnet" ? "testnet" : "near";
    var handleChangeInput = function (e) { return __awaiter(void 0, void 0, void 0, function () {
        var userInput, actualAccountId, isValid, exists;
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    userInput = e.target.value.toLowerCase();
                    setUserInput(userInput);
                    actualAccountId = "".concat(userInput, ".").concat(accountIdSuffix);
                    setAccountId(actualAccountId);
                    if (!userInput.length) {
                        setMessageText(((_b = (_a = customizations === null || customizations === void 0 ? void 0 : customizations.landing) === null || _a === void 0 ? void 0 : _a.subText) === null || _b === void 0 ? void 0 : _b.landing) ||
                            modal_types_1.MODAL_DEFAULTS.beginTrial.landing.subText.landing);
                        setBorderColor("grey");
                        return [2 /*return*/];
                    }
                    isValid = exports.accountAddressPatternNoSubaccount.test(userInput);
                    if (!isValid) {
                        setMessageText(((_d = (_c = customizations === null || customizations === void 0 ? void 0 : customizations.landing) === null || _c === void 0 ? void 0 : _c.subText) === null || _d === void 0 ? void 0 : _d.invalidAccountId) ||
                            modal_types_1.MODAL_DEFAULTS.beginTrial.landing.subText.invalidAccountId);
                        setBorderColor("red");
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, (0, core_1.accountExists)(actualAccountId)];
                case 1:
                    exists = _e.sent();
                    if (exists) {
                        setMessageText("".concat(actualAccountId, " is taken, try something else."));
                        setBorderColor("red");
                        return [2 /*return*/];
                    }
                    setMessageText("".concat(actualAccountId, " is available!"));
                    setBorderColor("green");
                    return [2 /*return*/];
            }
        });
    }); };
    var handleSubmit = function (event) { return __awaiter(void 0, void 0, void 0, function () {
        var curMethodData, fcArgs, userFcArgs;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    event.preventDefault();
                    if (borderColor === "red")
                        return [2 /*return*/];
                    setIsClaimingTrial(true);
                    return [4 /*yield*/, (0, core_1.getCurMethodData)({ secretKey: secretKey })];
                case 1:
                    curMethodData = _a.sent();
                    console.log("curMethodData: ", curMethodData);
                    fcArgs = Array(curMethodData.length).fill(null);
                    userFcArgs = {
                        INSERT_NEW_ACCOUNT: accountId,
                        INSERT_TRIAL_PUBLIC_KEY: (0, core_1.getPubFromSecret)(secretKey),
                    };
                    fcArgs[0] = JSON.stringify(userFcArgs);
                    return [4 /*yield*/, (0, core_1.claim)({ accountId: accountId, secretKey: secretKey, fcArgs: fcArgs })];
                case 2:
                    _a.sent();
                    setIsClaimingTrial(false);
                    setDropClaimed(true);
                    return [2 /*return*/];
            }
        });
    }); };
    // Landing modal - drop isn't claimed and we're not in the process of claiming
    if (!dropClaimed && !isClaimingTrial) {
        return (react_1.default.createElement("div", { className: "nws-modal", style: { width: "100%", height: "auto", maxWidth: "500px" } },
            react_1.default.createElement("div", { className: "modal-right", style: { width: "100%" } },
                react_1.default.createElement(MainBody_1.MainBody, { title: ((_d = customizations === null || customizations === void 0 ? void 0 : customizations.landing) === null || _d === void 0 ? void 0 : _d.title) ||
                        modal_types_1.MODAL_DEFAULTS.beginTrial.landing.title, body: ((_e = customizations === null || customizations === void 0 ? void 0 : customizations.landing) === null || _e === void 0 ? void 0 : _e.body) ||
                        modal_types_1.MODAL_DEFAULTS.beginTrial.landing.body, imageOne: null, imageTwo: null, button: null, onCloseModal: function () { return hide(); } }),
                react_1.default.createElement("div", { style: {
                        position: "relative",
                    } },
                    react_1.default.createElement("div", { style: {
                            display: "flex",
                            alignItems: "center",
                        } },
                        react_1.default.createElement("input", { type: "text", value: userInput, onChange: handleChangeInput, placeholder: ((_f = customizations === null || customizations === void 0 ? void 0 : customizations.landing) === null || _f === void 0 ? void 0 : _f.fieldPlaceholder) ||
                                modal_types_1.MODAL_DEFAULTS.beginTrial.landing.fieldPlaceholder, style: {
                                width: "100%",
                                padding: "8px",
                                border: "1px solid",
                                borderRadius: "8px",
                                marginRight: "8px",
                                borderColor: borderColor,
                            } }),
                        react_1.default.createElement("span", null,
                            ".",
                            accountIdSuffix)),
                    react_1.default.createElement("div", { style: {
                            position: "absolute",
                            top: "42px",
                            left: 0,
                            color: borderColor,
                        } },
                        react_1.default.createElement("sub", null, messageText))),
                react_1.default.createElement("div", { style: { marginBottom: "32px" } }),
                react_1.default.createElement("div", { className: "nws-modal-body wallet-info-wrapper what-wallet-hide " },
                    react_1.default.createElement("button", { disabled: borderColor === "red", className: "middleButton", onClick: handleSubmit, style: {
                            width: "100%",
                            padding: "8px",
                            borderRadius: "8px",
                        } }, ((_g = customizations === null || customizations === void 0 ? void 0 : customizations.landing) === null || _g === void 0 ? void 0 : _g.buttonText) ||
                        modal_types_1.MODAL_DEFAULTS.beginTrial.landing.buttonText)))));
    }
    // Claiming modal - drop is not claimed and we're in the process of claiming
    if (isClaimingTrial) {
        return (react_1.default.createElement("div", { className: "nws-modal", style: { width: "100%", height: "auto", maxWidth: "500px" } },
            react_1.default.createElement("div", { className: "modal-right", style: { width: "100%" } },
                react_1.default.createElement(MainBody_1.MainBody, { title: ((_h = customizations === null || customizations === void 0 ? void 0 : customizations.claiming) === null || _h === void 0 ? void 0 : _h.title) ||
                        modal_types_1.MODAL_DEFAULTS.beginTrial.claiming.title, body: ((_j = customizations === null || customizations === void 0 ? void 0 : customizations.claiming) === null || _j === void 0 ? void 0 : _j.body) ||
                        modal_types_1.MODAL_DEFAULTS.beginTrial.claiming.body, imageOne: null, imageTwo: null, button: null, onCloseModal: function () { return console.log("cant close... claiming."); } }))));
    }
    // Drop was claimed
    return (react_1.default.createElement("div", { className: "nws-modal", style: { width: "100%", height: "auto", maxWidth: "500px" } },
        react_1.default.createElement("div", { className: "modal-right", style: { width: "100%" } },
            react_1.default.createElement(MainBody_1.MainBody, { title: ((_k = customizations === null || customizations === void 0 ? void 0 : customizations.claimed) === null || _k === void 0 ? void 0 : _k.title) ||
                    modal_types_1.MODAL_DEFAULTS.beginTrial.claimed.title, body: ((_l = customizations === null || customizations === void 0 ? void 0 : customizations.claimed) === null || _l === void 0 ? void 0 : _l.body) ||
                    modal_types_1.MODAL_DEFAULTS.beginTrial.claimed.body, imageOne: null, imageTwo: null, button: null, onCloseModal: function () {
                    var urlToRedirectTo = "".concat(redirectUrlBase).concat(accountId).concat(delimiter).concat(secretKey).concat(includedCid !== undefined ? "?cid=".concat(includedCid) : "");
                    console.log('url to redirect to: ', urlToRedirectTo);
                    localStorage.setItem("".concat(selector_utils_1.KEYPOM_LOCAL_STORAGE_KEY, ":urlToRedirectTo"), urlToRedirectTo);
                    window.location.replace(urlToRedirectTo);
                    window.location.reload();
                } }),
            react_1.default.createElement("div", { className: "nws-modal-body wallet-info-wrapper what-wallet-hide " },
                react_1.default.createElement("button", { className: "middleButton", onClick: function () {
                        var urlToRedirectTo = "".concat(redirectUrlBase).concat(accountId).concat(delimiter).concat(secretKey).concat(includedCid !== undefined ? "?cid=".concat(includedCid) : "");
                        console.log('url to redirect to: ', urlToRedirectTo);
                        localStorage.setItem("".concat(selector_utils_1.KEYPOM_LOCAL_STORAGE_KEY, ":urlToRedirectTo"), urlToRedirectTo);
                        window.location.replace(urlToRedirectTo);
                        window.location.reload();
                    }, style: {
                        width: "100%",
                        padding: "8px",
                        borderRadius: "8px",
                    } }, ((_m = customizations === null || customizations === void 0 ? void 0 : customizations.claimed) === null || _m === void 0 ? void 0 : _m.buttonText) ||
                    modal_types_1.MODAL_DEFAULTS.beginTrial.claimed.buttonText)))));
};
exports.BeginTrial = BeginTrial;
