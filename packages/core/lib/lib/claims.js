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
exports.claim = void 0;
const crypto_1 = require("@near-js/crypto");
const checks_1 = require("./checks");
const transactions_1 = require("@near-js/transactions");
const keypom_1 = require("./keypom");
const keypom_utils_1 = require("./keypom-utils");
const views_1 = require("./views");
/**
 * Allows a specific Keypom drop to be claimed via the secret key.
 *
 * @example
 * Creating a simple $NEAR drop and claiming to an existing account:
 * ```js
 * // Initialize the SDK for the given network and NEAR connection
 * await initKeypom({
 * 	network: "testnet",
 * 	funder: {
 * 		accountId: "benji_demo.testnet",
 * 		secretKey: "ed25519:5yARProkcALbxaSQ66aYZMSBPWL9uPBmkoQGjV3oi2ddQDMh1teMAbz7jqNV9oVyMy7kZNREjYvWPqjcA6LW9Jb1"
 * 	}
 * });
 *
 * // create 1 keys with no entropy (random key)
 * const {publicKeys, secretKeys} = await generateKeys({
 * 	numKeys: 1
 * });
 *
 * // Create a simple drop with 1 $NEAR
 * await createDrop({
 * 	publicKeys,
 * 	depositPerUseNEAR: 1,
 * });
 *
 * // Claim the drop to the passed in account ID
 * await claim({
 * 	secretKey: secretKeys[0],
 * 	accountId: "benjiman.testnet"
 * })
 * ```
 *
 * @example
 * Creating a simple $NEAR drop and using it to create a brand new NEAR account:
 * ```js
 * // Initialize the SDK for the given network and NEAR connection
 * await initKeypom({
 * 	network: "testnet",
 * 	funder: {
 * 		accountId: "benji_demo.testnet",
 * 		secretKey: "ed25519:5yARProkcALbxaSQ66aYZMSBPWL9uPBmkoQGjV3oi2ddQDMh1teMAbz7jqNV9oVyMy7kZNREjYvWPqjcA6LW9Jb1"
 * 	}
 * });
 *
 * // create 2 keys with no entropy (all random). The first will be used for the drop and the second
 * // will be used as the full access key for the newly created account
 * const {publicKeys, secretKeys} = await generateKeys({
 * 	numKeys: 2
 * });
 *
 * // Create a simple drop with 1 $NEAR
 * await createDrop({
 * 	publicKeys: [publicKeys[0]],
 * 	depositPerUseNEAR: 1,
 * });
 *
 * // Claim the drop and create a new account
 * await claim({
 * 	secretKey: secretKeys[0],
 * 	newAccountId: "my-newly-creating-account.testnet",
 * 	newPublicKey: publicKeys[1]
 * })
 * ```
 *
 * @example
 * Creating a drop and adding a password to it. Generate the password using the hash function and pass it into claim the drop:
 * ```js
 * // Initialize the SDK for the given network and NEAR connection
 * await initKeypom({
 * 	network: "testnet",
 * 	funder: {
 * 		accountId: "benji_demo.testnet",
 * 		secretKey: "ed25519:5yARProkcALbxaSQ66aYZMSBPWL9uPBmkoQGjV3oi2ddQDMh1teMAbz7jqNV9oVyMy7kZNREjYvWPqjcA6LW9Jb1"
 * 	}
 * });
 *
 *
 * const basePassword = "my-cool-password123";
 * // Create a simple drop with 1 $NEAR and pass in a base password to create a unique password for each use of each key
 * const {keys} = await createDrop({
 * 	numKeys: 1,
 * 	depositPerUseNEAR: 1,
 * 	basePassword
 * });
 *
 * // Create the password to pass into claim which is a hash of the basePassword, public key and whichever use we are on
 * let currentUse = 1;
 * let passwordForClaim = await hashPassword(basePassword + keys.publicKeys[0] + currentUse.toString());
 *
 * // Claim the drop to the passed in account ID and use the password we generated above.
 * await claim({
 * 	secretKey: keys.secretKeys[0],
 * 	accountId: "benjiman.testnet",
 * 	password: passwordForClaim
 * })
 * ```
 * @group Creating, And Claiming Drops
 */
const claim = ({ secretKey, accountId, newAccountId, newPublicKey, password, fcArgs, }) => __awaiter(void 0, void 0, void 0, function* () {
    const { networkId, keyStore, contractId, contractAccount, receiverId, execute, } = (0, keypom_1.getEnv)();
    const keyPair = crypto_1.KeyPair.fromString(secretKey);
    yield keyStore.setKey(networkId, contractId, keyPair);
    (0, checks_1.assert)(secretKey, 'A secretKey must be passed in.');
    (0, checks_1.assert)(!newAccountId || newPublicKey, 'If creating a new account, a newPublicKey must be passed in.');
    const dropInfo = yield (0, views_1.getDropInformation)({ secretKey });
    const attachedGas = dropInfo.required_gas;
    let curMethodData;
    if (dropInfo.fc) {
        curMethodData = yield (0, views_1.getCurMethodData)({ secretKey });
        if (curMethodData == null) {
            accountId = 'none';
        }
    }
    if (fcArgs) {
        (0, checks_1.assert)(dropInfo.fc, 'Cannot pass in fcArgs for non-FC drops.');
        (0, checks_1.assert)((curMethodData || []).length === fcArgs.length, 'The number of fcArgs must match the number of methods being executed.');
    }
    (0, checks_1.assert)(newAccountId || accountId, 'Either an accountId or newAccountId must be passed in.');
    const fcAction = newAccountId
        ? {
            methodName: 'create_account_and_claim',
            args: (0, transactions_1.stringifyJsonOrBytes)({
                new_account_id: newAccountId,
                new_public_key: newPublicKey,
                password,
                fc_args: fcArgs,
            }),
            gas: attachedGas,
            deposit: '0',
        }
        : {
            methodName: 'claim',
            args: (0, transactions_1.stringifyJsonOrBytes)({
                account_id: accountId,
                password,
                fc_args: fcArgs,
            }),
            gas: attachedGas,
            deposit: '0',
        };
    const txn = yield (0, keypom_utils_1.convertBasicTransaction)({
        txnInfo: {
            receiverId,
            signerId: contractId,
            actions: [
                {
                    enum: 'FunctionCall',
                    functionCall: fcAction,
                },
            ],
        },
        signerId: contractId,
        signerPk: keyPair.getPublicKey(),
    });
    const result = yield execute({
        transactions: [txn],
        account: contractAccount,
    });
    return result;
});
exports.claim = claim;
