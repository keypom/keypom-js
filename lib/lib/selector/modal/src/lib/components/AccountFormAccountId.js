"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ACCOUNT_CHECK_TIMEOUT = void 0;
var prop_types_1 = __importDefault(require("prop-types"));
var react_1 = __importStar(require("react"));
var styled_components_1 = __importDefault(require("styled-components"));
var classNames = function (names) {
    if (!names) {
        return false;
    }
    var isArray = Array.isArray;
    if (typeof names === "string") {
        return names || "";
    }
    if (isArray(names) && names.length > 0) {
        return names
            .map(function (name) { return classNames(name); })
            .filter(function (name) { return !!name; })
            .join(" ");
    }
    return Object.keys(names)
        .filter(function (key) { return names[key]; })
        .join(" ");
};
exports.ACCOUNT_CHECK_TIMEOUT = 500;
var InputWrapper = styled_components_1.default.div(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  position: relative;\n  display: inline-block;\n  width: 100%;\n  overflow: hidden;\n  padding: 4px;\n  margin: 5px -4px 30px -4px;\n\n  input {\n    margin-top: 0px !important;\n  }\n\n  &.wrong-char {\n    input {\n      animation-duration: 0.4s;\n      animation-iteration-count: 1;\n      animation-name: border-blink;\n\n      @keyframes border-blink {\n        0% {\n          box-shadow: 0 0 0 0 rgba(255, 88, 93, 0.8);\n        }\n        100% {\n          box-shadow: 0 0 0 6px rgba(255, 88, 93, 0);\n        }\n      }\n    }\n  }\n\n  &.create {\n    .input-suffix {\n      position: absolute;\n      color: #a6a6a6;\n      pointer-events: none;\n      top: 50%;\n      transform: translateY(-50%);\n      visibility: hidden;\n    }\n  }\n"], ["\n  position: relative;\n  display: inline-block;\n  width: 100%;\n  overflow: hidden;\n  padding: 4px;\n  margin: 5px -4px 30px -4px;\n\n  input {\n    margin-top: 0px !important;\n  }\n\n  &.wrong-char {\n    input {\n      animation-duration: 0.4s;\n      animation-iteration-count: 1;\n      animation-name: border-blink;\n\n      @keyframes border-blink {\n        0% {\n          box-shadow: 0 0 0 0 rgba(255, 88, 93, 0.8);\n        }\n        100% {\n          box-shadow: 0 0 0 6px rgba(255, 88, 93, 0);\n        }\n      }\n    }\n  }\n\n  &.create {\n    .input-suffix {\n      position: absolute;\n      color: #a6a6a6;\n      pointer-events: none;\n      top: 50%;\n      transform: translateY(-50%);\n      visibility: hidden;\n    }\n  }\n"])));
var AccountFormAccountId = /** @class */ (function (_super) {
    __extends(AccountFormAccountId, _super);
    function AccountFormAccountId() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {
            accountId: _this.props.defaultAccountId || "",
            invalidAccountIdLength: false,
            wrongChar: false,
        };
        _this.checkAccountAvailabilityTimer = null;
        _this.canvas = null;
        _this.suffix = (0, react_1.createRef)();
        _this.componentDidMount = function () {
            var defaultAccountId = _this.props.defaultAccountId;
            var accountId = _this.state.accountId;
            if (defaultAccountId) {
                _this.handleChangeAccountId({ userValue: accountId });
            }
        };
        _this.updateSuffix = function (userValue) {
            if (userValue.match(_this.props.pattern)) {
                return;
            }
            var isSafari = /Safari/.test(navigator.userAgent) &&
                /Apple Computer/.test(navigator.vendor);
            var width = _this.getTextWidth(userValue, "16px Inter");
            var extraSpace = isSafari ? 21.5 : 22;
            _this.suffix.current.style.left = "".concat(width).concat(extraSpace, "px");
            _this.suffix.current.style.visibility = "visible";
            if (userValue.length === 0) {
                _this.suffix.current.style.visibility = "hidden";
            }
        };
        _this.getTextWidth = function (text, font) {
            if (!_this.canvas) {
                _this.canvas = document.createElement("canvas");
            }
            var context = _this.canvas.getContext("2d");
            context.font = font;
            var metrics = context.measureText(text);
            return metrics.width;
        };
        _this.handleChangeAccountId = function (_a) {
            var userValue = _a.userValue, el = _a.el;
            var _b = _this.props, pattern = _b.pattern, handleChange = _b.handleChange, type = _b.type;
            var accountId = userValue.toLowerCase();
            if (accountId === _this.state.accountId) {
                return;
            }
            if (accountId.match(pattern)) {
                if (_this.state.wrongChar) {
                    el.style.animation = "none";
                    void el.offsetHeight;
                    el.style.animation = null;
                }
                else {
                    _this.setState(function () { return ({
                        wrongChar: true,
                    }); });
                }
                return false;
            }
            else {
                _this.setState(function () { return ({
                    wrongChar: false,
                }); });
            }
            _this.setState(function () { return ({
                accountId: accountId,
            }); });
            handleChange(accountId);
            _this.props.localAlert && _this.props.clearLocalAlert();
            _this.state.invalidAccountIdLength &&
                _this.handleAccountIdLengthState(accountId);
            _this.checkAccountAvailabilityTimer &&
                clearTimeout(_this.checkAccountAvailabilityTimer);
            _this.checkAccountAvailabilityTimer = setTimeout(function () {
                _this.handleCheckAvailability(accountId, type);
            }, exports.ACCOUNT_CHECK_TIMEOUT);
        };
        _this.checkAccountIdLength = function (accountId) {
            var accountIdWithSuffix = "".concat(accountId, ".").concat(_this.props.accountIdSuffix);
            return accountIdWithSuffix.length >= 2 && accountIdWithSuffix.length <= 64;
        };
        _this.handleAccountIdLengthState = function (accountId) {
            return _this.setState(function () { return ({
                invalidAccountIdLength: !!accountId && !_this.checkAccountIdLength(accountId),
            }); });
        };
        _this.isImplicitAccount = function (accountId) { return _this.props.type !== "create" && accountId.length === 64; };
        _this.handleCheckAvailability = function (accountId, type) {
            if (!accountId) {
                return false;
            }
            if (_this.isImplicitAccount(accountId)) {
                return true;
            }
            if (!(type === "create" &&
                !_this.handleAccountIdLengthState(accountId) &&
                !_this.checkAccountIdLength(accountId))) {
                return _this.props.checkAvailability(type === "create" ? _this.props.accountId : accountId);
            }
            return false;
        };
        return _this;
    }
    Object.defineProperty(AccountFormAccountId.prototype, "loaderLocalAlert", {
        get: function () {
            return {
                messageCode: "account.create.checkingAvailablity.".concat(this.props.type),
            };
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(AccountFormAccountId.prototype, "accountIdLengthLocalAlert", {
        get: function () {
            return {
                success: false,
                messageCode: "account.create.errorInvalidAccountIdLength",
            };
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(AccountFormAccountId.prototype, "sameAccountLocalAlert", {
        get: function () {
            return {
                success: false,
                show: true,
                messageCode: "account.available.errorSameAccount",
            };
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(AccountFormAccountId.prototype, "implicitAccountLocalAlert", {
        get: function () {
            return {
                success: true,
                messageCode: "account.available.implicitAccount",
            };
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(AccountFormAccountId.prototype, "localAlertWithFormValidation", {
        get: function () {
            var _a = this.state, accountId = _a.accountId, invalidAccountIdLength = _a.invalidAccountIdLength;
            var _b = this.props, mainLoader = _b.mainLoader, localAlert = _b.localAlert;
            if (!accountId) {
                return null;
            }
            if (this.isImplicitAccount(accountId)) {
                return this.implicitAccountLocalAlert;
            }
            if (mainLoader) {
                return this.loaderLocalAlert;
            }
            if (invalidAccountIdLength) {
                return this.accountIdLengthLocalAlert;
            }
            return localAlert;
        },
        enumerable: false,
        configurable: true
    });
    AccountFormAccountId.prototype.render = function () {
        var _this = this;
        var _a = this.props, mainLoader = _a.mainLoader, autoFocus = _a.autoFocus, type = _a.type, disabled = _a.disabled;
        var _b = this.state, accountId = _b.accountId, wrongChar = _b.wrongChar;
        console.log("{ accountId, wrongChar }: ", { accountId: accountId, wrongChar: wrongChar });
        var localAlert = this.localAlertWithFormValidation;
        var success = localAlert === null || localAlert === void 0 ? void 0 : localAlert.success;
        var problem = !(localAlert === null || localAlert === void 0 ? void 0 : localAlert.success) && (localAlert === null || localAlert === void 0 ? void 0 : localAlert.show);
        return (react_1.default.createElement(InputWrapper, { className: classNames([
                type,
                { success: success },
                { problem: problem },
                { "wrong-char": wrongChar },
            ]) },
            react_1.default.createElement("input", { name: "accountId", "data-test-id": "createAccount.accountIdInput", value: accountId, onInput: function (e) {
                    return type === "create" && _this.updateSuffix(e.target.value.trim());
                }, onChange: function (e) {
                    return _this.handleChangeAccountId({
                        userValue: e.target.value.trim(),
                        el: e.target,
                    });
                }, placeholder: "placeholder", required: true, autoComplete: "off", autoCorrect: "off", autoCapitalize: "off", spellCheck: "false", 
                // rome-ignore lint/a11y/noPositiveTabindex: <explanation>
                tabIndex: "1", disabled: disabled }),
            react_1.default.createElement("span", { className: "input-suffix", ref: this.suffix },
                ".",
                this.props.accountIdSuffix)));
    };
    return AccountFormAccountId;
}(react_1.Component));
AccountFormAccountId.propTypes = {
    handleChange: prop_types_1.default.func.isRequired,
    checkAvailability: prop_types_1.default.func.isRequired,
    defaultAccountId: prop_types_1.default.string,
    autoFocus: prop_types_1.default.bool,
    accountIdSuffix: prop_types_1.default.string.isRequired
};
AccountFormAccountId.defaultProps = {
    autoFocus: false,
    pattern: /[^a-zA-Z0-9._-]/,
    type: "check",
    accountIdSuffix: 'testnet'
};
exports.default = AccountFormAccountId;
var templateObject_1;
