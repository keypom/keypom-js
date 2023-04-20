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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BeginTrial = void 0;
var react_1 = __importStar(require("react"));
var keypom_utils_1 = require("../../../../../keypom-utils");
var modal_types_1 = require("../modal.types");
var MainBody_1 = require("./MainBody");
var AccountFormAccountId_1 = __importDefault(require("./AccountIdForm/AccountFormAccountId"));
var keypom_1 = require("../../../../../keypom");
var ACCOUNT_ID_REGEX = /^(([a-z\d]+[-_])*[a-z\d]+\.)*([a-z\d]+[-_])*[a-z\d]+$/;
var BeginTrial = function (_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j;
    var hide = _a.hide, secretKey = _a.secretKey, redirectUrlBase = _a.redirectUrlBase, delimiter = _a.delimiter, customizations = _a.customizations;
    var _k = (0, react_1.useState)(""), accountId = _k[0], setAccountId = _k[1];
    var _l = (0, react_1.useState)(false), isClaimingTrial = _l[0], setIsClaimingTrial = _l[1];
    var _m = (0, react_1.useState)(false), dropClaimed = _m[0], setDropClaimed = _m[1];
    var _o = (0, react_1.useState)(true), validAccountName = _o[0], setValidAccountName = _o[1];
    var _p = (0, react_1.useState)(false), doesAccountExist = _p[0], setDoesAccountExist = _p[1];
    var networkId = (0, keypom_1.getEnv)().networkId;
    var accountSuffix = networkId == "testnet" ? "testnet" : "near";
    var checkNewAccount = function (accountId) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("accountId in check: ", accountId);
                    if (!ACCOUNT_ID_REGEX.test(accountId)) {
                        setValidAccountName(false);
                        return [2 /*return*/, false];
                    }
                    return [4 /*yield*/, (0, keypom_utils_1.accountExists)(accountId)];
                case 1:
                    if (_a.sent()) {
                        setDoesAccountExist(true);
                        return [2 /*return*/, false];
                    }
                    return [2 /*return*/, true];
            }
        });
    }); };
    var handleChange = function (value) {
        if (value.length > 0) {
            setAccountId("".concat(value, ".").concat(accountSuffix));
        }
        else {
            setAccountId(value);
        }
    };
    // Landing modal - drop isn't claimed and we're not in the process of claiming
    if (!dropClaimed && !isClaimingTrial) {
        return (react_1.default.createElement("div", { className: "nws-modal", style: { width: "100%", height: "auto", maxWidth: "500px" } },
            react_1.default.createElement("div", { className: "modal-right", style: { width: "100%" } },
                react_1.default.createElement(MainBody_1.MainBody, { title: ((_b = customizations === null || customizations === void 0 ? void 0 : customizations.landing) === null || _b === void 0 ? void 0 : _b.title) ||
                        modal_types_1.MODAL_DEFAULTS.beginTrial.landing.title, body: ((_c = customizations === null || customizations === void 0 ? void 0 : customizations.landing) === null || _c === void 0 ? void 0 : _c.body) ||
                        modal_types_1.MODAL_DEFAULTS.beginTrial.landing.body, imageOne: null, imageTwo: null, button: null, onCloseModal: function () { return hide(); } }),
                react_1.default.createElement(AccountFormAccountId_1.default, { handleChange: handleChange, type: "create", pattern: /[^a-zA-Z0-9_-]/, checkAvailability: checkNewAccount, accountId: accountId, placeholder: ((_d = customizations === null || customizations === void 0 ? void 0 : customizations.landing) === null || _d === void 0 ? void 0 : _d.fieldPlaceholder) ||
                        modal_types_1.MODAL_DEFAULTS.beginTrial.landing.fieldPlaceholder, autoFocus: true, accountIdSuffix: accountSuffix }))));
    }
    // Claiming modal - drop is not claimed and we're in the process of claiming
    if (isClaimingTrial) {
        return (react_1.default.createElement("div", { className: "nws-modal", style: { width: "100%", height: "auto", maxWidth: "500px" } },
            react_1.default.createElement("div", { className: "modal-right", style: { width: "100%" } },
                react_1.default.createElement(MainBody_1.MainBody, { title: ((_e = customizations === null || customizations === void 0 ? void 0 : customizations.claiming) === null || _e === void 0 ? void 0 : _e.title) ||
                        modal_types_1.MODAL_DEFAULTS.beginTrial.claiming.title, body: ((_f = customizations === null || customizations === void 0 ? void 0 : customizations.claiming) === null || _f === void 0 ? void 0 : _f.body) ||
                        modal_types_1.MODAL_DEFAULTS.beginTrial.claiming.body, imageOne: null, imageTwo: null, button: null, onCloseModal: function () { return console.log("cant close... claiming."); } }))));
    }
    // Drop was claimed
    return (react_1.default.createElement("div", { className: "nws-modal", style: { width: "100%", height: "auto", maxWidth: "500px" } },
        react_1.default.createElement("div", { className: "modal-right", style: { width: "100%" } },
            react_1.default.createElement(MainBody_1.MainBody, { title: ((_g = customizations === null || customizations === void 0 ? void 0 : customizations.claimed) === null || _g === void 0 ? void 0 : _g.title) ||
                    modal_types_1.MODAL_DEFAULTS.beginTrial.claimed.title, body: ((_h = customizations === null || customizations === void 0 ? void 0 : customizations.claimed) === null || _h === void 0 ? void 0 : _h.body) ||
                    modal_types_1.MODAL_DEFAULTS.beginTrial.claimed.body, imageOne: null, imageTwo: null, button: {
                    text: ((_j = customizations === null || customizations === void 0 ? void 0 : customizations.claimed) === null || _j === void 0 ? void 0 : _j.buttonText) ||
                        modal_types_1.MODAL_DEFAULTS.beginTrial.claimed.buttonText,
                    url: "".concat(redirectUrlBase).concat(accountId).concat(delimiter).concat(secretKey),
                    newTab: false,
                }, onCloseModal: function () {
                    window.location.replace("".concat(redirectUrlBase).concat(accountId).concat(delimiter).concat(secretKey));
                    window.location.reload();
                } }))));
};
exports.BeginTrial = BeginTrial;
