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
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateKeypomContractId = exports.updateFunder = exports.initKeypom = exports.execute = exports.getEnv = exports.accountMappingContract = exports.supportedLinkdropClaimPages = exports.supportedKeypomContracts = exports.networks = void 0;
const accounts_1 = require("@near-js/accounts");
const crypto_1 = require("@near-js/crypto");
const keystores_1 = require("@near-js/keystores");
const keystores_browser_1 = require("@near-js/keystores-browser");
const wallet_account_1 = require("@near-js/wallet-account");
const near_seed_phrase_1 = require("near-seed-phrase");
const checks_1 = require("./checks");
const keypom_utils_1 = require("./keypom-utils");
const gas = "200000000000000";
const gas300 = "300000000000000";
const attachedGas = "100000000000000";
exports.networks = {
    mainnet: {
        networkId: "mainnet",
        viewAccountId: "near",
        nodeUrl: "https://rpc.mainnet.near.org",
        walletUrl: "https://wallet.near.org",
        helperUrl: "https://helper.mainnet.near.org",
    },
    testnet: {
        networkId: "testnet",
        viewAccountId: "testnet",
        nodeUrl: "https://rpc.testnet.near.org",
        walletUrl: "https://wallet.testnet.near.org",
        helperUrl: "https://helper.testnet.near.org",
    },
    localnet: {
        networkId: "localnet",
        viewAccountId: "test.near",
    },
};
/**
 * List of supported Keypom contracts that can be used with the SDK.
 *
 * @group Keypom SDK Environment
 */
exports.supportedKeypomContracts = {
    mainnet: {
        "v1.keypom.near": false,
        "v1-3.keypom.near": false,
        "v1-4.keypom.near": false,
        "v2.keypom.near": false,
        "v3.keypom.near": false,
    },
    testnet: {
        "v1.keypom.testnet": false,
        "v1-3.keypom.testnet": false,
        "v1-4.keypom.testnet": false,
        "v2.keypom.testnet": false,
        "v3.keypom.testnet": true,
    },
    localnet: {
        "keypom.test.near": true,
    },
};
/**
 * Official linkdrop claim pages for wallets and other applications
 *
 * @group Keypom SDK Environment
 */
exports.supportedLinkdropClaimPages = {
    mainnet: {
        mynearwallet: "https://app.mynearwallet.com/linkdrop/CONTRACT_ID/SECRET_KEY",
        keypom: "https://keypom.xyz/claim/CONTRACT_ID#SECRET_KEY",
        meteor: "https://wallet.meteorwallet.app/linkdrop/CONTRACT_ID/SECRET_KEY",
    },
    testnet: {
        mynearwallet: "https://testnet.mynearwallet.com/linkdrop/CONTRACT_ID/SECRET_KEY",
        keypom: "https://testnet.keypom.xyz/claim/CONTRACT_ID#SECRET_KEY",
        meteor: "https://wallet.meteorwallet.app/linkdrop/CONTRACT_ID/SECRET_KEY",
    },
};
/**
 * Recovery mapping contracts used to keep track of trial account IDs for given public keys.
 *
 * @group Keypom SDK Environment
 */
exports.accountMappingContract = {
    mainnet: "v1.mapping.keypom.near",
    testnet: "v1.mapping.keypom.testnet",
};
const contractBase = "v3.keypom";
let contractId = `${contractBase}.testnet`;
let receiverId = contractId;
let near = undefined;
let connection = undefined;
let keyStore = undefined;
let networkId = undefined;
let fundingAccount = undefined;
let fundingAccountDetails = undefined;
let contractAccount = undefined;
let viewAccount = undefined;
let viewCall = undefined;
/**
 *
 * @returns {EnvVars} The environment variables used by the Keypom library.
 * @group Keypom SDK Environment
 */
const getEnv = () => {
    (0, checks_1.assert)(near, "Keypom uninitialized. Please call initKeypom or initKeypomContext");
    return {
        near,
        connection,
        keyStore,
        networkId,
        fundingAccount,
        contractAccount,
        viewAccount,
        fundingAccountDetails,
        gas,
        gas300,
        attachedGas,
        contractId,
        receiverId,
        getAccount,
        execute: exports.execute,
        supportedKeypomContracts: exports.supportedKeypomContracts,
        viewCall,
    };
};
exports.getEnv = getEnv;
/** @group Utility */
const execute = (args) => __awaiter(void 0, void 0, void 0, function* () { return (0, keypom_utils_1.execute)(Object.assign(Object.assign({}, args), { fundingAccount })); });
exports.execute = execute;
const getAccount = ({ account, wallet, }) => __awaiter(void 0, void 0, void 0, function* () {
    if (wallet) {
        wallet = yield wallet;
        (0, checks_1.assert)(wallet.signAndSendTransactions, "Incorrect wallet type");
        wallet.accountId = (yield wallet.getAccounts())[0].accountId;
    }
    const returnedAccount = account || wallet || fundingAccount;
    // If neither a wallet object, account object, or funding account is provided, throw an error
    (0, checks_1.assert)(returnedAccount, "No account provided. Either pass in an account object, wallet object, or initialize Keypom with a funding account");
    return returnedAccount;
});
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
const initKeypom = ({ near: _near, network, funder, keypomContractId, }) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // Assert that either a near object or network is passed in
    (0, checks_1.assert)(_near || network, "Either a NEAR connection object or network must be passed in.");
    if (network != undefined) {
        (0, checks_1.assert)(network == "testnet" || network == "mainnet" || "localnet", "Network must be either `testnet` or `mainnet` or `localnet`");
        // Assert that if network was passed in as "localnet", a near object should also be passed in
        (0, checks_1.assert)(network != "localnet" || _near, "If network is `localnet`, a NEAR connection object must be passed in.");
    }
    if (_near) {
        (0, checks_1.assert)((0, checks_1.isValidNearObject)(_near), "The NEAR object passed in is not valid. Please pass in a valid NEAR object.");
        near = _near;
        keyStore = near.config.keyStore;
    }
    else {
        const networkConfig = typeof network === "string" ? exports.networks[network] : network;
        keyStore = ((_a = process === null || process === void 0 ? void 0 : process.versions) === null || _a === void 0 ? void 0 : _a.node)
            ? new keystores_1.InMemoryKeyStore()
            : new keystores_browser_1.BrowserLocalStorageKeyStore();
        near = new wallet_account_1.Near(Object.assign(Object.assign({}, networkConfig), { keyStore }));
    }
    connection = near.connection;
    networkId = near.config.networkId;
    if (networkId === "mainnet") {
        contractId = receiverId = `${contractBase}.near`;
    }
    if (networkId === "localnet") {
        contractId = receiverId = "keypom.test.near";
    }
    if (keypomContractId) {
        (0, checks_1.assert)((0, checks_1.isValidKeypomContract)(keypomContractId) === true, "The keypom contract passed in must be an official Keypom contract for the given network.");
        if ((0, checks_1.isSupportedKeypomContract)(keypomContractId) !== true) {
            console.warn("The Keypom contract you are using is not the latest version. Most methods will be unavailable. Please use the latest contract: v1-3.keypom.near or v1-3.keypom.testnet");
        }
        contractId = receiverId = keypomContractId;
    }
    viewAccount = new accounts_1.Account(connection, exports.networks[networkId].viewAccountId);
    viewCall = viewAccount.viewFunction2 = ({ contractId, methodName, args }) => viewAccount.viewFunction({ contractId, methodName, args });
    contractAccount = new accounts_1.Account(connection, contractId);
    if (funder) {
        yield (0, exports.updateFunder)({ funder });
    }
    return null;
});
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
const updateFunder = ({ funder }) => __awaiter(void 0, void 0, void 0, function* () {
    (0, checks_1.assert)(near !== undefined, "You must initialize the SDK via `initKeypom` before updating the funder account.");
    (0, checks_1.assert)((0, checks_1.isValidFunderObject)(funder), "The funder object passed in is not valid. Please pass in a valid funder object.");
    (0, checks_1.assert)(funder.secretKey || funder.seedPhrase, "The funder object passed in must have either a secretKey or seedphrase");
    const accountId = funder.accountId;
    const seedPhrase = funder.seedPhrase;
    let secretKey = funder.secretKey;
    if (seedPhrase) {
        secretKey = (0, near_seed_phrase_1.parseSeedPhrase)(seedPhrase).secretKey;
    }
    funder.fundingKeyPair = crypto_1.KeyPair.fromString(secretKey);
    yield keyStore.setKey(networkId, accountId, funder.fundingKeyPair);
    fundingAccountDetails = funder;
    fundingAccount = new accounts_1.Account(connection, accountId);
    return null;
});
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
 *	updateKeypomContractId({
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
const updateKeypomContractId = ({ keypomContractId, }) => {
    (0, checks_1.assert)(near !== undefined, "You must initialize the SDK via `initKeypom` before updating the Keypom contract ID.");
    (0, checks_1.assert)((0, checks_1.isValidKeypomContract)(keypomContractId) === true, "The keypom contract passed in must be an official Keypom contract for the given network.");
    if ((0, checks_1.isSupportedKeypomContract)(keypomContractId) !== true) {
        console.warn("The Keypom contract you are using is not the latest version. Most methods will be unavailable. Please use the latest contract: v1-3.keypom.near or v1-3.keypom.testnet");
    }
    contractId = receiverId = keypomContractId;
    contractAccount = new accounts_1.Account(connection, contractId);
    return null;
};
exports.updateKeypomContractId = updateKeypomContractId;
