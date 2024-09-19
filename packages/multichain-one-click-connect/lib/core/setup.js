"use strict";
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
exports.setupOneClickConnect = void 0;
var web3_1 = __importDefault(require("web3"));
var web3_provider_1 = __importDefault(require("@walletconnect/web3-provider"));
var client_1 = __importDefault(require("@walletconnect/client"));
/**
 * Function to handle One Click Connect without wagmi.
 *
 * @param connect - Function to call once the wallet is connected.
 */
var setupOneClickConnect = function (connect) { return __awaiter(void 0, void 0, void 0, function () {
    var urlParams, connectionAccount, connector, accounts, walletAddress, provider, web3, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                urlParams = new URLSearchParams(window.location.search);
                connectionAccount = urlParams.get("connectionAccount");
                console.log("connectionAccount", connectionAccount);
                if (!connectionAccount) return [3 /*break*/, 7];
                _a.label = 1;
            case 1:
                _a.trys.push([1, 6, , 7]);
                connector = new client_1.default({
                    bridge: "https://bridge.walletconnect.org",
                    qrcodeModal: undefined,
                });
                console.log("connector", connector);
                if (!connector.connected) return [3 /*break*/, 3];
                accounts = connector.accounts;
                walletAddress = accounts[0];
                if (!(walletAddress.toLowerCase() ===
                    connectionAccount.toLowerCase())) return [3 /*break*/, 3];
                provider = new web3_provider_1.default({
                    bridge: "https://bridge.walletconnect.org",
                    qrcode: false, // Disable QR code modal
                });
                // Enable session (trigger connection)
                return [4 /*yield*/, provider.enable()];
            case 2:
                // Enable session (trigger connection)
                _a.sent();
                web3 = new web3_1.default(provider);
                console.log("web3", web3);
                // Call the connect function with the wallet details
                connect({
                    walletAddress: walletAddress,
                    provider: web3.currentProvider,
                });
                console.info("Auto-connected to wallet:", walletAddress);
                return [2 /*return*/];
            case 3:
                if (!!connector.connected) return [3 /*break*/, 5];
                return [4 /*yield*/, connector.createSession()];
            case 4:
                _a.sent(); // Create a session
                console.log("connected", connector.connected);
                _a.label = 5;
            case 5:
                // Auto-connect logic: Wait for the connection to complete
                connector.on("connect", function (error, payload) { return __awaiter(void 0, void 0, void 0, function () {
                    var accounts, walletAddress, provider, web3;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (error) {
                                    throw error;
                                }
                                accounts = payload.params[0].accounts;
                                walletAddress = accounts[0];
                                if (!(walletAddress.toLowerCase() ===
                                    connectionAccount.toLowerCase())) return [3 /*break*/, 2];
                                provider = new web3_provider_1.default({
                                    bridge: "https://bridge.walletconnect.org",
                                    qrcode: false, // Disable QR code modal
                                });
                                // Enable session (trigger connection)
                                return [4 /*yield*/, provider.enable()];
                            case 1:
                                // Enable session (trigger connection)
                                _a.sent();
                                web3 = new web3_1.default(provider);
                                console.log("web3", web3);
                                // Call the connect function with the wallet details
                                connect({
                                    walletAddress: walletAddress,
                                    provider: web3.currentProvider,
                                });
                                console.info("Connected to wallet:", walletAddress);
                                return [3 /*break*/, 3];
                            case 2:
                                console.warn("Wallet connected does not match connectionAccount from URL.");
                                _a.label = 3;
                            case 3: return [2 /*return*/];
                        }
                    });
                }); });
                return [3 /*break*/, 7];
            case 6:
                error_1 = _a.sent();
                console.error("OneClickConnect: Failed to auto-connect wallet", error_1);
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
}); };
exports.setupOneClickConnect = setupOneClickConnect;
