"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.updateKeypomContractId = exports.updateFunder = exports.initKeypom = exports.execute = exports.getEnv = exports.supportedLinkdropClaimPages = exports.supportedKeypomContracts = exports.officialKeypomContracts = void 0;
var nearAPI = __importStar(require("near-api-js"));
var KeyPair = nearAPI.KeyPair, _a = nearAPI.keyStores, BrowserLocalStorageKeyStore = _a.BrowserLocalStorageKeyStore, InMemoryKeyStore = _a.InMemoryKeyStore;
var near_api_js_1 = require("near-api-js");
var near_seed_phrase_1 = require("near-seed-phrase");
var checks_1 = require("./checks");
var keypom_utils_1 = require("./keypom-utils");
var gas = '200000000000000';
var gas300 = '300000000000000';
var attachedGas = '100000000000000';
var networks = {
    mainnet: {
        networkId: 'mainnet',
        viewAccountId: 'near',
        nodeUrl: 'https://rpc.mainnet.near.org',
        walletUrl: 'https://wallet.near.org',
        helperUrl: 'https://helper.mainnet.near.org'
    },
    testnet: {
        networkId: 'testnet',
        viewAccountId: 'testnet',
        nodeUrl: 'https://rpc.testnet.near.org',
        walletUrl: 'https://wallet.testnet.near.org',
        helperUrl: 'https://helper.testnet.near.org'
    }
};
exports.officialKeypomContracts = {
    mainnet: {
        "v1.keypom.near": true,
        "v1-3.keypom.near": true,
        "v1-4.keypom.near": true,
        "v2.keypom.near": true,
    },
    testnet: {
        "v1.keypom.testnet": true,
        "v1-3.keypom.testnet": true,
        "v1-4.keypom.testnet": true,
        "v2.keypom.testnet": true,
    }
};
exports.supportedKeypomContracts = {
    mainnet: {
        "v1-4.keypom.near": true,
        "v2.keypom.near": true
    },
    testnet: {
        "v1-4.keypom.testnet": true,
        "v2.keypom.testnet": true,
    }
};
exports.supportedLinkdropClaimPages = {
    mainnet: {
        "mynearwallet": "https://app.mynearwallet.com/linkdrop/CONTRACT_ID/SECRET_KEY",
        "keypom": "https://keypom.xyz/claim/CONTRACT_ID#SECRET_KEY"
    },
    testnet: {
        "mynearwallet": "https://testnet.mynearwallet.com/linkdrop/CONTRACT_ID/SECRET_KEY",
        "keypom": "https://testnet.keypom.xyz/claim/CONTRACT_ID#SECRET_KEY"
    }
};
var contractBase = 'v2.keypom';
var contractId = "".concat(contractBase, ".testnet");
var receiverId = contractId;
var near = undefined;
var connection = undefined;
var keyStore = undefined;
var networkId = undefined;
var fundingAccount = undefined;
var fundingAccountDetails = undefined;
var contractAccount = undefined;
var viewAccount = undefined;
var viewCall = undefined;
/**
 *
 * @returns {EnvVars} The environment variables used by the Keypom library.
 * @group Keypom SDK Environment
 */
var getEnv = function () {
    (0, checks_1.assert)(near, 'Keypom uninitialized. Please call initKeypom or initKeypomContext');
    return {
        near: near,
        connection: connection,
        keyStore: keyStore,
        networkId: networkId,
        fundingAccount: fundingAccount,
        contractAccount: contractAccount,
        viewAccount: viewAccount,
        fundingAccountDetails: fundingAccountDetails,
        gas: gas,
        gas300: gas300,
        attachedGas: attachedGas,
        contractId: contractId,
        receiverId: receiverId,
        getAccount: getAccount,
        execute: exports.execute,
        supportedKeypomContracts: exports.supportedKeypomContracts,
        viewCall: viewCall
    };
};
exports.getEnv = getEnv;
/** @group Utility */
var execute = function (args) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
    return [2 /*return*/, (0, keypom_utils_1.execute)(__assign(__assign({}, args), { fundingAccount: fundingAccount }))];
}); }); };
exports.execute = execute;
var getAccount = function (_a) {
    var account = _a.account, wallet = _a.wallet;
    return __awaiter(void 0, void 0, void 0, function () {
        var _b, returnedAccount;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!wallet) return [3 /*break*/, 3];
                    return [4 /*yield*/, wallet];
                case 1:
                    wallet = _c.sent();
                    (0, checks_1.assert)(wallet.signAndSendTransactions, 'Incorrect wallet type');
                    _b = wallet;
                    return [4 /*yield*/, wallet.getAccounts()];
                case 2:
                    _b.accountId = (_c.sent())[0].accountId;
                    _c.label = 3;
                case 3:
                    returnedAccount = account || wallet || fundingAccount;
                    // If neither a wallet object, account object, or funding account is provided, throw an error
                    (0, checks_1.assert)(returnedAccount, 'No account provided. Either pass in an account object, wallet object, or initialize Keypom with a funding account');
                    return [2 /*return*/, returnedAccount];
            }
        });
    });
};
/**
 * Initializes the SDK to allow for interactions with the Keypom Protocol. By default, a new NEAR connection will be established but this can be overloaded by
 * passing in an existing connection object. In either case, if a funder is passed in, the credentials will be added to the keystore to sign transactions.
 *
 * To update the funder account, refer to the `updateFunder` function. If you only wish to use view methods and not sign transactions, no funder account is needed.
 * If you wish to update the Keypom Contract ID being used, refer to the `updateKeypomContractId` function.
 *
 * @returns {Promise<Account | null>} If a funder is passed in, its account object is returned. Otherwise, it null is returned.
 *
 * @example
 * Using a pre-created NEAR connection instance with an UnencryptedFileSystemKeyStore:
 * ```js
 * const path = require("path");
 * const homedir = require("os").homedir();
 * const { KeyPair, keyStores, connect } = require("near-api-js");
 * const { initKeypom, getDrops } = require("keypom-js");
 *
 * // Establish the network we wish to work on
 * const network = "testnet";
 * // Get the location where the credentials are stored for our KeyStore
 * const CREDENTIALS_DIR = ".near-credentials";
 * const credentialsPath = (await path).join(homedir, CREDENTIALS_DIR);
 * (await path).join;
 * let keyStore = new keyStores.UnencryptedFileSystemKeyStore(credentialsPath);
 *
 * // Establish the configuration for the connection
 * let nearConfig = {
 * 		networkId: network,
 * 		keyStore,
 * 		nodeUrl: `https://rpc.${network}.near.org`,
 * 		walletUrl: `https://wallet.${network}.near.org`,
 * 		helperUrl: `https://helper.${network}.near.org`,
 * 		explorerUrl: `https://explorer.${network}.near.org`,
 * };
 * // Connect to the NEAR blockchain and get the connection instance
 * let near = await connect(nearConfig);
 *
 * // Initialize the SDK for the given network and NEAR connection
 * await initKeypom({
 *		near,
 *		network
 * });
 *
 * // Get the drops for the given owner
 * const dropsForOwner = await getDrops({accountId: "benjiman.testnet"});
 * ```
 *
 * @example
 * Creating an entirely new NEAR connection instance by using initKeypom and passing in a funder account:
 * ```js
 * const { initKeypom, getDrops } = require("keypom-js");
 *
 * // Initialize the SDK for the given network and NEAR connection
 * await initKeypom({
 *		network: "testnet",
 *		funder: {
 *			accountId: "benji_demo.testnet",
 *			secretKey: "ed25519:5yARProkcALbxaSQ66aYZMSBPWL9uPBmkoQGjV3oi2ddQDMh1teMAbz7jqNV9oVyMy7kZNREjYvWPqjcA6LW9Jb1"
 *		}
 * });
 *
 * // Get the drops for the given owner
 * const dropsForOwner = await getDrops({accountId: "benjiman.testnet"});
 * ```
 * @group Keypom SDK Environment
*/
var initKeypom = function (_a) {
    var _near = _a.near, network = _a.network, funder = _a.funder, keypomContractId = _a.keypomContractId;
    return __awaiter(void 0, void 0, void 0, function () {
        var networkConfig;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    (0, checks_1.assert)(network == "testnet" || network == "mainnet", "Network must be either `testnet` or `mainnet`");
                    if (_near) {
                        (0, checks_1.assert)((0, checks_1.isValidNearObject)(_near), "The NEAR object passed in is not valid. Please pass in a valid NEAR object.");
                        near = _near;
                        keyStore = near.config.keyStore;
                    }
                    else {
                        networkConfig = typeof network === 'string' ? networks[network] : network;
                        keyStore = ((_b = process === null || process === void 0 ? void 0 : process.versions) === null || _b === void 0 ? void 0 : _b.node) ? new InMemoryKeyStore() : new BrowserLocalStorageKeyStore();
                        near = new near_api_js_1.Near(__assign(__assign({}, networkConfig), { deps: { keyStore: keyStore } }));
                    }
                    connection = near.connection;
                    networkId = near.config.networkId;
                    if (networkId === 'mainnet') {
                        contractId = receiverId = "".concat(contractBase, ".near");
                    }
                    if (keypomContractId) {
                        (0, checks_1.assert)(exports.officialKeypomContracts[networkId][keypomContractId] === true, "The keypom contract passed in must be an official Keypom contract for the given network.");
                        if (exports.supportedKeypomContracts[networkId][keypomContractId] !== true) {
                            console.warn("The Keypom contract you are using is not the latest version. Most methods will be unavailable. Please use the latest contract: v1-3.keypom.near or v1-3.keypom.testnet");
                        }
                        contractId = receiverId = keypomContractId;
                    }
                    viewAccount = new near_api_js_1.Account(connection, networks[networkId].viewAccountId);
                    viewCall = viewAccount.viewFunction2 = function (_a) {
                        var contractId = _a.contractId, methodName = _a.methodName, args = _a.args;
                        return viewAccount.viewFunction(contractId, methodName, args);
                    };
                    contractAccount = new near_api_js_1.Account(connection, contractId);
                    if (!funder) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, exports.updateFunder)({ funder: funder })];
                case 1:
                    _c.sent();
                    _c.label = 2;
                case 2: return [2 /*return*/, null];
            }
        });
    });
};
exports.initKeypom = initKeypom;
/**
 * Once the SDK is initialized, this function allows the current funder account to be updated. Having a funder is only necessary if you wish to sign transactions on the Keypom Protocol.
 *
 * @param {Funder} funder The account that will sign transactions to create drops and interact with the Keypom contract. This account will be added to the KeyStore if provided.
 * If rootEntropy is provided for the funder, all access keys will be derived deterministically based off this string.
 * @returns {Promise<Account>} The funder's account object is returned.
 *
 * @example
 * After initializing the SDK, the funder is updated.
 * ```js
 * const path = require("path");
 * const homedir = require("os").homedir();
 * const { KeyPair, keyStores, connect } = require("near-api-js");
 * const { initKeypom, updateFunder, getDrops } = require("keypom-js");
 *
 *	// Initialize the SDK for the given network and NEAR connection
 *	await initKeypom({
 *		network: "testnet",
 *	});
 *
 *	// Update the current funder account
 *	await updateFunder({
 *		funder: {
 *			accountId: "benji_demo.testnet",
 *			secretKey: "ed25519:5yARProkcALbxaSQ66aYZMSBPWL9uPBmkoQGjV3oi2ddQDMh1teMAbz7jqNV9oVyMy7kZNREjYvWPqjcA6LW9Jb1"
 *		}
 *	})
 *
 *	// Get the drops for the given owner
 *	const dropsForOwner = await getDrops({accountId: "benjiman.testnet"});
 *	console.log('dropsForOwner: ', dropsForOwner)
 *
 *	return;
 * ```
 * @group Keypom SDK Environment
*/
var updateFunder = function (_a) {
    var funder = _a.funder;
    return __awaiter(void 0, void 0, void 0, function () {
        var accountId, secretKey, seedPhrase;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    (0, checks_1.assert)(near !== undefined, "You must initialize the SDK via `initKeypom` before updating the funder account.");
                    (0, checks_1.assert)((0, checks_1.isValidFunderObject)(funder), "The funder object passed in is not valid. Please pass in a valid funder object.");
                    (0, checks_1.assert)(funder.secretKey || funder.seedPhrase, "The funder object passed in must have either a secretKey or seedphrase");
                    accountId = funder.accountId, secretKey = funder.secretKey, seedPhrase = funder.seedPhrase;
                    if (seedPhrase) {
                        secretKey = (0, near_seed_phrase_1.parseSeedPhrase)(seedPhrase).secretKey;
                    }
                    funder.fundingKeyPair = KeyPair.fromString(secretKey);
                    return [4 /*yield*/, keyStore.setKey(networkId, accountId, funder.fundingKeyPair)];
                case 1:
                    _b.sent();
                    fundingAccountDetails = funder;
                    fundingAccount = new near_api_js_1.Account(connection, accountId);
                    return [2 /*return*/, null];
            }
        });
    });
};
exports.updateFunder = updateFunder;
/**
 * This allows the desired Keypom contract ID to be set. By default, the most up-to-date Keypom contract for the given network is set during initKeypom.
 *
 * @param {string} keypomContractId The account ID that should be used for the Keypom contract.
 *
 * @example
 * After initializing the SDK, the Keypom contract ID is updated.
 * ```js
 * const path = require("path");
 * const homedir = require("os").homedir();
 * const { KeyPair, keyStores, connect } = require("near-api-js");
 * const { initKeypom, updateKeypomContractId, getDrops } = require("keypom-js");
 *
 *	// Initialize the SDK for the given network and NEAR connection
 *	await initKeypom({
 *		network: "testnet",
 *	});
 *
 *	// Update the current Keypom contract ID
 *	await updateKeypomContractId({
 *		keypomContractId: "v1.keypom.testnet"
 *	})
 *
 *	//Get the drops for the given owner
 *	const dropsForOwner = await getDrops({accountId: "benjiman.testnet"});
 *	console.log('dropsForOwner: ', dropsForOwner)
 *
 *	return;
 * ```
 * @group Keypom SDK Environment
*/
var updateKeypomContractId = function (_a) {
    var keypomContractId = _a.keypomContractId;
    return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_b) {
            (0, checks_1.assert)(near !== undefined, "You must initialize the SDK via `initKeypom` before updating the Keypom contract ID.");
            (0, checks_1.assert)(exports.officialKeypomContracts[networkId][keypomContractId] === true, "The keypom contract passed in must be an official Keypom contract for the given network.");
            if (exports.supportedKeypomContracts[networkId][keypomContractId] !== true) {
                console.warn("The Keypom contract you are using is not the latest version. Most methods will be unavailable. Please use the latest contract: v1-3.keypom.near or v1-3.keypom.testnet");
            }
            contractId = receiverId = keypomContractId;
            contractAccount = new near_api_js_1.Account(connection, contractId);
            return [2 /*return*/, null];
        });
    });
};
exports.updateKeypomContractId = updateKeypomContractId;
