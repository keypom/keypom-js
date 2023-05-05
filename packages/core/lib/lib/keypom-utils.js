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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTransactions = exports.convertBasicTransaction = exports.nearArgsToYocto = exports.toCamel = exports.snakeToCamel = exports.generatePerUsePasswords = exports.estimateRequiredDeposit = exports.getStorageBase = exports.createAction = exports.transformTransactions = exports.parseFTAmount = exports.nftTransferCall = exports.ftTransferCall = exports.execute = exports.viewAccessKeyData = exports.keypomView = exports.generateKeys = exports.hashPassword = exports.formatLinkdropUrl = exports.createNFTSeries = exports.getFTMetadata = exports.getNFTMetadata = exports.accountExists = exports.getPubFromSecret = exports.key2str = exports.ATTACHED_GAS_FROM_WALLET = void 0;
const bn_js_1 = __importDefault(require("bn.js"));
//import * as nearAPI from "near-api-js";
//import { Account, Near, transactions } from "near-api-js";
//import { base_decode } from "near-api-js/lib/utils/serialize";
const near_seed_phrase_1 = require("near-seed-phrase");
const checks_1 = require("./checks");
const keypom_1 = require("./keypom");
const crypto_1 = require("@near-js/crypto");
const accounts_1 = require("@near-js/accounts");
const utils_1 = require("@near-js/utils");
const transactions_1 = require("@near-js/transactions");
const borsh_1 = require("borsh");
let sha256Hash;
// @ts-ignore
if (typeof crypto === "undefined") {
    const nodeCrypto = require("crypto");
    sha256Hash = (ab) => nodeCrypto.createHash("sha256").update(ab).digest();
}
else {
    // @ts-ignore
    sha256Hash = (ab) => crypto.subtle.digest("SHA-256", ab);
}
/// How much Gas each each cross contract call with cost to be converted to a receipt
const GAS_PER_CCC = 5000000000000; // 5 TGas
const RECEIPT_GAS_COST = 2500000000000; // 2.5 TGas
const YOCTO_PER_GAS = 100000000; // 100 million
exports.ATTACHED_GAS_FROM_WALLET = 100000000000000; // 100 TGas
/// How much yoctoNEAR it costs to store 1 access key
const ACCESS_KEY_STORAGE = new bn_js_1.default("1000000000000000000000");
const key2str = (v) => (typeof v === "string" ? v : v.pk);
exports.key2str = key2str;
const hashBuf = (str, fromHex = false) => sha256Hash(Buffer.from(str, fromHex ? "hex" : "utf8"));
/**
 * Get the public key from a given secret key.
 *
 * @param {string} secretKey - The secret key you wish to get the public key from
 *
 * @returns {Promise<string>} - The public key
 *
 * @example
 * ```js
 * const pubKey = getPubFromSecret("ed25519:5yARProkcALbxaSQ66aYZMSBPWL9uPBmkoQGjV3oi2ddQDMh1teMAbz7jqNV9oVyMy7kZNREjYvWPqjcA6LW9Jb1");
 * console.log(pubKey);
 * ```
 * @group Utility
 */
const getPubFromSecret = (secretKey) => {
    var keyPair = crypto_1.KeyPair.fromString(secretKey);
    return keyPair.getPublicKey().toString();
};
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
const accountExists = (accountId) => __awaiter(void 0, void 0, void 0, function* () {
    const { connection } = (0, keypom_1.getEnv)();
    try {
        const account = new accounts_1.Account(connection, accountId);
        yield account.state();
        return true;
    }
    catch (e) {
        if (!/no such file|does not exist/.test(e.toString())) {
            throw e;
        }
        return false;
    }
});
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
const getNFTMetadata = ({ contractId, tokenId, }) => __awaiter(void 0, void 0, void 0, function* () {
    const { viewCall } = (0, keypom_1.getEnv)();
    const res = yield viewCall({
        contractId,
        methodName: "nft_token",
        args: {
            token_id: tokenId,
        },
    });
    return res;
});
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
const getFTMetadata = ({ contractId, }) => __awaiter(void 0, void 0, void 0, function* () {
    const { viewCall } = (0, keypom_1.getEnv)();
    const res = yield viewCall({
        contractId,
        methodName: "ft_metadata",
        args: {},
    });
    return res;
});
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
const createNFTSeries = ({ account, wallet, dropId, metadata, royalty, }) => __awaiter(void 0, void 0, void 0, function* () {
    const { getAccount, networkId } = (0, keypom_1.getEnv)();
    (0, checks_1.assert)((0, checks_1.isValidAccountObj)(account), "Passed in account is not a valid account object.");
    account = yield getAccount({ account, wallet });
    const actualMetadata = {
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
    const nftSeriesAccount = networkId == "testnet" ? "nft-v2.keypom.testnet" : "nft-v2.keypom.near";
    const pk = yield account.connection.signer.getPublicKey(account.accountId, account.connection.networkId);
    const txnInfo = {
        receiverId: nftSeriesAccount,
        signerId: account.accountId,
        actions: [
            {
                enum: "FunctionCall",
                functionCall: {
                    methodName: "create_series",
                    args: (0, transactions_1.stringifyJsonOrBytes)({
                        mint_id: parseInt(dropId),
                        metadata: actualMetadata,
                        royalty,
                    }),
                    gas: "50000000000000",
                    deposit: (0, utils_1.parseNearAmount)("0.25"),
                }
            },
        ],
    };
    const transaction = yield (0, exports.convertBasicTransaction)({ txnInfo, signerId: account.accountId, signerPk: pk });
    return (0, exports.execute)({ account: account, transactions: [transaction] });
});
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
const formatLinkdropUrl = ({ claimPage, networkId, contractId, secretKeys, customURL, }) => {
    const { networkId: envNetworkId, contractId: envContractId } = (0, keypom_1.getEnv)();
    networkId = networkId || envNetworkId;
    contractId = contractId || envContractId;
    (0, checks_1.assert)(secretKeys, "Secret keys must be passed in as either an array or a single string");
    (0, checks_1.assert)(customURL ||
        keypom_1.supportedLinkdropClaimPages[networkId].hasOwnProperty(claimPage), `Either a custom base URL or a supported claim page must be passed in.`);
    customURL =
        customURL || keypom_1.supportedLinkdropClaimPages[networkId][claimPage];
    // If the secret key is a single string, convert it to an array
    if (typeof secretKeys === "string") {
        secretKeys = [secretKeys];
    }
    // insert the contractId and secret key into the base URL based on the CONTRACT_ID and SECRET_KEY field
    let returnedURLs = [];
    // loop through all secret keys
    secretKeys.forEach((secretKey) => {
        // insert the secret key into the base URL
        let url = customURL.replace("SECRET_KEY", secretKey);
        // insert the contract ID into the base URL
        url = url.replace("CONTRACT_ID", contractId);
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
const hashPassword = (str, fromHex = false) => __awaiter(void 0, void 0, void 0, function* () {
    let buf = yield hashBuf(str, fromHex);
    return Buffer.from(buf).toString("hex");
});
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
const generateKeys = ({ numKeys, rootEntropy, metaEntropy, autoMetaNonceStart, }) => __awaiter(void 0, void 0, void 0, function* () {
    // If the metaEntropy provided is not an array (simply the string for 1 key), we convert it to an array of size 1 so that we can use the same logic for both cases
    if (metaEntropy && !Array.isArray(metaEntropy)) {
        metaEntropy = [metaEntropy];
    }
    // Ensure that if metaEntropy is provided, it should be the same length as the number of keys
    const numEntropy = (metaEntropy === null || metaEntropy === void 0 ? void 0 : metaEntropy.length) || numKeys;
    (0, checks_1.assert)(numEntropy == numKeys, `You must provide the same number of meta entropy values as the number of keys`);
    var keyPairs = [];
    var publicKeys = [];
    var secretKeys = [];
    if (metaEntropy === undefined && autoMetaNonceStart !== undefined) {
        metaEntropy = Array(numKeys)
            .fill(0)
            .map((_, i) => (autoMetaNonceStart + i).toString());
    }
    for (let i = 0; i < numKeys; i++) {
        if (rootEntropy) {
            const stringToHash = metaEntropy
                ? `${rootEntropy}_${metaEntropy[i]}`
                : rootEntropy;
            const hash = yield hashBuf(stringToHash);
            const { secretKey, publicKey } = (0, near_seed_phrase_1.generateSeedPhrase)(hash);
            var keyPair = crypto_1.KeyPair.fromString(secretKey);
            keyPairs.push(keyPair);
            publicKeys.push(publicKey);
            secretKeys.push(secretKey);
        }
        else {
            var keyPair = crypto_1.KeyPair.fromRandom("ed25519");
            keyPairs.push(keyPair);
            publicKeys.push(keyPair.getPublicKey().toString());
            // @ts-ignore - not sure why it's saying secret key isn't property of keypair
            secretKeys.push(keyPair.secretKey);
        }
    }
    return {
        keyPairs,
        publicKeys,
        secretKeys,
    };
});
exports.generateKeys = generateKeys;
const keypomView = ({ methodName, args }) => __awaiter(void 0, void 0, void 0, function* () {
    const { viewCall, contractId } = (0, keypom_1.getEnv)();
    return viewCall({
        contractId,
        methodName,
        args,
    });
});
exports.keypomView = keypomView;
/**
 * Query for important access key data such as the nonce, allowance, method names etc. that is stored on the NEAR protocol for a given account and public key.
 *
 * @example
 * Check if an access key belongs to a trial account
 * ```js
 * const keyInfo = await viewAccessKeyData({accountId, secretKey});
 * let keyPerms = keyInfo.permission.FunctionCall;
 * isValidTrialInfo = keyPerms.receiver_id === accountId && keyPerms.method_names.includes('execute')
 * console.log('isValidTrialInfo: ', isValidTrialInfo)
 * ```
 * @group Utility
 */
const viewAccessKeyData = ({ accountId, publicKey, secretKey, }) => __awaiter(void 0, void 0, void 0, function* () {
    const { near } = (0, keypom_1.getEnv)();
    const provider = near.connection.provider;
    if (secretKey) {
        publicKey = (0, exports.getPubFromSecret)(secretKey);
    }
    let res = yield provider.query({
        request_type: "view_access_key",
        finality: "final",
        account_id: accountId,
        public_key: publicKey,
    });
    return res;
});
exports.viewAccessKeyData = viewAccessKeyData;
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
const execute = ({ transactions, account, wallet, fundingAccount, successUrl, }) => __awaiter(void 0, void 0, void 0, function* () {
    const { contractId } = (0, keypom_1.getEnv)();
    // instance of walletSelector.wallet()
    if (wallet) {
        // wallet might be Promise<Wallet> or value, either way doesn't matter
        wallet = yield wallet;
        console.log("wallet: ", wallet);
        // might be able to sign transactions with app key
        let needsRedirect = false;
        let selectorTxns = [];
        transactions.forEach((tx) => {
            let selectorActions = [];
            if (tx.receiverId !== contractId)
                needsRedirect = true;
            tx.actions.forEach((a) => {
                selectorActions.push({
                    type: "FunctionCall",
                    params: {
                        methodName: a.functionCall.methodName,
                        args: JSON.parse(new TextDecoder().decode(a.functionCall.args)),
                        deposit: a.functionCall.deposit,
                        gas: a.functionCall.gas
                    }
                });
                const { deposit } = a === null || a === void 0 ? void 0 : a.params;
                if (deposit && deposit !== "0")
                    needsRedirect = true;
            });
            selectorTxns.push({
                signerId: tx.signerId,
                receiverId: tx.receiverId,
                actions: selectorActions
            });
        });
        console.log("needsRedirect: ", needsRedirect);
        console.log("transactions: ", transactions);
        if (needsRedirect)
            return yield wallet.signAndSendTransactions({
                transactions: selectorTxns,
                callbackUrl: successUrl
            });
        // sign txs in serial without redirect
        const responses = [];
        for (const tx of transactions) {
            let selectorActions = [];
            tx.actions.forEach((a) => {
                selectorActions.push({
                    type: "FunctionCall",
                    params: {
                        methodName: a.functionCall.methodName,
                        args: JSON.parse(new TextDecoder().decode(a.functionCall.args)),
                        deposit: a.functionCall.deposit,
                        gas: a.functionCall.gas
                    }
                });
            });
            responses.push(yield wallet.signAndSendTransaction({
                actions: selectorActions,
            }));
        }
        console.log("responses: ", responses);
        return responses;
    }
    /// instance of NEAR Account (backend usage)
    const nearAccount = account || fundingAccount;
    (0, checks_1.assert)(nearAccount, `Call with either a NEAR Account argument 'account' or initialize Keypom with a 'fundingAccount'`);
    return yield signAndSendTransactions(nearAccount, (0, exports.transformTransactions)(transactions));
});
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
const ftTransferCall = ({ account, wallet, contractId, absoluteAmount, amount, dropId, returnTransaction = false, }) => __awaiter(void 0, void 0, void 0, function* () {
    const { getAccount, receiverId: keypomContractId, viewCall, } = (0, keypom_1.getEnv)();
    (0, checks_1.assert)((0, checks_1.isValidAccountObj)(account), "Passed in account is not a valid account object.");
    account = yield getAccount({ account, wallet });
    if (amount) {
        const metadata = yield viewCall({
            contractId,
            methodName: "ft_metadata",
        });
        absoluteAmount = (0, exports.parseFTAmount)(amount, metadata.decimals);
    }
    const pk = yield account.connection.signer.getPublicKey(account.accountId, account.connection.networkId);
    const txnInfo = {
        receiverId: contractId,
        signerId: account.accountId,
        actions: [
            {
                enum: "FunctionCall",
                functionCall: {
                    methodName: "ft_transfer_call",
                    args: (0, transactions_1.stringifyJsonOrBytes)({
                        receiver_id: keypomContractId,
                        amount: absoluteAmount,
                        msg: dropId.toString(),
                    }),
                    gas: "50000000000000",
                    deposit: "1",
                }
            },
        ],
    };
    const transaction = yield (0, exports.convertBasicTransaction)({ txnInfo, signerId: account.accountId, signerPk: pk });
    if (returnTransaction)
        return transaction;
    return (0, exports.execute)({ account: account, transactions: [transaction] });
});
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
const nftTransferCall = ({ account, wallet, contractId, tokenIds, dropId, returnTransactions = false, }) => __awaiter(void 0, void 0, void 0, function* () {
    const { getAccount, receiverId } = (0, keypom_1.getEnv)();
    (0, checks_1.assert)((0, checks_1.isValidAccountObj)(account), "Passed in account is not a valid account object.");
    account = yield getAccount({ account, wallet });
    (0, checks_1.assert)(tokenIds.length < 6, `This method can only transfer 6 NFTs in 1 batch transaction.`);
    const responses = [];
    const transactions = [];
    /// TODO batch calls in parallel where it makes sense
    for (let i = 0; i < tokenIds.length; i++) {
        const pk = yield account.connection.signer.getPublicKey(account.accountId, account.connection.networkId);
        const txnInfo = {
            receiverId: contractId,
            signerId: account.accountId,
            actions: [
                {
                    enum: "FunctionCall",
                    functionCall: {
                        methodName: "nft_transfer_call",
                        args: (0, transactions_1.stringifyJsonOrBytes)({
                            receiver_id: receiverId,
                            token_id: tokenIds[i],
                            msg: dropId.toString(),
                        }),
                        gas: "50000000000000",
                        deposit: "1",
                    }
                },
            ],
        };
        const transaction = yield (0, exports.convertBasicTransaction)({ txnInfo, signerId: account.accountId, signerPk: pk });
        transactions.push(transaction);
        if (returnTransactions)
            continue;
        responses.push(yield (0, exports.execute)({
            account: account,
            transactions,
        }));
    }
    return returnTransactions ? transactions : responses;
});
exports.nftTransferCall = nftTransferCall;
/// https://github.com/near/near-api-js/blob/7f16b10ece3c900aebcedf6ebc660cc9e604a242/packages/near-api-js/src/utils/format.ts#L53
const parseFTAmount = (amt, decimals) => {
    amt = amt.replace(/,/g, "").trim();
    const split = amt.split(".");
    const wholePart = split[0];
    const fracPart = split[1] || "";
    if (split.length > 2 || fracPart.length > decimals) {
        throw new Error(`Cannot parse '${amt}' as NEAR amount`);
    }
    return trimLeadingZeroes(wholePart + fracPart.padEnd(decimals, "0"));
};
exports.parseFTAmount = parseFTAmount;
const trimLeadingZeroes = (value) => {
    value = value.replace(/^0+/, "");
    if (value === "") {
        return "0";
    }
    return value;
};
/// sequentially execute all transactions
const signAndSendTransactions = (account, txs) => __awaiter(void 0, void 0, void 0, function* () {
    const responses = [];
    for (let i = 0; i < txs.length; i++) {
        // @ts-ignore
        // near-api-js marks this method as protected.
        // Reference: https://github.com/near/wallet-selector/blob/7f9f8598459cffb80583c2a83c387c3d5c2f4d5d/packages/my-near-wallet/src/lib/my-near-wallet.spec.ts#L31
        responses.push(yield account.signAndSendTransaction(txs[i]));
    }
    return responses;
});
const transformTransactions = (transactions) => transactions.map(({ receiverId, actions: _actions }) => {
    const actions = _actions.map((action) => (0, exports.createAction)(action));
    let txnOption = {
        receiverId: receiverId,
        actions,
    };
    return txnOption;
});
exports.transformTransactions = transformTransactions;
const createAction = (action) => {
    if (action.createAccount) {
        return transactions_1.actionCreators.createAccount();
    }
    if (action.deployContract) {
        const { code } = action.deployContract;
        return transactions_1.actionCreators.deployContract(code);
    }
    if (action.functionCall) {
        const { methodName, args, gas, deposit } = action.functionCall;
        return transactions_1.actionCreators.functionCall(methodName, args, new bn_js_1.default(gas), new bn_js_1.default(deposit));
    }
    if (action.transfer) {
        const { deposit } = action.transfer;
        return transactions_1.actionCreators.transfer(new bn_js_1.default(deposit));
    }
    if (action.stake) {
        const { stake, publicKey } = action.stake;
        return transactions_1.actionCreators.stake(new bn_js_1.default(stake), crypto_1.PublicKey.from(publicKey));
    }
    if (action.deleteKey) {
        const { publicKey } = action.deleteKey;
        return transactions_1.actionCreators.deleteKey(crypto_1.PublicKey.from(publicKey));
    }
    if (action.deleteAccount) {
        const { beneficiaryId } = action.deleteAccount;
        return transactions_1.actionCreators.deleteAccount(beneficiaryId);
    }
    throw new Error("Unknown action");
};
exports.createAction = createAction;
/** @group Utility */
const getStorageBase = ({ public_keys, deposit_per_use, drop_id, config, metadata, simple, ft, nft, fc, passwords_per_use, }) => {
    const storageCostNEARPerByte = 0.00001;
    let totalBytes = 0;
    // Get the bytes per public key, multiply it by number of keys, and add it to the total
    let bytesPerKey = Buffer.from("ed25519:88FHvWTp21tahAobQGjD8YweXGRgA7jE8TSQM6yg4Cim").length;
    let totalBytesForKeys = bytesPerKey * ((public_keys === null || public_keys === void 0 ? void 0 : public_keys.length) || 0);
    // console.log('totalBytesForKeys: ', totalBytesForKeys)
    // Bytes for the deposit per use
    let bytesForDeposit = Buffer.from(deposit_per_use.toString()).length + 40;
    // console.log('bytesForDeposit: ', bytesForDeposit)
    // Bytes for the drop ID
    let bytesForDropId = Buffer.from(drop_id || "").length + 40;
    // console.log('bytesForDropId: ', bytesForDropId)
    // Bytes for the config
    let bytesForConfig = Buffer.from(JSON.stringify(config || "")).length + 40;
    // console.log('bytesForConfig: ', bytesForConfig)
    // Bytes for the metadata. 66 comes from collection initialization
    let bytesForMetadata = Buffer.from(metadata || "").length + 66;
    // console.log('bytesForMetadata: ', bytesForMetadata)
    // Bytes for the simple data
    let bytesForSimple = Buffer.from(JSON.stringify(simple || "")).length + 40;
    // console.log('bytesForSimple: ', bytesForSimple)
    // Bytes for the FT data
    let bytesForFT = Buffer.from(JSON.stringify(ft || "")).length + 40;
    // console.log('bytesForFT: ', bytesForFT)
    // Bytes for the NFT data
    let bytesForNFT = Buffer.from(JSON.stringify(nft || "")).length + 40;
    // console.log('bytesForNFT: ', bytesForNFT)
    // Bytes for the FC data
    let bytesForFC = Buffer.from(JSON.stringify(fc || "")).length + 40;
    // console.log('bytesForFC: ', bytesForFC)
    // Bytes for the passwords per use
    // Magic numbers come from plotting SDK data against protocol data and finding the best fit
    let bytesForPasswords = Buffer.from(JSON.stringify(passwords_per_use || "")).length * 4;
    // console.log('bytesForPasswords: ', bytesForPasswords)
    totalBytes +=
        totalBytesForKeys +
            bytesForDeposit +
            bytesForDropId +
            bytesForConfig +
            bytesForMetadata +
            bytesForSimple +
            bytesForFT +
            bytesForNFT +
            bytesForFC +
            bytesForPasswords;
    // console.log('totalBytes: ', totalBytes)
    // Add a 30% buffer to the total bytes
    totalBytes = Math.round(totalBytes * 1.3);
    // console.log('totalBytes Rounded: ', totalBytes)
    let totalNEARAmount = totalBytes * storageCostNEARPerByte;
    // console.log('totalNEARAmount BEFORE: ', totalNEARAmount)
    // Accounting for protocol storage for access keys
    // Magic numbers come from plotting SDK data against protocol data and finding the best fit
    totalNEARAmount += ((public_keys === null || public_keys === void 0 ? void 0 : public_keys.length) || 0) * 0.005373134328 + 0.00376;
    // console.log('totalNEARAmount AFTER pk: ', totalNEARAmount.toString())
    // Multi use passwords need a little extra storage
    if (passwords_per_use) {
        totalNEARAmount +=
            -0.00155 * (((config === null || config === void 0 ? void 0 : config.uses_per_key) || 1) - 1) + 0.00285687;
        // console.log('totalNEARAmount AFTER pw per use conversion: ', totalNEARAmount.toString())
    }
    // Turns it into yocto
    return (0, utils_1.parseNearAmount)(totalNEARAmount.toString());
};
exports.getStorageBase = getStorageBase;
/** Initiate the connection to the NEAR blockchain. @group Utility */
const estimateRequiredDeposit = ({ near, depositPerUse, numKeys, usesPerKey, attachedGas, storage = (0, utils_1.parseNearAmount)("0.034"), keyStorage = (0, utils_1.parseNearAmount)("0.0065"), fcData, ftData, }) => __awaiter(void 0, void 0, void 0, function* () {
    const numKeysBN = new bn_js_1.default(numKeys.toString());
    const usesPerKeyBN = new bn_js_1.default(usesPerKey.toString());
    let totalRequiredStorage = new bn_js_1.default(storage).add(new bn_js_1.default(keyStorage).mul(numKeysBN));
    // console.log('totalRequiredStorage: ', totalRequiredStorage.toString())
    let actualAllowance = estimatePessimisticAllowance(attachedGas).mul(usesPerKeyBN);
    // console.log('actualAllowance: ', actualAllowance.toString())
    let totalAllowance = actualAllowance.mul(numKeysBN);
    // console.log('totalAllowance: ', totalAllowance.toString())
    let totalAccessKeyStorage = ACCESS_KEY_STORAGE.mul(numKeysBN);
    // console.log('totalAccessKeyStorage: ', totalAccessKeyStorage.toString())
    let { numNoneFcs, depositRequiredForFcDrops } = getNoneFcsAndDepositRequired(fcData, usesPerKey);
    let totalDeposits = new bn_js_1.default(depositPerUse)
        .mul(new bn_js_1.default(usesPerKey - numNoneFcs))
        .mul(numKeysBN);
    // console.log('totalDeposits: ', totalDeposits.toString())
    let totalDepositsForFc = depositRequiredForFcDrops.mul(numKeysBN);
    // console.log('totalDepositsForFc: ', totalDepositsForFc.toString())
    let requiredDeposit = totalRequiredStorage
        .add(totalAllowance)
        .add(totalAccessKeyStorage)
        .add(totalDeposits)
        .add(totalDepositsForFc);
    // console.log('requiredDeposit B4 FT costs: ', requiredDeposit.toString())
    if (ftData === null || ftData === void 0 ? void 0 : ftData.contractId) {
        let extraFtCosts = yield getFtCosts(near, numKeys, usesPerKey, ftData === null || ftData === void 0 ? void 0 : ftData.contractId);
        requiredDeposit = requiredDeposit.add(new bn_js_1.default(extraFtCosts));
        // console.log('requiredDeposit AFTER FT costs: ', requiredDeposit.toString())
    }
    return requiredDeposit.toString() || "0";
});
exports.estimateRequiredDeposit = estimateRequiredDeposit;
// Estimate the amount of allowance required for a given attached gas.
const estimatePessimisticAllowance = (attachedGas) => {
    if (typeof attachedGas !== "number")
        attachedGas = parseInt(attachedGas);
    // Get the number of CCCs you can make with the attached GAS
    let numCCCs = Math.floor(attachedGas / GAS_PER_CCC);
    // console.log('numCCCs: ', numCCCs)
    // Get the constant used to pessimistically calculate the required allowance
    let powOutcome = Math.pow(1.03, numCCCs);
    // console.log('powOutcome: ', powOutcome)
    let requiredGas = (attachedGas + RECEIPT_GAS_COST) * powOutcome + RECEIPT_GAS_COST;
    // console.log('requiredGas: ', requiredGas)
    let requiredAllowance = new bn_js_1.default(requiredGas).mul(new bn_js_1.default(YOCTO_PER_GAS));
    // console.log('requiredAllowance: ', requiredAllowance.toString())
    return requiredAllowance;
};
// Estimate the amount of allowance required for a given attached gas.
const getNoneFcsAndDepositRequired = (fcData, usesPerKey) => {
    let depositRequiredForFcDrops = new bn_js_1.default(0);
    let numNoneFcs = 0;
    if (!fcData || Object.keys(fcData).length === 0) {
        return { numNoneFcs, depositRequiredForFcDrops };
    }
    let numMethodData = fcData.methods.length;
    // If there's one method data specified and more than 1 claim per key, that data is to be used
    // For all the claims. In this case, we need to tally all the deposits for each method in all method data.
    if (usesPerKey > 1 && numMethodData == 1) {
        let methodData = fcData.methods[0];
        // Keep track of the total attached deposit across all methods in the method data
        let attachedDeposit = new bn_js_1.default(0);
        for (let i = 0; i < ((methodData === null || methodData === void 0 ? void 0 : methodData.length) || 0); i++) {
            attachedDeposit = attachedDeposit.add(new bn_js_1.default(methodData[i].attachedDeposit));
        }
        depositRequiredForFcDrops = depositRequiredForFcDrops
            .add(new bn_js_1.default(attachedDeposit))
            .mul(new bn_js_1.default(usesPerKey));
        return {
            numNoneFcs,
            depositRequiredForFcDrops,
        };
    }
    // In the case where either there's 1 claim per key or the number of FCs is not 1,
    // We can simply loop through and manually get this data
    for (let i = 0; i < numMethodData; i++) {
        let methodData = fcData.methods[i];
        let isNoneFc = methodData == null;
        numNoneFcs += isNoneFc ? 1 : 0;
        if (!isNoneFc) {
            // Keep track of the total attached deposit across all methods in the method data
            let attachedDeposit = new bn_js_1.default(0);
            for (let j = 0; j < ((methodData === null || methodData === void 0 ? void 0 : methodData.length) || 0); j++) {
                attachedDeposit = attachedDeposit.add(new bn_js_1.default(methodData[j].attachedDeposit));
            }
            depositRequiredForFcDrops =
                depositRequiredForFcDrops.add(attachedDeposit);
        }
    }
    return {
        numNoneFcs,
        depositRequiredForFcDrops,
    };
};
// Estimate the amount of allowance required for a given attached gas.
const getFtCosts = (near, numKeys, usesPerKey, ftContract) => __awaiter(void 0, void 0, void 0, function* () {
    const viewAccount = yield near.account("foo");
    const { min } = yield viewAccount.viewFunction({
        contractId: ftContract,
        methodName: "storage_balance_bounds",
        args: {},
    });
    // console.log('storageBalanceBounds: ', storageBalanceBounds)
    let costs = new bn_js_1.default(min)
        .mul(new bn_js_1.default(numKeys))
        .mul(new bn_js_1.default(usesPerKey))
        .add(new bn_js_1.default(min));
    // console.log('costs: ', costs.toString());
    return costs.toString() || "0";
});
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
function generatePerUsePasswords({ publicKeys, uses, basePassword, }) {
    return __awaiter(this, void 0, void 0, function* () {
        let passwords = [];
        // Loop through each pubKey to generate either the passwords
        for (var i = 0; i < publicKeys.length; i++) {
            // For each public key, we need to generate a password for each use
            let passwordsPerUse = [];
            for (var j = 0; j < uses.length; j++) {
                // First inner hash takes in utf8 and returns hash
                let innerHashBuff = yield hashBuf(basePassword + publicKeys[i] + uses[j].toString());
                let innerHash = Buffer.from(innerHashBuff).toString("hex");
                // Outer hash takes in hex and returns hex
                let outerHashBuff = yield hashBuf(innerHash, true);
                let outerHash = Buffer.from(outerHashBuff).toString("hex");
                let jsonPw = {
                    pw: outerHash,
                    key_use: uses[j],
                };
                passwordsPerUse.push(jsonPw);
            }
            passwords.push(passwordsPerUse);
        }
        return passwords;
    });
}
exports.generatePerUsePasswords = generatePerUsePasswords;
// Taken from https://stackoverflow.com/a/61375162/16441367
const snakeToCamel = (str) => str
    .toLowerCase()
    .replace(/([-_][a-z])/g, (group) => group.toUpperCase().replace("-", "").replace("_", ""));
exports.snakeToCamel = snakeToCamel;
// Taken from https://stackoverflow.com/a/26215431/16441367
const toCamel = (o) => {
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
                if (value instanceof Array ||
                    (value !== null && value.constructor === Object)) {
                    value = (0, exports.toCamel)(value);
                }
                newO[newKey] = value;
            }
        }
    }
    return newO;
};
exports.toCamel = toCamel;
const nearArgsToYocto = (nearAmount, yoctoAmount) => {
    let yoctoToReturn = yoctoAmount || "0";
    if (nearAmount) {
        yoctoToReturn = (0, utils_1.parseNearAmount)(nearAmount.toString()) || "0";
    }
    return yoctoToReturn;
};
exports.nearArgsToYocto = nearArgsToYocto;
const convertBasicTransaction = ({ txnInfo, signerId, signerPk }) => __awaiter(void 0, void 0, void 0, function* () {
    const { near } = (0, keypom_1.getEnv)();
    const account = new accounts_1.Account(near.connection, signerId);
    const { provider } = account.connection;
    const actions = txnInfo.actions.map((action) => (0, exports.createAction)(action));
    const block = yield provider.block({ finality: "final" });
    const accessKey = yield provider.query(`access_key/${signerId}/${signerPk}`, "");
    return (0, transactions_1.createTransaction)(signerId, signerPk, txnInfo.receiverId, accessKey.nonce + 1, actions, (0, borsh_1.baseDecode)(block.header.hash));
});
exports.convertBasicTransaction = convertBasicTransaction;
const createTransactions = ({ txnInfos, signerId, signerPk }) => {
    const { near } = (0, keypom_1.getEnv)();
    return Promise.all(txnInfos.map((txnInfo, index) => __awaiter(void 0, void 0, void 0, function* () {
        const account = new accounts_1.Account(near.connection, signerId);
        const { provider } = account.connection;
        const actions = txnInfo.actions.map((action) => (0, exports.createAction)(action));
        const block = yield provider.block({ finality: "final" });
        const accessKey = yield provider.query(`access_key/${signerId}/${signerPk}`, "");
        return (0, transactions_1.createTransaction)(signerId, signerPk, txnInfo.receiverId, accessKey.nonce + index + 1, actions, (0, borsh_1.baseDecode)(block.header.hash));
    })));
};
exports.createTransactions = createTransactions;
