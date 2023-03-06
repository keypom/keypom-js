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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getContractSourceMetadata = exports.canUserAddKeys = exports.getCurMethodData = exports.getUserBalance = exports.getNftTokenIDsForDrop = exports.getNftSupplyForDrop = exports.getDrops = exports.getDropSupplyForOwner = exports.getKeysForDrop = exports.getKeySupplyForDrop = exports.getDropInformation = exports.getKeyInformationBatch = exports.getKeyInformation = exports.getKeys = exports.getKeyTotalSupply = exports.getKeyBalance = void 0;
var checks_1 = require("./checks");
var drops_1 = require("./drops");
var keypom_1 = require("./keypom");
var keypom_utils_1 = require("./keypom-utils");
/**
 * Returns the balance associated a with given public key. If only the secret key is known, this can be passed in instead. This is used by the NEAR wallet to display the amount of the linkdrop
 *
 * @param {string=} publicKey The public key that contains a balance
 * @param {string=} secretKey The secret key corresponding to the public key
 *
 * @returns {Promise<string>} The amount of yoctoNEAR that is contained within the key
 *
 * @example
 * Create a 1 $NEAR linkdrop and query for its balance:
 * ```js
 * // Initialize the SDK on testnet.
 * await initKeypom({
 *     network: "testnet",
 *     funder: {
 *         accountId: "benji_demo.testnet",
 *         secretKey: "ed25519:5yARProkcALbxaSQ66aYZMSBPWL9uPBmkoQGjV3oi2ddQDMh1teMAbz7jqNV9oVyMy7kZNREjYvWPqjcA6LW9Jb1"
 *     }
 * });
 *
 * // Create a drop with 1 key automatically created. That key will be completely random since there is no entropy.
 * const {keys} = await createDrop({
 *     numKeys: 1,
 *     depositPerUseNEAR: 1
 * });
 *
 * // Query for the amount of yoctoNEAR contained within the key
 * const keyBalance = await getKeyBalance({
 *     publicKey: keys.publicKeys[0]
 * })
 *
 * console.log('keyBalance: ', keyBalance)
 * ```
 * @group View Functions
*/
var getKeyBalance = function (_a) {
    var publicKey = _a.publicKey, secretKey = _a.secretKey;
    return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    // Assert that either a secretKey or public key is passed in
                    (0, checks_1.assert)(secretKey || publicKey, 'Must pass in either a publicKey or a secretKey');
                    if (!secretKey) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, keypom_utils_1.getPubFromSecret)(secretKey)];
                case 1:
                    publicKey = _b.sent();
                    _b.label = 2;
                case 2: return [2 /*return*/, (0, keypom_utils_1.keypomView)({
                        methodName: 'get_key_balance',
                        args: {
                            key: publicKey,
                        },
                    })];
            }
        });
    });
};
exports.getKeyBalance = getKeyBalance;
/**
 * Query for the total supply of keys currently on the Keypom contract
 *
 * @returns {Promise<number>} The amount of keys.
 *
 * @example
 * Query for the key supply on the `v1.keypom.testnet` contract:
 * ```js
 * // Initialize the SDK on testnet. No funder is passed in since we're only doing view calls
 * await initKeypom({
 *     network: "testnet",
 *     keypomContractId: "v1.keypom.testnet"
 * });
 *
 * // Query for the number of keys on the contract
 * const numKeys = await getKeyTotalSupply();
 *
 * console.log('numKeys: ', numKeys)
 * ```
 * @group View Functions
*/
var getKeyTotalSupply = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, (0, keypom_utils_1.keypomView)({
                methodName: 'get_key_total_supply',
                args: {}
            })];
    });
}); };
exports.getKeyTotalSupply = getKeyTotalSupply;
/**
 * Paginate through all active keys on the contract and return a vector of key info.
 *
 * @param {string= | number=} __namedParameters.start (OPTIONAL) Where to start paginating through keys.
 * @param {number=} __namedParameters.limit (OPTIONAL) How many keys to paginate through.
 *
 * @returns {Promise<Array<KeyInfo>>} Vector of KeyInfo.
 *
 * @example
 * Query for first 50 keys on the `v1.keypom.testnet` contract:
 * ```js
 * // Initialize the SDK on testnet. No funder is passed in since we're only doing view calls
 * await initKeypom({
 *     network: "testnet",
 *     keypomContractId: "v1.keypom.testnet"
 * });
 *
 * // Query for the first 50 keys on the contract
 * const keyInfo = await getKeys({
 *   start: 0,
 *   limit: 50
 * });
 *
 * console.log('keyInfo: ', keyInfo)
 * ```
 * @group View Functions
*/
var getKeys = function (_a) {
    var start = _a.start, limit = _a.limit;
    return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_b) {
            return [2 /*return*/, (0, keypom_utils_1.keypomView)({
                    methodName: 'get_keys',
                    args: {
                        from_index: start === null || start === void 0 ? void 0 : start.toString(),
                        limit: limit
                    }
                })];
        });
    });
};
exports.getKeys = getKeys;
/**
 * Returns the KeyInfo corresponding to a specific public key
 *
 * @param {string=} publicKey the public key to get information for.
 * @param {string=} secretKey The secret key corresponding to the public key
 *
 * @returns {Promise<KeyInfo>} Key information struct for that specific key.
 *
 * @example
 * Create a drop and query for the key information:
 * ```js
 * // Initialize the SDK on testnet.
 * await initKeypom({
 *     network: "testnet",
 *     funder: {
 *         accountId: "benji_demo.testnet",
 *         secretKey: "ed25519:5yARProkcALbxaSQ66aYZMSBPWL9uPBmkoQGjV3oi2ddQDMh1teMAbz7jqNV9oVyMy7kZNREjYvWPqjcA6LW9Jb1"
 *     }
 * });
 *
 * // Create a drop with 1 key automatically created. That key will be completely random since there is no entropy.
 * const {keys} = await createDrop({
 *     numKeys: 1,
 *     depositPerUseNEAR: 1
 * });
 *
 * // Query for the key information for the key that was created
 * const keyInfo = await getKeyInformation({
 *     publicKey: keys.publicKeys[0]
 * })
 *
 * console.log('keyInfo: ', keyInfo)
 * ```
 * @group View Functions
*/
var getKeyInformation = function (_a) {
    var publicKey = _a.publicKey, secretKey = _a.secretKey;
    return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    // Assert that either a secretKey or public key is passed in
                    (0, checks_1.assert)(secretKey || publicKey, 'Must pass in either a publicKey or a secretKey');
                    if (!secretKey) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, keypom_utils_1.getPubFromSecret)(secretKey)];
                case 1:
                    publicKey = _b.sent();
                    _b.label = 2;
                case 2: return [2 /*return*/, (0, keypom_utils_1.keypomView)({
                        methodName: 'get_key_information',
                        args: {
                            key: publicKey
                        }
                    })];
            }
        });
    });
};
exports.getKeyInformation = getKeyInformation;
/**
 * Returns a vector of KeyInfo corresponding to a set of public keys passed in.
 *
 * @param {string[]=} publicKeys Array of public keys to get information about
 * @param {string[]=} secretKeys Array of the secret keys corresponding to the public keys
 *
 * @returns {Promise<Array<KeyInfo>>} Array of Key information structs for the keys passed in
 *
 * @example
 * Create a drop and query for the key information for all keys created:
 * ```js
 * // Initialize the SDK on testnet.
 * await initKeypom({
 *     network: "testnet",
 *     funder: {
 *         accountId: "benji_demo.testnet",
 *         secretKey: "ed25519:5yARProkcALbxaSQ66aYZMSBPWL9uPBmkoQGjV3oi2ddQDMh1teMAbz7jqNV9oVyMy7kZNREjYvWPqjcA6LW9Jb1"
 *     }
 * });
 *
 * // Create a drop with 5 keys automatically created. That key will be completely random since there is no entropy.
 * const {keys} = await createDrop({
 *     numKeys: 5,
 *     depositPerUseNEAR: 1
 * });
 *
 * // Query for the key information for the key that was created
 * const keyInfos = await getKeyInformationBatch({
 *     publicKeys: keys.publicKeys
 * })
 *
 * console.log('keyInfos: ', keyInfos)
 * ```
 * @group View Functions
*/
var getKeyInformationBatch = function (_a) {
    var publicKeys = _a.publicKeys, secretKeys = _a.secretKeys;
    return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    // Assert that either secretKeys or public keys are passed in
                    (0, checks_1.assert)(secretKeys || publicKeys, 'Must pass in either publicKeys or secretKeys');
                    if (!secretKeys) return [3 /*break*/, 2];
                    return [4 /*yield*/, Promise.all(secretKeys.map(function (secretKey) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, (0, keypom_utils_1.getPubFromSecret)(secretKey)];
                                case 1: return [2 /*return*/, _a.sent()];
                            }
                        }); }); }))];
                case 1:
                    // Map the secret keys into public keys by calling getPubFromSecret
                    publicKeys = _b.sent();
                    _b.label = 2;
                case 2: return [2 /*return*/, (0, keypom_utils_1.keypomView)({
                        methodName: 'get_key_information_batch',
                        args: {
                            keys: publicKeys
                        }
                    })];
            }
        });
    });
};
exports.getKeyInformationBatch = getKeyInformationBatch;
/**
 * Get information about a specific drop by passing in either a drop ID, public key, or secret key.
 *
 * @param {string=} dropId (OPTIONAL) The drop ID for the specific drop that you want to get information about.
 * @param {string=} publicKey (OPTIONAL) A valid public key that is part of a drop.
 * @param {string=} secretKey (OPTIONAL) The secret key corresponding to a valid public key that is part of a drop.
 * @param {boolean=} withKeys (OPTIONAL) Whether or not to include key information for the first 50 keys in each drop.
 *
 * @returns {Drop} Drop information which may or may not have a keys field of type `KeyInfo` depending on if withKeys is specified as true.
 *
 * @example
 * Create a simple drop and retrieve information about it:
 * ```js
 * // Initialize the SDK on testnet.
 * await initKeypom({
 *     network: "testnet",
 *     funder: {
 *         accountId: "benji_demo.testnet",
 *         secretKey: "ed25519:5yARProkcALbxaSQ66aYZMSBPWL9uPBmkoQGjV3oi2ddQDMh1teMAbz7jqNV9oVyMy7kZNREjYvWPqjcA6LW9Jb1"
 *     }
 * });
 *
 * // Create a drop with 1 key automatically created. That key will be completely random since there is no entropy.
 * const {dropId} = await createDrop({
 *     numKeys: 1,
 *     depositPerUseNEAR: 1
 * });
 *
 * // Query for the drop information and also return the key information as well
 * const dropInfo = await getDropInformation({
 *     dropId,
 *     withKeys: true
 * })
 *
 * console.log('dropInfo: ', dropInfo)
 * ```
 *
 * @example
 * Create a simple drop and get the drop information based on a public key and then the secret key:
 * ```js
 * // Initialize the SDK on testnet.
 * await initKeypom({
 *     network: "testnet",
 *     funder: {
 *         accountId: "benji_demo.testnet",
 *         secretKey: "ed25519:5yARProkcALbxaSQ66aYZMSBPWL9uPBmkoQGjV3oi2ddQDMh1teMAbz7jqNV9oVyMy7kZNREjYvWPqjcA6LW9Jb1"
 *     }
 * });
 *
 * // Create a drop with 1 key automatically created. That key will be completely random since there is no entropy.
 * const {keys} = await createDrop({
 *     numKeys: 1,
 *     depositPerUseNEAR: 1
 * });
 *
 * // Query for the drop information and also return the key information as well
 * let dropInfo = await getDropInformation({
 * 	   publicKey: keys.publicKeys[0],
 *     withKeys: true
 * })
 *
 * console.log('dropInfo via public key: ', dropInfo)
 *
 * // Query for the drop information and also return the key information as well
 * dropInfo = await getDropInformation({
 * 	   secretKey: keys.secretKeys[0],
 *     withKeys: true
 * })
 *
 * console.log('dropInfo via secret key: ', dropInfo)
 * ```
 * @group View Functions
*/
var getDropInformation = function (_a) {
    var dropId = _a.dropId, secretKey = _a.secretKey, publicKey = _a.publicKey, _b = _a.withKeys, withKeys = _b === void 0 ? false : _b;
    return __awaiter(void 0, void 0, void 0, function () {
        var _c, contractId, viewCall, dropInfo, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _c = (0, keypom_1.getEnv)(), contractId = _c.contractId, viewCall = _c.viewCall;
                    // Assert that either a dropId or a secretKey is passed in
                    (0, checks_1.assert)(dropId || secretKey || publicKey, 'Must pass in either a dropId, publicKey or a secretKey to getDropInformation');
                    if (!secretKey) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, keypom_utils_1.getPubFromSecret)(secretKey)];
                case 1:
                    publicKey = _e.sent();
                    _e.label = 2;
                case 2: return [4 /*yield*/, viewCall({
                        contractId: contractId,
                        methodName: 'get_drop_information',
                        args: {
                            drop_id: dropId,
                            key: publicKey,
                        },
                    })];
                case 3:
                    dropInfo = _e.sent();
                    if (!withKeys) return [3 /*break*/, 5];
                    _d = dropInfo;
                    return [4 /*yield*/, (0, keypom_utils_1.keypomView)({
                            methodName: 'get_keys_for_drop',
                            args: {
                                drop_id: dropInfo.drop_id,
                                from_index: '0',
                                limit: drops_1.KEY_LIMIT
                            }
                        })];
                case 4:
                    _d.keys = _e.sent();
                    _e.label = 5;
                case 5: return [2 /*return*/, dropInfo];
            }
        });
    });
};
exports.getDropInformation = getDropInformation;
/**
 * Returns the total supply of active keys for a given drop
 *
 * @param {string} dropId The drop ID for the specific drop that you want to get information about.
 *
 * @returns {Promise<number>} Number of active keys
 *
 * @example
 * Create a drop with 5 keys and query for the key supply:
 * ```js
 * // Initialize the SDK on testnet.
 * await initKeypom({
 *     network: "testnet",
 *     funder: {
 *         accountId: "benji_demo.testnet",
 *         secretKey: "ed25519:5yARProkcALbxaSQ66aYZMSBPWL9uPBmkoQGjV3oi2ddQDMh1teMAbz7jqNV9oVyMy7kZNREjYvWPqjcA6LW9Jb1"
 *     }
 * });
 *
 * // Create a drop with 5 keys automatically created. That key will be completely random since there is no entropy.
 * const {keys, dropId} = await createDrop({
 *     numKeys: 5,
 *     depositPerUseNEAR: 1
 * });
 *
 * // Query for the key supply for the drop that was created
 * const keySupply = await getKeySupplyForDrop({
 *     dropId
 * })
 *
 * console.log('keySupply: ', keySupply)
 * ```
 * @group View Functions
*/
var getKeySupplyForDrop = function (_a) {
    var dropId = _a.dropId;
    return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_b) {
            return [2 /*return*/, (0, keypom_utils_1.keypomView)({
                    methodName: 'get_key_supply_for_drop',
                    args: {
                        drop_id: dropId
                    }
                })];
        });
    });
};
exports.getKeySupplyForDrop = getKeySupplyForDrop;
/**
 * Paginate through all keys in a specific drop, returning an array of KeyInfo.
 *
 * @param {string} dropId The drop ID for the specific drop that you want to get information about.
 * @param {string= | number=} start (OPTIONAL) Where to start paginating through keys.
 * @param {number=} limit (OPTIONAL) How many keys to paginate through.
 *
 * @returns {Promise<Array<KeyInfo>>} Vector of KeyInfo objects returned from pagination
 *
 * @example
 * Create a drop with 5 keys and return all the key info objects:
 * ```js
 * // Initialize the SDK on testnet.
 * await initKeypom({
 *     network: "testnet",
 *     funder: {
 *         accountId: "benji_demo.testnet",
 *         secretKey: "ed25519:5yARProkcALbxaSQ66aYZMSBPWL9uPBmkoQGjV3oi2ddQDMh1teMAbz7jqNV9oVyMy7kZNREjYvWPqjcA6LW9Jb1"
 *     }
 * });
 *
 * // Create a drop with 5 keys automatically created. That key will be completely random since there is no entropy.
 * const {dropId} = await createDrop({
 *     numKeys: 5,
 *     depositPerUseNEAR: 1
 * });
 *
 * // Query for the key supply for the drop that was created
 * const keyInfos = await getKeysForDrop({
 *     dropId
 * })
 *
 * console.log('keyInfos: ', keyInfos)
 * ```
 * @group View Functions
*/
var getKeysForDrop = function (_a) {
    var dropId = _a.dropId, start = _a.start, limit = _a.limit;
    return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_b) {
            return [2 /*return*/, (0, keypom_utils_1.keypomView)({
                    methodName: 'get_keys_for_drop',
                    args: {
                        drop_id: dropId,
                        from_index: start === null || start === void 0 ? void 0 : start.toString(),
                        limit: limit
                    }
                })];
        });
    });
};
exports.getKeysForDrop = getKeysForDrop;
/**
 * Returns the total supply of active drops for a given account ID
 *
 * @param {string} accountId The account that the drops belong to.
 *
 * @returns {Promise<number>} Amount of drops
 *
 * @example
 * Create a drop and check how many the owner has:
 * ```js
 * // Initialize the SDK on testnet.
 * await initKeypom({
 *     network: "testnet",
 *     funder: {
 *         accountId: "benji_demo.testnet",
 *         secretKey: "ed25519:5yARProkcALbxaSQ66aYZMSBPWL9uPBmkoQGjV3oi2ddQDMh1teMAbz7jqNV9oVyMy7kZNREjYvWPqjcA6LW9Jb1"
 *     }
 * });
 *
 * // Create a drop with no keys
 * await createDrop({
 *     depositPerUseNEAR: 1
 * });
 *
 * // Query for the amount of drops owned by the account
 * const dropSupply = await getDropSupplyForOwner({
 *     accountId: "benji_demo.testnet"
 * })
 *
 * console.log('dropSupply: ', dropSupply)
 * ```
 * @group View Functions
*/
var getDropSupplyForOwner = function (_a) {
    var accountId = _a.accountId;
    return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_b) {
            return [2 /*return*/, (0, keypom_utils_1.keypomView)({
                    methodName: 'get_drop_supply_for_owner',
                    args: {
                        account_id: accountId
                    }
                })];
        });
    });
};
exports.getDropSupplyForOwner = getDropSupplyForOwner;
/**
 * Paginate through drops owned by an account. If specified, information for the first 50 keys in each drop can be returned as well.
 *
 * @param {string} accountId The funding account that the drops belong to.
 * @param {string= | number=} start (OPTIONAL) Where to start paginating through drops.
 * @param {number=} limit (OPTIONAL) How many drops to paginate through.
 * @param {boolean=} withKeys (OPTIONAL) Whether or not to include key information for the first 50 keys in each drop.
 *
 * @example
 * Get drop information for the last 5 drops owned by a given account:
 * ```js
 * // Initialize the SDK on testnet. No funder is passed in since we're only doing view calls.
 * await initKeypom({
 * 	network: "testnet",
 * });
 *
 * // Get the number of drops the account has.
 * const numDrops = await getDropSupply({
 * 	accountId: "benjiman.testnet"
 * });
 *
 * // Query for drop information for the last 5 drops and their respective keys
 * const dropsAndKeys = await getDrops({
 * 	accountId: "benjiman.testnet",
 * 	start: numDrops - 5,
 * 	withKeys: true
 * })
 *
 * console.log('dropsAndKeys: ', dropsAndKeys)
 * ```
 * @group View Functions
*/
var getDrops = function (_a) {
    var accountId = _a.accountId, start = _a.start, limit = _a.limit, _b = _a.withKeys, withKeys = _b === void 0 ? false : _b;
    return __awaiter(void 0, void 0, void 0, function () {
        var drops;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, (0, keypom_utils_1.keypomView)({
                        methodName: 'get_drops_for_owner',
                        args: {
                            account_id: accountId,
                            from_index: start ? start.toString() : undefined,
                            limit: limit ? limit : undefined,
                        },
                    })];
                case 1:
                    drops = _c.sent();
                    if (!withKeys) return [3 /*break*/, 3];
                    (0, checks_1.assert)(drops.length <= 20, "Too many RPC requests in parallel. Use 'limit' arg 20 or less.");
                    return [4 /*yield*/, Promise.all(drops.map(function (drop, i) { return __awaiter(void 0, void 0, void 0, function () {
                            var drop_id, _a;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        drop_id = drop.drop_id;
                                        _a = drop;
                                        return [4 /*yield*/, (0, keypom_utils_1.keypomView)({
                                                methodName: 'get_keys_for_drop',
                                                args: {
                                                    drop_id: drop_id,
                                                    from_index: '0',
                                                    limit: drops_1.KEY_LIMIT
                                                }
                                            })];
                                    case 1:
                                        _a.keys = _b.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); }))];
                case 2:
                    _c.sent();
                    _c.label = 3;
                case 3: return [2 /*return*/, drops];
            }
        });
    });
};
exports.getDrops = getDrops;
/**
 * Return the total supply of token IDs for a given NFT drop.
 *
 * @param {string} dropId The drop ID that the tokens belong to.
 *
 * @returns {Promise<number>} The amount of token IDs on the drop
 *
 * @example
 * Query for the supply of tokens on a specific drop:
 * ```js
 * // Initialize the SDK on testnet. No funder is passed in since we're only doing view calls.
 * await initKeypom({
 * network: "testnet",
 * });
 *
 * // Query for the amount of token IDs on the drop
 * const tokenSupply = await getNftSupplyForDrop({
 *   dropId: "1669840629120"
 * })
 *
 * console.log('tokenSupply: ', tokenSupply)
 * ```
 * @group View Functions
*/
var getNftSupplyForDrop = function (_a) {
    var dropId = _a.dropId;
    return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_b) {
            return [2 /*return*/, (0, keypom_utils_1.keypomView)({
                    methodName: 'get_nft_supply_for_drop',
                    args: {
                        drop_id: dropId
                    }
                })];
        });
    });
};
exports.getNftSupplyForDrop = getNftSupplyForDrop;
/**
 * Paginate through token IDs in an NFT drop to return a vector of token IDs.
 *
 * @param {string} dropId The drop ID that the tokens belong to.
 * @param {string= | number=} start (OPTIONAL) Where to start paginating from.
 * @param {number=} limit (OPTIONAL) How many token IDs to paginate through.
 *
 * @returns {Promise<Array<string>>} Vector of token IDs
 *
 * @example
 * Query for a list of token IDs on a specific drop:
 * ```js
 * // Initialize the SDK on testnet. No funder is passed in since we're only doing view calls.
 * await initKeypom({
 * network: "testnet",
 * });
 *
 * // Query for a set of token IDs on the drop
 * const tokenList = await getNftTokenIDsForDrop({
 *   dropId: "1669840629120"
 * })
 *
 * console.log('tokenList: ', tokenList)
 * ```
 * @group View Functions
*/
var getNftTokenIDsForDrop = function (_a) {
    var dropId = _a.dropId, start = _a.start, limit = _a.limit;
    return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_b) {
            return [2 /*return*/, (0, keypom_utils_1.keypomView)({
                    methodName: 'get_nft_token_ids_for_drop',
                    args: {
                        drop_id: dropId,
                        from_index: start,
                        limit: limit
                    }
                })];
        });
    });
};
exports.getNftTokenIDsForDrop = getNftTokenIDsForDrop;
/**
 * Query for a user's current balance on the Keypom contract
 *
 * @param {string} accountId The account ID of the user to retrieve the balance for.
 *
 * @returns {string} The user's current balance
 *
 * @example
 * Query for a user's current balance on the Keypom contract:
 * ```js
 * // Initialize the SDK on testnet. No funder is passed in since we're only doing view calls.
 * await initKeypom({
 * network: "testnet",
 * });
 *
 * // Query for the drop information for a specific drop
 * const userBal = await getUserBalance({
 * accountId: "benjiman.testnet",
 * })
 *
 * console.log('userBal: ', userBal)
 * ```
 * @group View Functions
*/
var getUserBalance = function (_a) {
    var accountId = _a.accountId;
    return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_b) {
            return [2 /*return*/, (0, keypom_utils_1.keypomView)({
                    methodName: 'get_user_balance',
                    args: {
                        account_id: accountId
                    }
                })];
        });
    });
};
exports.getUserBalance = getUserBalance;
/**
 * Query for the current method data for a given key. This pertains to FC drops and the current method data is either null or an array of methods that will be invoked when the key is claimed next.
 *
 * @param {string=} secretKey (OPTIONAL) The secret key of the key to retrieve the method data for. If no secret key is passed in, the public key must be passed in.
 * @param {string=} publicKey (OPTIONAL) The public key of the key to retrieve the method data for. If no public key is passed in, the secret key must be passed in.
 * @param {number=} keyUse (OPTIONAL) Pass in a specific key use (*NOT* zero indexed) to retrieve the method data for. If no key use is passed in, the method data for the current key use will be returned.
 *
 * @returns {Promise<Maybe<Array<ProtocolReturnedMethod>>>} The current method data for the key
 *
 * @example
 * ```js
 * const fcData = {
 * 	methods: [
 * 		null,
 * 		[
 * 			{
 * 				methodName: "nft_token",
 * 				receiverId: "nft.examples.testnet",
 * 				args: JSON.stringify({
 * 					token_id: "1"
 * 				}),
 * 				attachedDeposit: "0"
 * 			},
 * 			{
 * 				methodName: "nft_token",
 * 				receiverId: "nft.examples.testnet",
 * 				args: JSON.stringify({
 * 					token_id: "2"
 * 				}),
 * 				attachedDeposit: "0"
 * 			}
 * 		],
 * 		null
 * 	]
 * }
 *
 * const {keys: {publicKeys, secretKeys}} = await createDrop({
 * 	numKeys: 1,
 * 	depositPerUseNEAR: 0,
 * 	fcData,
 * 	config: {
 * 		usesPerKey: 3
 * 	}
 * });
 * const secretKey = secretKeys[0];
 *
 * let curMethodData = await getCurMethodData({secretKey});
 * console.log('curMethodData (first): ', curMethodData)
 * t.is(curMethodData, null);
 *
 * 	curMethodData = await getCurMethodData({secretKey, keyUse: 1});
 *	t.is(curMethodData, null);
 *	curMethodData = await getCurMethodData({secretKey, keyUse: 2});
 *	t.true(curMethodData != null);
 *	curMethodData = await getCurMethodData({secretKey, keyUse: 3});
 *	t.is(curMethodData, null);
 *
 * await claim({secretKey, accountId: 'foobar'})
 * curMethodData = await getCurMethodData({secretKey});
 * t.true(curMethodData != null);
 *
 * await claim({secretKey, accountId: 'foobar'})
 * curMethodData = await getCurMethodData({secretKey});
 * console.log('curMethodData (third): ', curMethodData)
 * t.is(curMethodData, null);
 * ```
 * @group View Functions
 */
var getCurMethodData = function (_a) {
    var secretKey = _a.secretKey, publicKey = _a.publicKey, keyUse = _a.keyUse;
    return __awaiter(void 0, void 0, void 0, function () {
        var keyInfo, dropInfo, methodDataArray, startingIdx;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, (0, exports.getKeyInformation)({ publicKey: publicKey, secretKey: secretKey })];
                case 1:
                    keyInfo = _c.sent();
                    return [4 /*yield*/, (0, exports.getDropInformation)({ publicKey: publicKey, secretKey: secretKey })];
                case 2:
                    dropInfo = _c.sent();
                    (0, checks_1.assert)(dropInfo.fc, 'No FC drop found');
                    methodDataArray = dropInfo.fc.methods;
                    startingIdx = methodDataArray.length > 1 ? (((_b = dropInfo.config) === null || _b === void 0 ? void 0 : _b.uses_per_key) || 1) - keyInfo.remaining_uses : 0;
                    if (keyUse) {
                        (0, checks_1.assert)(keyUse > 0 && keyUse <= methodDataArray.length, 'Invalid key use passed in - out of bounds');
                        startingIdx = keyUse - 1;
                    }
                    return [2 /*return*/, methodDataArray[startingIdx]];
            }
        });
    });
};
exports.getCurMethodData = getCurMethodData;
/**
 * Check if a given user can add keys to a drop. The only case where a user *other than the funder* could add keys is if the drop has a public sale running.
 *
 * @param {string} dropId The drop ID to check if the user can add keys to
 * @param {string} accountId The account ID of the user to check if they can add keys to the drop
 *
 * @returns {Promise<boolean>} Whether or not the user can add keys to the drop
 *
 * @example
 * ```js
 * await createDrop({
 * 	numKeys: 0,
 * 	depositPerUseNEAR: 0,
 * 	config: {
 * 		sale: {
 * 			maxNumKeys: 2,
 * 			pricePerKeyNEAR: 1
 * 		}
 * 	}
 * });
 *
 * const canAddKeys = await canUserAddKeys({accountId: "foobar.testnet"});
 * t.is(canAddKeys, true);
 * ```
 *
 * @group View Functions
*/
var canUserAddKeys = function (_a) {
    var dropId = _a.dropId, accountId = _a.accountId;
    return __awaiter(void 0, void 0, void 0, function () {
        var canAddKeys;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    (0, checks_1.assert)(dropId && accountId, 'Must pass in a drop ID and account ID');
                    return [4 /*yield*/, (0, keypom_utils_1.keypomView)({
                            methodName: 'can_user_add_keys',
                            args: {
                                drop_id: dropId,
                                account_id: accountId
                            }
                        })];
                case 1:
                    canAddKeys = _b.sent();
                    return [2 /*return*/, canAddKeys];
            }
        });
    });
};
exports.canUserAddKeys = canUserAddKeys;
/**
 * Returns the source metadata for the Keypom contract that the SDK has been initialized on. This includes valuable information
 * such as which specific version the contract is on and link to exactly which GitHub commit is deployed.
 *
 * @returns {ContractSourceMetadata} The contract's source metadata
 *
 * @example
 * Query for the current Keypom contract's source metadata:
 * ```js
 * // Initialize the SDK on testnet. No funder is passed in since we're only doing view calls.
 * await initKeypom({
 * network: "testnet",
 * });
 *
 * // Query for the Keypom contract's source metadata
 * const metadata = await getContractSourceMetadata();
 *
 * console.log('metadata: ', metadata)
 * ```
 * @group View Functions
*/
var getContractSourceMetadata = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, (0, keypom_utils_1.keypomView)({
                methodName: 'contract_source_metadata',
                args: {}
            })];
    });
}); };
exports.getContractSourceMetadata = getContractSourceMetadata;
