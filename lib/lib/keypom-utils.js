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
exports.toCamel = exports.snakeToCamel = exports.generatePerUsePasswords = exports.estimateRequiredDeposit = exports.getStorageBase = exports.transformTransactions = exports.parseFTAmount = exports.nftTransferCall = exports.ftTransferCall = exports.execute = exports.keypomView = exports.generateKeys = exports.hashPassword = exports.formatLinkdropUrl = exports.createNFTSeries = exports.getFTMetadata = exports.getNFTMetadata = exports.accountExists = exports.getPubFromSecret = exports.key2str = exports.ATTACHED_GAS_FROM_WALLET = exports.exportedNearAPI = void 0;
var bn_js_1 = __importDefault(require("bn.js"));
var nearAPI = __importStar(require("near-api-js"));
var near_api_js_1 = require("near-api-js");
var near_seed_phrase_1 = require("near-seed-phrase");
var checks_1 = require("./checks");
var keypom_1 = require("./keypom");
var KeyPair = nearAPI.KeyPair, utils = nearAPI.utils, parseNearAmount = nearAPI.utils.format.parseNearAmount;
exports.exportedNearAPI = nearAPI;
var sha256Hash;
if (typeof crypto === 'undefined') {
    var nodeCrypto_1 = require('crypto');
    sha256Hash = function (ab) { return nodeCrypto_1.createHash('sha256').update(ab).digest(); };
}
else {
    sha256Hash = function (ab) { return crypto.subtle.digest('SHA-256', ab); };
}
/// How much Gas each each cross contract call with cost to be converted to a receipt
var GAS_PER_CCC = 5000000000000; // 5 TGas
var RECEIPT_GAS_COST = 2500000000000; // 2.5 TGas
var YOCTO_PER_GAS = 100000000; // 100 million
exports.ATTACHED_GAS_FROM_WALLET = 100000000000000; // 100 TGas
/// How much yoctoNEAR it costs to store 1 access key
var ACCESS_KEY_STORAGE = new bn_js_1.default("1000000000000000000000");
var key2str = function (v) { return typeof v === 'string' ? v : v.pk; };
exports.key2str = key2str;
var hashBuf = function (str, fromHex) {
    if (fromHex === void 0) { fromHex = false; }
    return sha256Hash(Buffer.from(str, fromHex ? 'hex' : 'utf8'));
};
/**
 * Get the public key from a given secret key.
 *
 * @param {string} secretKey - The secret key you wish to get the public key from
 *
 * @returns {Promise<string>} - The public key
 *
 * @example
 * ```js
 * const pubKey = await getPubFromSecret("ed25519:5yARProkcALbxaSQ66aYZMSBPWL9uPBmkoQGjV3oi2ddQDMh1teMAbz7jqNV9oVyMy7kZNREjYvWPqjcA6LW9Jb1");
 * console.log(pubKey);
 * ```
 * @group Utility
 */
var getPubFromSecret = function (secretKey) { return __awaiter(void 0, void 0, void 0, function () {
    var keyPair;
    return __generator(this, function (_a) {
        keyPair = KeyPair.fromString(secretKey);
        return [2 /*return*/, keyPair.getPublicKey().toString()];
    });
}); };
exports.getPubFromSecret = getPubFromSecret;
/**
 * Check whether or not a given account ID exists on the network.
 *
 * @param {string} accountId - The account ID you wish to check
 *
 * @returns {Promise<boolean>} - A boolean indicating whether or not the account exists
 *
 * @example
 * ```js
 * const accountExists = await accountExists("benji.near");
 * console.log(accountExists); // true
 * ```
 * @group Utility
 */
var accountExists = function (accountId) { return __awaiter(void 0, void 0, void 0, function () {
    var connection, account, e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                connection = (0, keypom_1.getEnv)().connection;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                account = new nearAPI.Account(connection, accountId);
                return [4 /*yield*/, account.state()];
            case 2:
                _a.sent();
                return [2 /*return*/, true];
            case 3:
                e_1 = _a.sent();
                if (!/no such file|does not exist/.test(e_1.toString())) {
                    throw e_1;
                }
                return [2 /*return*/, false];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.accountExists = accountExists;
/**
 * Get the NFT Object (metadata, owner, approval IDs etc.) for a given token ID on a given contract.
 *
 * @param {string} contractId - The contract ID of the NFT contract
 * @param {string} tokenId - The token ID of the NFT you wish to get the metadata for
 *
 * @returns {Promise<ProtocolReturnedNonFungibleTokenObject>} - The NFT Object
 *
 * @example
 * ```js
 * const nft = await getNFTMetadata({
 *     contractId: "nft.keypom.testnet",
 *     tokenId: "1"
 * });
 * console.log(nft);
 * ```
 * @group Utility
 */
var getNFTMetadata = function (_a) {
    var contractId = _a.contractId, tokenId = _a.tokenId;
    return __awaiter(void 0, void 0, void 0, function () {
        var _b, near, viewCall, res;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _b = (0, keypom_1.getEnv)(), near = _b.near, viewCall = _b.viewCall;
                    return [4 /*yield*/, viewCall({
                            contractId: contractId,
                            methodName: 'nft_token',
                            args: {
                                token_id: tokenId
                            }
                        })];
                case 1:
                    res = _c.sent();
                    return [2 /*return*/, res];
            }
        });
    });
};
exports.getNFTMetadata = getNFTMetadata;
/**
 * Get the FT Metadata for a given fungible token contract. This is used to display important information such as the icon for the token, decimal format etc.
 *
 * @param {string} contractId - The contract ID of the FT contract
 *
 * @returns {Promise<FungibleTokenMetadata>} - The FT Metadata
 *
 * @example
 * ```js
 * const ft = await getFTMetadata({
 *    contractId: "ft.keypom.testnet"
 * });
 * console.log(ft);
 * ```
 * @group Utility
 */
var getFTMetadata = function (_a) {
    var contractId = _a.contractId;
    return __awaiter(void 0, void 0, void 0, function () {
        var _b, near, viewCall, res;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _b = (0, keypom_1.getEnv)(), near = _b.near, viewCall = _b.viewCall;
                    return [4 /*yield*/, viewCall({
                            contractId: contractId,
                            methodName: 'ft_metadata',
                            args: {}
                        })];
                case 1:
                    res = _c.sent();
                    return [2 /*return*/, res];
            }
        });
    });
};
exports.getFTMetadata = getFTMetadata;
/**
 * Creates a new NFT series on the official Keypom Series contracts. This is for lazy minting NFTs as part of an FC drop.
 *
 * @example
 * Send 3 NFTs using the funder account (not passing in any accounts into the call):
 * ```js
 *	await initKeypom({
 *		// near,
 *		network: 'testnet',
 *		funder: {
 *			accountId,
 *			secretKey,
 *		}
 *	})
 *
 *	const {keys, dropId} = await createDrop({
 *		numKeys: 1,
 *		config: {
 *			usesPerKey: 100
 *		},
 *		metadata: "My Cool Drop Title!",
 *		depositPerUseNEAR: 0.5,
 *		fcData: {
 *			methods: [[
 *				{
 *					receiverId: `nft-v2.keypom.testnet`,
 *					methodName: "nft_mint",
 *					args: "",
 *					dropIdField: "mint_id",
 *					accountIdField: "receiver_id",
 *					attachedDeposit: parseNearAmount("0.1")
 *				}
 *			]]
 *		}
 *	})
 *
 *	const res = await createNFTSeries({
 *		dropId,
 *		metadata: {
 *			title: "Moon NFT!",
 *			description: "A cool NFT for the best dog in the world.",
 *			media: "bafybeibwhlfvlytmttpcofahkukuzh24ckcamklia3vimzd4vkgnydy7nq",
 *			copies: 500
 *		}
 *	});
 *	console.log('res: ', res)
 *
 *	const URLs = formatLinkdropUrl({
 *		baseUrl: "localhost:3000/claim",
 *		secretKeys: keys.secretKeys
 *	})
 *	console.log('URLs: ', URLs)
 * ```
 * @group Utility
*/
var createNFTSeries = function (_a) {
    var account = _a.account, wallet = _a.wallet, dropId = _a.dropId, metadata = _a.metadata, royalty = _a.royalty;
    return __awaiter(void 0, void 0, void 0, function () {
        var _b, getAccount, networkId, actualMetadata, nftSeriesAccount, tx;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _b = (0, keypom_1.getEnv)(), getAccount = _b.getAccount, networkId = _b.networkId;
                    (0, checks_1.assert)((0, checks_1.isValidAccountObj)(account), 'Passed in account is not a valid account object.');
                    return [4 /*yield*/, getAccount({ account: account, wallet: wallet })];
                case 1:
                    account = _c.sent();
                    actualMetadata = {
                        title: metadata.title,
                        description: metadata.description,
                        media: metadata.media,
                        media_hash: metadata.mediaHash,
                        copies: metadata.copies,
                        issued_at: metadata.issuedAt,
                        expires_at: metadata.expiresAt,
                        starts_at: metadata.startsAt,
                        updated_at: metadata.updatedAt,
                        extra: metadata.extra,
                        reference: metadata.reference,
                        reference_hash: metadata.referenceHash,
                    };
                    nftSeriesAccount = networkId == "testnet" ? "nft-v2.keypom.testnet" : "nft-v2.keypom.near";
                    tx = {
                        receiverId: nftSeriesAccount,
                        signerId: account.accountId,
                        actions: [{
                                type: 'FunctionCall',
                                params: {
                                    methodName: 'create_series',
                                    args: {
                                        mint_id: parseInt(dropId),
                                        metadata: actualMetadata,
                                        royalty: royalty
                                    },
                                    gas: '50000000000000',
                                    deposit: parseNearAmount("0.25"),
                                }
                            }]
                    };
                    return [2 /*return*/, (0, exports.execute)({ account: account, transactions: [tx] })];
            }
        });
    });
};
exports.createNFTSeries = createNFTSeries;
/**
 * Constructs a valid linkdrop URL for a given claim page or custom URL. To view the list of supported claim pages, see the exported `supportedLinkdropClaimPages` variable.
 *
 * @param {string | string[]} secretKeys - Either a single secret key or an array of secret keys that should be embedded in the linkdrop URLs.
 * @param {string=} claimPage - A valid reference to the claim page. See the exported `supportedLinkdropClaimPages` variable for a list of supported claim pages. If not provided, a custom base URL must be provided.
 * @param {string=} networkId - The network ID you wish to linkdrop on. If not provided, the current network that the SDK is connected to will be used.
 * @param {string=} contractId - The contract ID where the secret key belongs to. If not provided, the current contract ID that the SDK is connected to will be used.
 * @param {string=} customURL - A custom URL containing a `SECRET_KEY` string and `CONTRACT_ID` string for where to insert the secret key and contract ID. For example, a base URL of `foo.com/CONTRACT_ID#SECRET_KEY` with a contract `v2.keypom.near` and secret key `5CBLiJK21EQoB...` would result in `foo.com/v2.keypom.near#5CBLiJK21EQoB...`.
 *
 * @returns {string[]} - An array of the linkdrop URLs
 *
 * @example
 * Use the keypom claim page:
 * ```js
 * await initKeypom({
 *     network: 'testnet',
 *     funder: {
 *         accountId,
 *         secretKey,
 *     }
 * })
 *
 * const {keys} = await createDrop({
 *     numKeys: 1,
 *     depositPerUseNEAR: 1
 * });
 *
 * const linkdropUrl = formatLinkdropUrl({
 *     claimPage: "keypom",
 *     contractId: "v2.keypom.testnet",
 *     secretKeys: keys.secretKeys[0] // Can be either the array or individual secret key string
 * })
 *
 * console.log('linkdropUrl: ', linkdropUrl)
 * ```
 * @example
 * Use a custom claim page with ONLY the secret key
 * ```js
 * await initKeypom({
 *     network: 'testnet',
 *     funder: {
 *         accountId,
 *         secretKey,
 *     }
 * })
 *
 * const {keys} = await createDrop({
 *     numKeys: 1,
 *     depositPerUseNEAR: 1
 * });
 *
 * const linkdropUrl = formatLinkdropUrl({
 *     customURL: "foobar/SECRET_KEY/barfoo",
 *     contractId: "v2.keypom.testnet",
 *     secretKeys: keys.secretKeys[0] // Can be either the array or individual secret key string
 * })
 *
 * console.log('linkdropUrl: ', linkdropUrl)
 * ```
 * @example
 * Use a custom claim page with both the secret key and contract ID
 * ```js
 * await initKeypom({
 *     network: 'testnet',
 *     funder: {
 *         accountId,
 *         secretKey,
 *     }
 * })
 *
 * const {keys} = await createDrop({
 *     numKeys: 1,
 *     depositPerUseNEAR: 1
 * });
 *
 * const linkdropUrl = formatLinkdropUrl({
 *     customURL: "foobar/SECRET_KEY/barfoo/CONTRACT_ID",
 *     contractId: "v2.keypom.testnet",
 *     secretKeys: keys.secretKeys[0] // Can be either the array or individual secret key string
 * })
 *
 * console.log('linkdropUrl: ', linkdropUrl)
 * ```
 * @group Utility
 */
var formatLinkdropUrl = function (_a) {
    var claimPage = _a.claimPage, networkId = _a.networkId, contractId = _a.contractId, secretKeys = _a.secretKeys, customURL = _a.customURL;
    var _b = (0, keypom_1.getEnv)(), envNetworkId = _b.networkId, envContractId = _b.contractId;
    networkId = networkId || envNetworkId;
    contractId = contractId || envContractId;
    (0, checks_1.assert)(secretKeys, "Secret keys must be passed in as either an array or a single string");
    (0, checks_1.assert)(customURL || keypom_1.supportedLinkdropClaimPages[networkId].hasOwnProperty(claimPage), "Either a custom base URL or a supported claim page must be passed in.");
    customURL = customURL || keypom_1.supportedLinkdropClaimPages[networkId][claimPage];
    // If the secret key is a single string, convert it to an array
    if (typeof secretKeys === 'string') {
        secretKeys = [secretKeys];
    }
    // insert the contractId and secret key into the base URL based on the CONTRACT_ID and SECRET_KEY field
    var returnedURLs = [];
    // loop through all secret keys
    secretKeys.forEach(function (secretKey) {
        // insert the secret key into the base URL
        var url = customURL.replace('SECRET_KEY', secretKey);
        // insert the contract ID into the base URL
        url = url.replace('CONTRACT_ID', contractId);
        // add the URL to the array of URLs
        returnedURLs.push(url);
    });
    return returnedURLs;
};
exports.formatLinkdropUrl = formatLinkdropUrl;
/**
 * Generate a sha256 hash of a passed in string. If the string is hex encoded, set the fromHex flag to true.
 *
 * @param {string} str - the string you wish to hash. By default, this should be utf8 encoded. If the string is hex encoded, set the fromHex flag to true.
 * @param {boolean} fromHex (OPTIONAL) - A flag that should be set if the string is hex encoded. Defaults to false.
 *
 * @returns {Promise<string>} - The resulting hash
 *
 * @example
 * Generating the required password to pass into `claim` given a base password:
 * ```js
 * 	// Create the password to pass into claim which is a hash of the basePassword, public key and whichever use we are on
 * let currentUse = 1;
 * let passwordForClaim = await hashPassword(basePassword + publicKey + currentUse.toString());
 * ```
 * @group Utility
 */
var hashPassword = function (str, fromHex) {
    if (fromHex === void 0) { fromHex = false; }
    return __awaiter(void 0, void 0, void 0, function () {
        var buf;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, hashBuf(str, fromHex)];
                case 1:
                    buf = _a.sent();
                    return [2 /*return*/, Buffer.from(buf).toString('hex')];
            }
        });
    });
};
exports.hashPassword = hashPassword;
/**
 * Generate ed25519 KeyPairs that can be used for Keypom linkdrops, or full access keys to claimed accounts. These keys can optionally be derived from some entropy such as a root password and metadata pertaining to each key (user provided password etc.).
 * Entropy is useful for creating an onboarding experience where in order to recover a keypair, the client simply needs to provide the meta entropy (could be a user's password) and the secret root key like a UUID).
 *
 * @param {number} numKeys - The number of keys to generate
 * @param {string=} rootEntropy (OPTIONAL) - A root string that will be used as a baseline for all keys in conjunction with different metaEntropies (if provided) to deterministically generate a keypair. If not provided, the keypair will be completely random.
 * @param {string=} metaEntropy (OPTIONAL) - An array of entropies to use in conjunction with a base rootEntropy to deterministically generate the private keys. For single key generation, you can either pass in a string array with a single element, or simply
 pass in the string itself directly (not within an array).
 * @param {number=} autoMetaNonceStart (OPTIONAL) - Specify a starting index whereby the meta entropy will automatically increment by 1 for each key generated. This is to avoid having to pass in an array of meta entropy that simply increments by 1 each time.
 * This is very useful as auto key generation uses the drop ID, base password and key nonce. The drop ID and base password would be a constant and make up the root entropy and then the key nonce increments by 1 for each key generated.
 * @returns {Promise<GeneratedKeyPairs>} - An object containing an array of KeyPairs, Public Keys and Secret Keys.
 *
 * @example
 * Generating 10 unique random keypairs with no entropy:
 * ```js
 * // Generate 10 keys with no entropy (all random)
 * let keys = await generateKeys({
 *     numKeys: 10,
 * })
 *
 * let pubKey1 = keys.publicKeys[0];
 * let secretKey1 = keys.secretKeys[0];
 *
 * console.log('1st Public Key: ', pubKey1);
 * console.log('1st Secret Key: ', secretKey1)
 * ```
 *
 * @example
 * Generating 1 keypair based on entropy:
 * ```js
 * // Generate 1 key with the given entropy
 * let {publicKeys, secretKeys} = await generateKeys({
 *     numKeys: 1,
 *     rootEntropy: "my-global-password",
 *     metaEntropy: "user-password-123" // In this case, since there is only 1 key, the entropy can be an array of size 1 as well.
 * })
 *
 * let pubKey = publicKeys[0];
 * let secretKey = secretKeys[0];
 *
 * console.log('Public Key: ', pubKey);
 * console.log('Secret Key: ', secretKey)
 * ```
 *
 * @example
 * Generating 2 keypairs each with their own entropy:
 * ```js
 * // Generate 2 keys each with their own unique entropy
 * let keys = await generateKeys({
 *     numKeys: 2,
 *     rootEntropy: "my-global-password",
 *     metaEntropy: [
 *        `first-password:0`,
 *        `second-password:1`
 *    ]
 * })
 *
 * console.log('Pub Keys ', keys.publicKeys);
 * console.log('Secret Keys ', keys.secretKeys);
 * ```
 *  * @example
 * Generate 50 keys exactly how the auto key generation would in createDrop and addKeys:
 * ```js
 * const dropId = '1676913490360';
 * const basePassword = "my-password";
 * // Generate 50 keys each with their own unique entropy
 * let keys = await generateKeys({
 *     numKeys: 50,
 *     rootEntropy: `${basePassword}-${dropId}`,
 *     autoMetaNonceStart: 0
 * })
 *
 * console.log('Pub Keys ', keys.publicKeys);
 * console.log('Secret Keys ', keys.secretKeys);
 * ```
 * @group Utility
 */
var generateKeys = function (_a) {
    var numKeys = _a.numKeys, rootEntropy = _a.rootEntropy, metaEntropy = _a.metaEntropy, autoMetaNonceStart = _a.autoMetaNonceStart;
    return __awaiter(void 0, void 0, void 0, function () {
        var numEntropy, keyPairs, publicKeys, secretKeys, i, stringToHash, hash, _b, secretKey, publicKey, keyPair, keyPair;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    // If the metaEntropy provided is not an array (simply the string for 1 key), we convert it to an array of size 1 so that we can use the same logic for both cases
                    if (metaEntropy && !Array.isArray(metaEntropy)) {
                        metaEntropy = [metaEntropy];
                    }
                    numEntropy = (metaEntropy === null || metaEntropy === void 0 ? void 0 : metaEntropy.length) || numKeys;
                    (0, checks_1.assert)(numEntropy == numKeys, "You must provide the same number of meta entropy values as the number of keys");
                    keyPairs = [];
                    publicKeys = [];
                    secretKeys = [];
                    if (metaEntropy === undefined && autoMetaNonceStart !== undefined) {
                        metaEntropy = Array(numKeys).fill(0).map(function (_, i) { return (autoMetaNonceStart + i).toString(); });
                    }
                    i = 0;
                    _c.label = 1;
                case 1:
                    if (!(i < numKeys)) return [3 /*break*/, 5];
                    if (!rootEntropy) return [3 /*break*/, 3];
                    stringToHash = metaEntropy ? "".concat(rootEntropy, "_").concat(metaEntropy[i]) : rootEntropy;
                    return [4 /*yield*/, hashBuf(stringToHash)];
                case 2:
                    hash = _c.sent();
                    _b = (0, near_seed_phrase_1.generateSeedPhrase)(hash), secretKey = _b.secretKey, publicKey = _b.publicKey;
                    keyPair = KeyPair.fromString(secretKey);
                    keyPairs.push(keyPair);
                    publicKeys.push(publicKey);
                    secretKeys.push(secretKey);
                    return [3 /*break*/, 4];
                case 3:
                    keyPair = KeyPair.fromRandom('ed25519');
                    keyPairs.push(keyPair);
                    publicKeys.push(keyPair.getPublicKey().toString());
                    // @ts-ignore - not sure why it's saying secret key isn't property of keypair
                    secretKeys.push(keyPair.secretKey);
                    _c.label = 4;
                case 4:
                    i++;
                    return [3 /*break*/, 1];
                case 5: return [2 /*return*/, {
                        keyPairs: keyPairs,
                        publicKeys: publicKeys,
                        secretKeys: secretKeys
                    }];
            }
        });
    });
};
exports.generateKeys = generateKeys;
var keypomView = function (_a) {
    var methodName = _a.methodName, args = _a.args;
    return __awaiter(void 0, void 0, void 0, function () {
        var _b, viewCall, contractId;
        return __generator(this, function (_c) {
            _b = (0, keypom_1.getEnv)(), viewCall = _b.viewCall, contractId = _b.contractId;
            return [2 /*return*/, viewCall({
                    contractId: contractId,
                    methodName: methodName,
                    args: args
                })];
        });
    });
};
exports.keypomView = keypomView;
/// TODO WIP: helper to remove the deposit if the user already has enough balance to cover the drop,add_keys
// export const hasDeposit = ({
//     accountId,
//     transactions,
// }) => {
//     const { contractId, viewAccount } = getEnv()
//     const totalDeposit = transactions.reduce((a, c) =>
//         a.add(c.actions.reduce((a, c) => a.add(new BN(c.deposit || '0')), new BN('0')))
//     , new BN('0'))
// 	const userBalance = viewAccount.viewFunction2({ contractId, methodName: 'get_user_balance', args: { account_id: accountId }})
//     if (new BN(userBalance.gt(totalDeposit))) {
//         transactions
//             .filter(({ receiverId }) => contractId === receiverId)
//             .forEach((tx) => tx.actions.forEach((a) => {
//                 if (/create_drop|add_keys/gi.test(a.methodName)) delete a.deposit
//             }))
//     }
// }
/** @group Utility */
var execute = function (_a) {
    var transactions = _a.transactions, account = _a.account, wallet = _a.wallet, fundingAccount = _a.fundingAccount, successUrl = _a.successUrl;
    return __awaiter(void 0, void 0, void 0, function () {
        var contractId, needsRedirect_1, responses, _i, transactions_1, tx, _b, _c, nearAccount;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    contractId = (0, keypom_1.getEnv)().contractId;
                    if (!wallet) return [3 /*break*/, 8];
                    return [4 /*yield*/, wallet];
                case 1:
                    // wallet might be Promise<Wallet> or value, either way doesn't matter
                    wallet = _d.sent();
                    needsRedirect_1 = false;
                    transactions.forEach(function (tx) {
                        if (tx.receiverId !== contractId)
                            needsRedirect_1 = true;
                        tx.actions.forEach(function (a) {
                            var deposit = (a === null || a === void 0 ? void 0 : a.params).deposit;
                            if (deposit && deposit !== '0')
                                needsRedirect_1 = true;
                        });
                    });
                    if (!needsRedirect_1) return [3 /*break*/, 3];
                    return [4 /*yield*/, wallet.signAndSendTransactions({ transactions: transactions, callbackUrl: successUrl })
                        // sign txs in serial without redirect
                    ];
                case 2: return [2 /*return*/, _d.sent()
                    // sign txs in serial without redirect
                ];
                case 3:
                    responses = [];
                    _i = 0, transactions_1 = transactions;
                    _d.label = 4;
                case 4:
                    if (!(_i < transactions_1.length)) return [3 /*break*/, 7];
                    tx = transactions_1[_i];
                    _c = (_b = responses).push;
                    return [4 /*yield*/, wallet.signAndSendTransaction({
                            actions: tx.actions,
                        })];
                case 5:
                    _c.apply(_b, [_d.sent()]);
                    _d.label = 6;
                case 6:
                    _i++;
                    return [3 /*break*/, 4];
                case 7: return [2 /*return*/, responses];
                case 8:
                    nearAccount = account || fundingAccount;
                    (0, checks_1.assert)(nearAccount, "Call with either a NEAR Account argument 'account' or initialize Keypom with a 'fundingAccount'");
                    return [4 /*yield*/, signAndSendTransactions(nearAccount, (0, exports.transformTransactions)(transactions))];
                case 9: return [2 /*return*/, _d.sent()];
            }
        });
    });
};
exports.execute = execute;
/**
 * For FT Drops, keys need to be registered before they can be used. This is done via the `ft_transfer_call` method on the FT contract.
 * This is a convenience method to make that process easier.
 *
 * @example
 * Send FTs using the funder account (not passing in any accounts into the call):
 * ```js
 * // Initialize the SDK on testnet
 * await initKeypom({
 * 	network: "testnet",
 * 	funder: {
 * 		accountId: "benji_demo.testnet",
 * 		secretKey: "ed25519:5yARProkcALbxaSQ66aYZMSBPWL9uPBmkoQGjV3oi2ddQDMh1teMAbz7jqNV9oVyMy7kZNREjYvWPqjcA6LW9Jb1"
 * 	}
 * });
 *
 * await ftTransferCall({
 *     contractId: "ft.keypom.testnet",
 *     amount: "1",
 *     dropId: "1231231",
 * )};
 * ```
 * @group Registering Key Uses
*/
var ftTransferCall = function (_a) {
    var account = _a.account, wallet = _a.wallet, contractId = _a.contractId, absoluteAmount = _a.absoluteAmount, amount = _a.amount, dropId = _a.dropId, _b = _a.returnTransaction, returnTransaction = _b === void 0 ? false : _b;
    return __awaiter(void 0, void 0, void 0, function () {
        var _c, getAccount, near, keypomContractId, viewCall, metadata, tx;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _c = (0, keypom_1.getEnv)(), getAccount = _c.getAccount, near = _c.near, keypomContractId = _c.receiverId, viewCall = _c.viewCall;
                    (0, checks_1.assert)((0, checks_1.isValidAccountObj)(account), 'Passed in account is not a valid account object.');
                    return [4 /*yield*/, getAccount({ account: account, wallet: wallet })];
                case 1:
                    account = _d.sent();
                    if (!amount) return [3 /*break*/, 3];
                    return [4 /*yield*/, viewCall({
                            contractId: contractId,
                            methodName: 'ft_metadata',
                        })];
                case 2:
                    metadata = _d.sent();
                    absoluteAmount = (0, exports.parseFTAmount)(amount, metadata.decimals);
                    _d.label = 3;
                case 3:
                    tx = {
                        receiverId: contractId,
                        signerId: account.accountId,
                        actions: [{
                                type: 'FunctionCall',
                                params: {
                                    methodName: 'ft_transfer_call',
                                    args: {
                                        receiver_id: keypomContractId,
                                        amount: absoluteAmount,
                                        msg: dropId.toString()
                                    },
                                    gas: '50000000000000',
                                    deposit: '1',
                                }
                            }]
                    };
                    if (returnTransaction)
                        return [2 /*return*/, tx];
                    return [2 /*return*/, (0, exports.execute)({ account: account, transactions: [tx] })];
            }
        });
    });
};
exports.ftTransferCall = ftTransferCall;
/**
 * For NFT Drops, keys need to be registered before they can be used. This is done via the `nft_transfer_call` method on the NFT contract.
 * This is a convenience method to make that process easier.
 *
 * @param {Account=} account (OPTIONAL) If specified, the passed in account will be used to sign the txn instead of the funder account.
 * @param {BrowserWalletBehaviour=} wallet (OPTIONAL) If using a browser wallet through wallet selector and that wallet should sign the transaction, pass it in.
 * @param {string} contractId The non-fungible token contract ID.
 * @param {string[]} tokenIds A set of token IDs that should be sent to the Keypom contract in order to register keys.
 * @param {string} dropId The drop ID to register the keys for.
 * @param {boolean=} returnTransaction (OPTIONAL) If true, the transaction will be returned instead of being signed and sent.
 *
 * @example
 * Send 3 NFTs using the funder account (not passing in any accounts into the call):
 * ```js
 * // Initialize the SDK on testnet
 * await initKeypom({
 * 	network: "testnet",
 * 	funder: {
 * 		accountId: "benji_demo.testnet",
 * 		secretKey: "ed25519:5yARProkcALbxaSQ66aYZMSBPWL9uPBmkoQGjV3oi2ddQDMh1teMAbz7jqNV9oVyMy7kZNREjYvWPqjcA6LW9Jb1"
 * 	}
 * });
 *
 * await nftTransferCall({
 *     contractId: "nft.keypom.testnet",
 *     tokenIds: ["1", "2", "3],
 *     dropId: "1231231",
 * )};
 * ```
 * @group Registering Key Uses
*/
var nftTransferCall = function (_a) {
    var account = _a.account, wallet = _a.wallet, contractId = _a.contractId, tokenIds = _a.tokenIds, dropId = _a.dropId, _b = _a.returnTransactions, returnTransactions = _b === void 0 ? false : _b;
    return __awaiter(void 0, void 0, void 0, function () {
        var _c, getAccount, near, receiverId, responses, transactions, i, tx, _d, _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    _c = (0, keypom_1.getEnv)(), getAccount = _c.getAccount, near = _c.near, receiverId = _c.receiverId;
                    (0, checks_1.assert)((0, checks_1.isValidAccountObj)(account), 'Passed in account is not a valid account object.');
                    return [4 /*yield*/, getAccount({ account: account, wallet: wallet })];
                case 1:
                    account = _f.sent();
                    (0, checks_1.assert)(tokenIds.length < 6, "This method can only transfer 6 NFTs in 1 batch transaction.");
                    responses = [];
                    transactions = [];
                    i = 0;
                    _f.label = 2;
                case 2:
                    if (!(i < tokenIds.length)) return [3 /*break*/, 5];
                    tx = {
                        receiverId: contractId,
                        signerId: account.accountId,
                        actions: [{
                                type: 'FunctionCall',
                                params: {
                                    methodName: 'nft_transfer_call',
                                    args: {
                                        receiver_id: receiverId,
                                        token_id: tokenIds[i],
                                        msg: dropId.toString()
                                    },
                                    gas: '50000000000000',
                                    deposit: '1',
                                }
                            }]
                    };
                    transactions.push(tx);
                    if (returnTransactions)
                        return [3 /*break*/, 4];
                    _e = (_d = responses).push;
                    return [4 /*yield*/, (0, exports.execute)({
                            account: account,
                            transactions: transactions,
                        })];
                case 3:
                    _e.apply(_d, [_f.sent()]);
                    _f.label = 4;
                case 4:
                    i++;
                    return [3 /*break*/, 2];
                case 5: return [2 /*return*/, returnTransactions ? transactions : responses];
            }
        });
    });
};
exports.nftTransferCall = nftTransferCall;
/// https://github.com/near/near-api-js/blob/7f16b10ece3c900aebcedf6ebc660cc9e604a242/packages/near-api-js/src/utils/format.ts#L53
var parseFTAmount = function (amt, decimals) {
    amt = amt.replace(/,/g, '').trim();
    var split = amt.split('.');
    var wholePart = split[0];
    var fracPart = split[1] || '';
    if (split.length > 2 || fracPart.length > decimals) {
        throw new Error("Cannot parse '".concat(amt, "' as NEAR amount"));
    }
    return trimLeadingZeroes(wholePart + fracPart.padEnd(decimals, '0'));
};
exports.parseFTAmount = parseFTAmount;
var trimLeadingZeroes = function (value) {
    value = value.replace(/^0+/, '');
    if (value === '') {
        return '0';
    }
    return value;
};
/// sequentially execute all transactions
var signAndSendTransactions = function (account, txs) { return __awaiter(void 0, void 0, void 0, function () {
    var responses, i, _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                responses = [];
                i = 0;
                _c.label = 1;
            case 1:
                if (!(i < txs.length)) return [3 /*break*/, 4];
                // @ts-ignore
                // near-api-js marks this method as protected.
                // Reference: https://github.com/near/wallet-selector/blob/7f9f8598459cffb80583c2a83c387c3d5c2f4d5d/packages/my-near-wallet/src/lib/my-near-wallet.spec.ts#L31
                _b = (_a = responses).push;
                return [4 /*yield*/, account.signAndSendTransaction(txs[i])];
            case 2:
                // @ts-ignore
                // near-api-js marks this method as protected.
                // Reference: https://github.com/near/wallet-selector/blob/7f9f8598459cffb80583c2a83c387c3d5c2f4d5d/packages/my-near-wallet/src/lib/my-near-wallet.spec.ts#L31
                _b.apply(_a, [_c.sent()]);
                _c.label = 3;
            case 3:
                i++;
                return [3 /*break*/, 1];
            case 4: return [2 /*return*/, responses];
        }
    });
}); };
var transformTransactions = function (transactions) { return transactions.map(function (_a) {
    var receiverId = _a.receiverId, _actions = _a.actions;
    var actions = _actions.map(function (action) {
        return createAction(action);
    });
    var txnOption = {
        receiverId: receiverId,
        actions: actions
    };
    return (txnOption);
}); };
exports.transformTransactions = transformTransactions;
// reference: https://github.com/near/wallet-selector/blob/d09f69e50df05c8e5f972beab4f336d7cfa08c65/packages/wallet-utils/src/lib/create-action.ts
var createAction = function (action) {
    switch (action.type) {
        case "CreateAccount":
            return near_api_js_1.transactions.createAccount();
        case "DeployContract": {
            var code = action.params.code;
            return near_api_js_1.transactions.deployContract(code);
        }
        case "FunctionCall": {
            var _a = action.params, methodName = _a.methodName, args = _a.args, gas = _a.gas, deposit = _a.deposit;
            return near_api_js_1.transactions.functionCall(methodName, args, new bn_js_1.default(gas), new bn_js_1.default(deposit));
        }
        case "Transfer": {
            var deposit = action.params.deposit;
            return near_api_js_1.transactions.transfer(new bn_js_1.default(deposit));
        }
        case "Stake": {
            var _b = action.params, stake = _b.stake, publicKey = _b.publicKey;
            return near_api_js_1.transactions.stake(new bn_js_1.default(stake), utils.PublicKey.from(publicKey));
        }
        case "AddKey": {
            var _c = action.params, publicKey = _c.publicKey, accessKey = _c.accessKey;
            // return transactions.addKey(
            // 	utils.PublicKey.from(publicKey),
            // 	// TODO: Use accessKey.nonce? near-api-js seems to think 0 is fine?
            // 	getAccessKey(accessKey.permission)
            // );
        }
        case "DeleteKey": {
            var publicKey = action.params.publicKey;
            return near_api_js_1.transactions.deleteKey(utils.PublicKey.from(publicKey));
        }
        case "DeleteAccount": {
            var beneficiaryId = action.params.beneficiaryId;
            return near_api_js_1.transactions.deleteAccount(beneficiaryId);
        }
        default:
            throw new Error("Invalid action type");
    }
};
/** @group Utility */
var getStorageBase = function (_a) {
    var public_keys = _a.public_keys, deposit_per_use = _a.deposit_per_use, drop_id = _a.drop_id, config = _a.config, metadata = _a.metadata, simple = _a.simple, ft = _a.ft, nft = _a.nft, fc = _a.fc, passwords_per_use = _a.passwords_per_use;
    var storageCostNEARPerByte = 0.00001;
    var totalBytes = 0;
    // Get the bytes per public key, multiply it by number of keys, and add it to the total
    var bytesPerKey = Buffer.from("ed25519:88FHvWTp21tahAobQGjD8YweXGRgA7jE8TSQM6yg4Cim").length;
    var totalBytesForKeys = bytesPerKey * ((public_keys === null || public_keys === void 0 ? void 0 : public_keys.length) || 0);
    // console.log('totalBytesForKeys: ', totalBytesForKeys)
    // Bytes for the deposit per use
    var bytesForDeposit = Buffer.from(deposit_per_use.toString()).length + 40;
    // console.log('bytesForDeposit: ', bytesForDeposit)
    // Bytes for the drop ID
    var bytesForDropId = Buffer.from(drop_id || "").length + 40;
    // console.log('bytesForDropId: ', bytesForDropId)
    // Bytes for the config
    var bytesForConfig = Buffer.from(JSON.stringify(config || "")).length + 40;
    // console.log('bytesForConfig: ', bytesForConfig)
    // Bytes for the metadata. 66 comes from collection initialization
    var bytesForMetadata = Buffer.from(metadata || "").length + 66;
    // console.log('bytesForMetadata: ', bytesForMetadata)
    // Bytes for the simple data
    var bytesForSimple = Buffer.from(JSON.stringify(simple || "")).length + 40;
    // console.log('bytesForSimple: ', bytesForSimple)
    // Bytes for the FT data
    var bytesForFT = Buffer.from(JSON.stringify(ft || "")).length + 40;
    // console.log('bytesForFT: ', bytesForFT)
    // Bytes for the NFT data
    var bytesForNFT = Buffer.from(JSON.stringify(nft || "")).length + 40;
    // console.log('bytesForNFT: ', bytesForNFT)
    // Bytes for the FC data
    var bytesForFC = Buffer.from(JSON.stringify(fc || "")).length + 40;
    // console.log('bytesForFC: ', bytesForFC)
    // Bytes for the passwords per use
    // Magic numbers come from plotting SDK data against protocol data and finding the best fit
    var bytesForPasswords = Buffer.from(JSON.stringify(passwords_per_use || "")).length * 4;
    // console.log('bytesForPasswords: ', bytesForPasswords)
    totalBytes += totalBytesForKeys + bytesForDeposit + bytesForDropId + bytesForConfig + bytesForMetadata + bytesForSimple + bytesForFT + bytesForNFT + bytesForFC + bytesForPasswords;
    // console.log('totalBytes: ', totalBytes)
    // Add a 30% buffer to the total bytes
    totalBytes = Math.round(totalBytes * 1.3);
    // console.log('totalBytes Rounded: ', totalBytes)
    var totalNEARAmount = (totalBytes * storageCostNEARPerByte);
    // console.log('totalNEARAmount BEFORE: ', totalNEARAmount)
    // Accounting for protocol storage for access keys
    // Magic numbers come from plotting SDK data against protocol data and finding the best fit 
    totalNEARAmount += ((public_keys === null || public_keys === void 0 ? void 0 : public_keys.length) || 0) * 0.005373134328 + 0.00376;
    // console.log('totalNEARAmount AFTER pk: ', totalNEARAmount.toString())
    // Multi use passwords need a little extra storage
    if (passwords_per_use) {
        totalNEARAmount += -0.00155 * (((config === null || config === void 0 ? void 0 : config.uses_per_key) || 1) - 1) + 0.00285687;
        // console.log('totalNEARAmount AFTER pw per use conversion: ', totalNEARAmount.toString())
    }
    // Turns it into yocto
    return parseNearAmount(totalNEARAmount.toString());
};
exports.getStorageBase = getStorageBase;
/** Initiate the connection to the NEAR blockchain. @group Utility */
var estimateRequiredDeposit = function (_a) {
    var near = _a.near, depositPerUse = _a.depositPerUse, numKeys = _a.numKeys, usesPerKey = _a.usesPerKey, attachedGas = _a.attachedGas, _b = _a.storage, storage = _b === void 0 ? parseNearAmount("0.034") : _b, _c = _a.keyStorage, keyStorage = _c === void 0 ? parseNearAmount("0.0065") : _c, fcData = _a.fcData, ftData = _a.ftData;
    return __awaiter(void 0, void 0, void 0, function () {
        var numKeysBN, usesPerKeyBN, totalRequiredStorage, actualAllowance, totalAllowance, totalAccessKeyStorage, _d, numNoneFcs, depositRequiredForFcDrops, totalDeposits, totalDepositsForFc, requiredDeposit, extraFtCosts;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    numKeysBN = new bn_js_1.default(numKeys.toString());
                    usesPerKeyBN = new bn_js_1.default(usesPerKey.toString());
                    totalRequiredStorage = new bn_js_1.default(storage).add(new bn_js_1.default(keyStorage).mul(numKeysBN));
                    actualAllowance = estimatePessimisticAllowance(attachedGas).mul(usesPerKeyBN);
                    totalAllowance = actualAllowance.mul(numKeysBN);
                    totalAccessKeyStorage = ACCESS_KEY_STORAGE.mul(numKeysBN);
                    _d = getNoneFcsAndDepositRequired(fcData, usesPerKey), numNoneFcs = _d.numNoneFcs, depositRequiredForFcDrops = _d.depositRequiredForFcDrops;
                    totalDeposits = new bn_js_1.default(depositPerUse).mul(new bn_js_1.default(usesPerKey - numNoneFcs)).mul(numKeysBN);
                    totalDepositsForFc = depositRequiredForFcDrops.mul(numKeysBN);
                    requiredDeposit = totalRequiredStorage
                        .add(totalAllowance)
                        .add(totalAccessKeyStorage)
                        .add(totalDeposits)
                        .add(totalDepositsForFc);
                    if (!(ftData === null || ftData === void 0 ? void 0 : ftData.contractId)) return [3 /*break*/, 2];
                    return [4 /*yield*/, getFtCosts(near, numKeys, usesPerKey, ftData === null || ftData === void 0 ? void 0 : ftData.contractId)];
                case 1:
                    extraFtCosts = _e.sent();
                    requiredDeposit = requiredDeposit.add(new bn_js_1.default(extraFtCosts));
                    _e.label = 2;
                case 2: return [2 /*return*/, requiredDeposit.toString() || "0"];
            }
        });
    });
};
exports.estimateRequiredDeposit = estimateRequiredDeposit;
// Estimate the amount of allowance required for a given attached gas.
var estimatePessimisticAllowance = function (attachedGas) {
    if (typeof attachedGas !== 'number')
        attachedGas = parseInt(attachedGas);
    // Get the number of CCCs you can make with the attached GAS
    var numCCCs = Math.floor(attachedGas / GAS_PER_CCC);
    // console.log('numCCCs: ', numCCCs)
    // Get the constant used to pessimistically calculate the required allowance
    var powOutcome = Math.pow(1.03, numCCCs);
    // console.log('powOutcome: ', powOutcome)
    var requiredGas = (attachedGas + RECEIPT_GAS_COST) * powOutcome + RECEIPT_GAS_COST;
    // console.log('requiredGas: ', requiredGas)
    var requiredAllowance = new bn_js_1.default(requiredGas).mul(new bn_js_1.default(YOCTO_PER_GAS));
    // console.log('requiredAllowance: ', requiredAllowance.toString())
    return requiredAllowance;
};
// Estimate the amount of allowance required for a given attached gas.
var getNoneFcsAndDepositRequired = function (fcData, usesPerKey) {
    var depositRequiredForFcDrops = new bn_js_1.default(0);
    var numNoneFcs = 0;
    if (!fcData || Object.keys(fcData).length === 0) {
        return { numNoneFcs: numNoneFcs, depositRequiredForFcDrops: depositRequiredForFcDrops };
    }
    var numMethodData = fcData.methods.length;
    // If there's one method data specified and more than 1 claim per key, that data is to be used
    // For all the claims. In this case, we need to tally all the deposits for each method in all method data.
    if (usesPerKey > 1 && numMethodData == 1) {
        var methodData = fcData.methods[0];
        // Keep track of the total attached deposit across all methods in the method data
        var attachedDeposit = new bn_js_1.default(0);
        for (var i = 0; i < ((methodData === null || methodData === void 0 ? void 0 : methodData.length) || 0); i++) {
            attachedDeposit = attachedDeposit.add(new bn_js_1.default(methodData[i].attachedDeposit));
        }
        depositRequiredForFcDrops = depositRequiredForFcDrops.add(new bn_js_1.default(attachedDeposit)).mul(new bn_js_1.default(usesPerKey));
        return {
            numNoneFcs: numNoneFcs,
            depositRequiredForFcDrops: depositRequiredForFcDrops,
        };
    }
    // In the case where either there's 1 claim per key or the number of FCs is not 1,
    // We can simply loop through and manually get this data
    for (var i = 0; i < numMethodData; i++) {
        var methodData = fcData.methods[i];
        var isNoneFc = methodData == null;
        numNoneFcs += isNoneFc ? 1 : 0;
        if (!isNoneFc) {
            // Keep track of the total attached deposit across all methods in the method data
            var attachedDeposit = new bn_js_1.default(0);
            for (var j = 0; j < ((methodData === null || methodData === void 0 ? void 0 : methodData.length) || 0); j++) {
                attachedDeposit = attachedDeposit.add(new bn_js_1.default(methodData[j].attachedDeposit));
            }
            depositRequiredForFcDrops = depositRequiredForFcDrops.add(attachedDeposit);
        }
    }
    return {
        numNoneFcs: numNoneFcs,
        depositRequiredForFcDrops: depositRequiredForFcDrops,
    };
};
// Estimate the amount of allowance required for a given attached gas.
var getFtCosts = function (near, numKeys, usesPerKey, ftContract) { return __awaiter(void 0, void 0, void 0, function () {
    var viewAccount, min, costs;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, near.account("foo")];
            case 1:
                viewAccount = _a.sent();
                return [4 /*yield*/, viewAccount.viewFunction(ftContract, "storage_balance_bounds", {})];
            case 2:
                min = (_a.sent()).min;
                costs = new bn_js_1.default(min).mul(new bn_js_1.default(numKeys)).mul(new bn_js_1.default(usesPerKey)).add(new bn_js_1.default(min));
                // console.log('costs: ', costs.toString());
                return [2 /*return*/, costs.toString() || "0"];
        }
    });
}); };
/**
 * Generate passwords for a set of public keys. A unique password will be created for each specified use of a public key where the use is NOT zero indexed (i.e 1st use = 1).
 * The passwords will be generated via a double hash of the base password + public key + specific use
 *
 * @param {string[]} publicKeys The public keys that will be used to generate the set of passwords
 * @param {string[]} uses An array of numbers that dictate which uses should be password protected. The 1st use of a key is 1 (NOT zero indexed).
 * @param {string=} basePassword All the passwords will be generated from this base password. It will be double hashed with the public key.
 *
 * @returns {Promise<Array<Array<PasswordPerUse>>>} An array of objects for each key where each object has a password and maps it to its specific key use.
 * @group Utility
 */
function generatePerUsePasswords(_a) {
    var publicKeys = _a.publicKeys, uses = _a.uses, basePassword = _a.basePassword;
    return __awaiter(this, void 0, void 0, function () {
        var passwords, i, passwordsPerUse, j, innerHashBuff, innerHash, outerHashBuff, outerHash, jsonPw;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    passwords = [];
                    i = 0;
                    _b.label = 1;
                case 1:
                    if (!(i < publicKeys.length)) return [3 /*break*/, 8];
                    passwordsPerUse = [];
                    j = 0;
                    _b.label = 2;
                case 2:
                    if (!(j < uses.length)) return [3 /*break*/, 6];
                    return [4 /*yield*/, hashBuf(basePassword + publicKeys[i] + uses[j].toString())];
                case 3:
                    innerHashBuff = _b.sent();
                    innerHash = Buffer.from(innerHashBuff).toString('hex');
                    return [4 /*yield*/, hashBuf(innerHash, true)];
                case 4:
                    outerHashBuff = _b.sent();
                    outerHash = Buffer.from(outerHashBuff).toString('hex');
                    jsonPw = {
                        pw: outerHash,
                        key_use: uses[j]
                    };
                    passwordsPerUse.push(jsonPw);
                    _b.label = 5;
                case 5:
                    j++;
                    return [3 /*break*/, 2];
                case 6:
                    passwords.push(passwordsPerUse);
                    _b.label = 7;
                case 7:
                    i++;
                    return [3 /*break*/, 1];
                case 8: return [2 /*return*/, passwords];
            }
        });
    });
}
exports.generatePerUsePasswords = generatePerUsePasswords;
// Taken from https://stackoverflow.com/a/61375162/16441367
var snakeToCamel = function (str) {
    return str.toLowerCase().replace(/([-_][a-z])/g, function (group) {
        return group
            .toUpperCase()
            .replace('-', '')
            .replace('_', '');
    });
};
exports.snakeToCamel = snakeToCamel;
// Taken from https://stackoverflow.com/a/26215431/16441367
var toCamel = function (o) {
    var newO, origKey, newKey, value;
    if (o instanceof Array) {
        return o.map(function (value) {
            if (typeof value === "object") {
                value = (0, exports.toCamel)(value);
            }
            return value;
        });
    }
    else {
        newO = {};
        for (origKey in o) {
            if (o.hasOwnProperty(origKey)) {
                newKey = (0, exports.snakeToCamel)(origKey);
                value = o[origKey];
                if (value instanceof Array || (value !== null && value.constructor === Object)) {
                    value = (0, exports.toCamel)(value);
                }
                newO[newKey] = value;
            }
        }
    }
    return newO;
};
exports.toCamel = toCamel;
