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
exports.ClaimTrial = void 0;
var react_1 = __importStar(require("react"));
var keypom_utils_1 = require("../../../../../keypom-utils");
var trial_accounts_1 = require("../../../../../trial-accounts");
var modal_types_1 = require("../modal.types");
var MainBody_1 = require("./MainBody");
var ClaimTrial = function (_a) {
    var hide = _a.hide, secretKey = _a.secretKey, redirectUrlBase = _a.redirectUrlBase, delimiter = _a.delimiter;
    var _b = (0, react_1.useState)(""), accountId = _b[0], setAccountId = _b[1];
    var _c = (0, react_1.useState)(false), isClaimingTrial = _c[0], setIsClaimingTrial = _c[1];
    var _d = (0, react_1.useState)(false), dropClaimed = _d[0], setDropClaimed = _d[1];
    var _e = (0, react_1.useState)(true), validName = _e[0], setValidName = _e[1];
    var handleSubmit = function (event) { return __awaiter(void 0, void 0, void 0, function () {
        var exists;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    event.preventDefault();
                    return [4 /*yield*/, (0, keypom_utils_1.accountExists)(accountId)];
                case 1:
                    exists = _a.sent();
                    if (!exists) return [3 /*break*/, 2];
                    alert("The account: ".concat(accountId, " already exists. Please choose a new one."));
                    return [3 /*break*/, 4];
                case 2:
                    alert("The account: ".concat(accountId, " is available. Click the claim."));
                    setIsClaimingTrial(true);
                    return [4 /*yield*/, (0, trial_accounts_1.claimTrialAccountDrop)({ desiredAccountId: accountId, secretKey: secretKey })];
                case 3:
                    _a.sent();
                    setIsClaimingTrial(false);
                    setDropClaimed(true);
                    _a.label = 4;
                case 4: return [2 /*return*/];
            }
        });
    }); };
    return (isClaimingTrial ? (react_1.default.createElement("div", { className: "nws-modal", style: { width: "70%", height: "27%" } },
        react_1.default.createElement("div", { className: "modal-right", style: { width: "100%" } },
            react_1.default.createElement(MainBody_1.MainBody, { title: "Yooooo The Drop Is Being Claimed!!", body: "It's Party Time!! Dance a lil' while you wait bruv", headerOne: null, headerTwo: null, onCloseModal: function () {
                    return hide();
                } })))) : ((dropClaimed ? (react_1.default.createElement("div", { className: "nws-modal", style: { width: "70%", height: "27%" } },
        react_1.default.createElement("div", { className: "modal-right", style: { width: "100%" } },
            react_1.default.createElement(MainBody_1.MainBody, { title: "The Drop Was Claimed!!", body: "Ser click this button for airdrop", headerOne: null, headerTwo: null, button: {
                    text: "Click Me 🫡",
                    url: "".concat(redirectUrlBase).concat(accountId).concat(delimiter).concat(secretKey),
                    newTab: false
                }, onCloseModal: function () {
                    return hide();
                } })))) : (react_1.default.createElement("div", { className: "nws-modal", style: { width: "70%", height: "27%" } },
        react_1.default.createElement("div", { className: "modal-right", style: { width: "100%" } },
            react_1.default.createElement(MainBody_1.MainBody, { title: modal_types_1.MODAL_DEFAULTS.claimTrial.mainBody.title, body: modal_types_1.MODAL_DEFAULTS.claimTrial.mainBody.body, headerOne: null, headerTwo: null, onCloseModal: function () {
                    return hide();
                } }),
            react_1.default.createElement("form", { onSubmit: handleSubmit },
                react_1.default.createElement("label", null,
                    "Enter your name:",
                    react_1.default.createElement("input", { type: "text", value: accountId, onChange: function (e) { return setAccountId(e.target.value); } })),
                react_1.default.createElement("input", { type: "submit" }))))))));
};
exports.ClaimTrial = ClaimTrial;
