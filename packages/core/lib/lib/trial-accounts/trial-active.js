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
exports.canExitTrial = exports.trialCallMethod = exports.trialSignAndSendTxns = void 0;
//import { KeyPair } from "near-api-js";
const keypom_1 = require("../keypom");
const keypom_utils_1 = require("../keypom-utils");
const utils_1 = require("./utils");
const crypto_1 = require("@near-js/crypto");
const transactions_1 = require("@near-js/transactions");
/**
 * Execute a transaction that can contain multiple actions using a trial account. If the trial account is in the exit state, this will throw an error. Similarly, if any action
 * cannot be executed by the trial account (e.g. the attached deposit exceeds the trial account's restrictions), this will throw an error.
 *
 * @returns {Promise<FinalExecutionOutcome[]>} The outcomes of the transactions
 *
 * @example
 * Use a Trial Account to min2
 * ```js
 * await initKeypom({
 *        // near,
 *        network: 'testnet',
 *        funder: {
 *            accountId: fundingAccountId,
 *            secretKey: fundingAccountSecretKey,
 *        }
 *    });
 *
 *    const callableContracts = [
 *        `nft.examples.testnet`
 *    ]
 *
 *    const {dropId, keys: {secretKeys: trialSecretKeys, publicKeys: trialPublicKeys}}
 *    = await createTrialAccountDrop({
 *        numKeys: 1,
 *        contractBytes: [...readFileSync('./test/ext-wasm/trial-accounts.wasm')],
 *        startingBalanceNEAR: 0.5,
 *        callableContracts: callableContracts,
 *        callableMethods: ['*'],
 *        maxAttachableNEARPerContract: [1],
 *        trialEndFloorNEAR: 0.33 + 0.3
 *    })
 *
 *    const desiredAccountId = `${dropId}-keypom.testnet`
 *    const trialSecretKey = trialSecretKeys[0]
 *    await claimTrialAccountDrop({
 *        desiredAccountId,
 *        secretKey: trialSecretKeys[0],
 *    })
 *
 *    console.log('desiredAccountId: ', desiredAccountId)
 *    console.log(`trialSecretKey: ${JSON.stringify(trialSecretKey)}`)
 *    const txns = [{
 *        receiverId: callableContracts[0],
 *        actions: [
 *            {
 *                type: 'FunctionCall',
 *                params: {
 *                    methodName: 'nft_mint',
 *                    args: {
 *                        token_id: 'tokenId-keypom-1',
 *                        receiver_id: 'foo.testnet',
 *                        metadata: {
 *                            title: 'test1',
 *                            description: 'test1',
 *                            media: 'test1',
 *                        }
 *                    },
 *                    gas: '30000000000000',
 *                    deposit: parseNearAmount('0.1')
 *                },
 *            },
 *            {
 *                type: 'FunctionCall',
 *                params: {
 *                    methodName: 'nft_mint',
 *                    args: {
 *                        token_id: 'tokenId-keypom-2',
 *                        receiver_id: 'foo.testnet',
 *                        metadata: {
 *                            title: 'test2',
 *                            description: 'test2',
 *                            media: 'test2',
 *                        }
 *                    },
 *                    gas: '30000000000000',
 *                    deposit: parseNearAmount('0.1')
 *                },
 *            },
 *        ],
 *    }];
 *
 *    await trialSignAndSendTxns({
 *        trialAccountId: desiredAccountId,
 *        trialAccountSecretKey: trialSecretKey,
 *        txns
 *    })
 * ```
 *
 * @group Trial Accounts
 */
const trialSignAndSendTxns = ({ trialAccountId, trialAccountSecretKey, txns, }) => __awaiter(void 0, void 0, void 0, function* () {
    const { near, keyStore, networkId } = (0, keypom_1.getEnv)();
    const exitExpected = yield (0, exports.canExitTrial)({ trialAccountId });
    if (exitExpected == true) {
        throw utils_1.TRIAL_ERRORS.EXIT_EXPECTED;
    }
    const { methodDataToValidate, executeArgs, totalAttachedYocto, totalGasForTxns, } = yield (0, utils_1.generateExecuteArgs)({ desiredTxns: txns });
    const isValidTxn = yield (0, utils_1.validateDesiredMethods)({
        methodData: methodDataToValidate,
        trialAccountId,
    });
    console.log("isValidTxn: ", isValidTxn);
    if (isValidTxn == false) {
        throw utils_1.TRIAL_ERRORS.INVALID_ACTION;
    }
    const hasBal = yield (0, utils_1.hasEnoughBalance)({
        trialAccountId,
        totalAttachedYocto,
        totalGasForTxns,
    });
    if (hasBal == false) {
        throw utils_1.TRIAL_ERRORS.INSUFFICIENT_BALANCE;
    }
    const trialKeyPair = crypto_1.KeyPair.fromString(trialAccountSecretKey);
    const pubKey = trialKeyPair.getPublicKey();
    yield keyStore.setKey(networkId, trialAccountId, trialKeyPair);
    const account = yield near.account(trialAccountId);
    const gasToAttach = (0, utils_1.estimateTrialGas)({ executeArgs });
    const transformedTransactions = yield (0, keypom_utils_1.createTransactions)({
        signerId: trialAccountId,
        signerPk: pubKey,
        txnInfos: [
            {
                receiverId: account.accountId,
                signerId: trialAccountId,
                actions: [
                    {
                        enum: "FunctionCall",
                        functionCall: {
                            methodName: "execute",
                            args: (0, transactions_1.stringifyJsonOrBytes)(executeArgs),
                            gas: gasToAttach,
                            deposit: '0',
                        }
                    },
                ],
            },
        ],
    });
    console.log("debugging");
    console.log("transformedTransactions: ", transformedTransactions);
    const promises = transformedTransactions.map((tx) => account.signAndSendTransaction(tx));
    return (yield Promise.all(promises));
});
exports.trialSignAndSendTxns = trialSignAndSendTxns;
/**
 * Execute a method using a trial account. If the trial account is in the exit state, this will throw an error. Similarly, if the given method data
 * cannot be executed by the trial account (e.g. the attached deposit exceeds the trial account's restrictions), this will throw an error.
 *
 * @returns {Promise<FinalExecutionOutcome[]>} The outcome of the transaction
 *
 * @example
 * Using a trial account to mint a new NFT:
 * ```js
 *     await initKeypom({
 *		network: 'testnet',
 *		funder: {
 *			accountId: fundingAccountId,
 *			secretKey: fundingAccountSecretKey,
 *		}
 *	});
 *
 *    const callableContracts = [
 *        `nft.examples.testnet`
 *    ]
 *
 *    const {dropId, keys: {secretKeys: trialSecretKeys, publicKeys: trialPublicKeys}}
 *    = await createTrialAccountDrop({
 *        numKeys: 1,
 *        contractBytes: [...readFileSync('./test/ext-wasm/trial-accounts.wasm')],
 *        startingBalanceNEAR: 0.5,
 *        callableContracts: callableContracts,
 *        callableMethods: ['*'],
 *        maxAttachableNEARPerContract: [1],
 *        trialEndFloorNEAR: 0.33 + 0.3
 *    })
 *
 *    const desiredAccountId = `${dropId}-keypom.testnet`
 *    const trialSecretKey = trialSecretKeys[0]
 *    await claimTrialAccountDrop({
 *        desiredAccountId,
 *        secretKey: trialSecretKeys[0],
 *    })
 *
 *    console.log('desiredAccountId: ', desiredAccountId)
 *    console.log(`trialSecretKey: ${JSON.stringify(trialSecretKey)}`)
 *
 *    await trialCallMethod({
 *        trialAccountId: desiredAccountId,
 *        trialAccountSecretKey: trialSecretKey,
 *        contractId: callableContracts[0],
 *        methodName: 'nft_mint',
 *        args: {
 *            token_id: 'asdkasldkjasdlkajsldajsldaskjd',
 *            receiver_id: 'foo.testnet',
 *            metadata: {
 *                title: 'test',
 *                description: 'test',
 *                media: 'test',
 *            }
 *        },
 *        attachedDeposit: parseNearAmount('0.1'),
 *        attachedGas: '30000000000000',
 *    })
 * ```
 * @group Trial Accounts
 */
const trialCallMethod = ({ trialAccountId, trialAccountSecretKey, contractId, methodName, args, attachedGas, attachedDeposit, }) => __awaiter(void 0, void 0, void 0, function* () {
    const { near, keyStore, networkId } = (0, keypom_1.getEnv)();
    const exitExpected = yield (0, exports.canExitTrial)({ trialAccountId });
    if (exitExpected == true) {
        throw utils_1.TRIAL_ERRORS.EXIT_EXPECTED;
    }
    const txns = [
        {
            receiverId: contractId,
            actions: [
                {
                    type: "FunctionCall",
                    params: {
                        methodName,
                        args,
                        gas: attachedGas,
                        deposit: attachedDeposit,
                    },
                },
            ],
        },
    ];
    console.log(`txns: ${JSON.stringify(txns)}`);
    const { methodDataToValidate, executeArgs, totalAttachedYocto, totalGasForTxns, } = yield (0, utils_1.generateExecuteArgs)({ desiredTxns: txns });
    const isValidTxn = yield (0, utils_1.validateDesiredMethods)({
        methodData: methodDataToValidate,
        trialAccountId,
    });
    console.log("isValidTxn: ", isValidTxn);
    if (isValidTxn == false) {
        throw utils_1.TRIAL_ERRORS.INVALID_ACTION;
    }
    const hasBal = yield (0, utils_1.hasEnoughBalance)({
        trialAccountId,
        totalAttachedYocto,
        totalGasForTxns,
    });
    if (hasBal == false) {
        throw utils_1.TRIAL_ERRORS.INSUFFICIENT_BALANCE;
    }
    const trialKeyPair = crypto_1.KeyPair.fromString(trialAccountSecretKey);
    const pubKey = trialKeyPair.getPublicKey();
    yield keyStore.setKey(networkId, trialAccountId, trialKeyPair);
    const account = yield near.account(trialAccountId);
    const gasToAttach = (0, utils_1.estimateTrialGas)({ executeArgs });
    const transformedTransactions = yield (0, keypom_utils_1.createTransactions)({
        signerId: trialAccountId,
        signerPk: pubKey,
        txnInfos: [
            {
                receiverId: account.accountId,
                signerId: trialAccountId,
                actions: [
                    {
                        enum: "FunctionCall",
                        functionCall: {
                            methodName: "execute",
                            args: (0, transactions_1.stringifyJsonOrBytes)(executeArgs),
                            gas: gasToAttach,
                            deposit: '0',
                        }
                    },
                ],
            },
        ],
    });
    console.log("debugging");
    console.log("transformedTransactions: ", transformedTransactions);
    const promises = transformedTransactions.map((tx) => account.signAndSendTransaction(tx));
    return (yield Promise.all(promises));
});
exports.trialCallMethod = trialCallMethod;
/**
 * Check whether a trial account is able to exit their trial state and become a fully fledged normal account.
 *
 * @example
 * Create a trial account and check whether it can immediately exit
 * ```js
 *     await initKeypom({
 *        // near,
 *        network: 'testnet',
 *        funder: {
 *            accountId: fundingAccountId,
 *            secretKey: fundingAccountSecretKey,
 *        }
 *    });
 *
 *    const callableContracts = [
 *        `nft.examples.testnet`
 *    ]
 *
 *    const {dropId, keys: {secretKeys: trialSecretKeys, publicKeys: trialPublicKeys}}
 *    = await createTrialAccountDrop({
 *        numKeys: 1,
 *        contractBytes: [...readFileSync('./test/ext-wasm/trial-accounts.wasm')],
 *        startingBalanceNEAR: 0.5,
 *        callableContracts: callableContracts,
 *        callableMethods: ['*'],
 *        maxAttachableNEARPerContract: [1],
 *        trialEndFloorNEAR: 0.33 + 0.3
 *    })
 *
 *    const desiredAccountId = `${dropId}-keypom.testnet`
 *    const trialSecretKey = trialSecretKeys[0]
 *    await claimTrialAccountDrop({
 *        desiredAccountId,
 *        secretKey: trialSecretKey
 *    })
 *
 *    const canExitTrial = await keypom.canExitTrial({
 *        trialAccountId: desiredAccountId
 *    })
 *    console.log('canExitTrial: ', canExitTrial)
 *	```
 *
 * @group Trial Accounts
 */
const canExitTrial = ({ trialAccountId, }) => __awaiter(void 0, void 0, void 0, function* () {
    const { viewCall } = (0, keypom_1.getEnv)();
    try {
        const keyInfo = yield viewCall({
            contractId: trialAccountId,
            methodName: "get_key_information",
            args: {},
        });
        console.log(`keyInfo: `, keyInfo);
        const rules = yield viewCall({
            contractId: trialAccountId,
            methodName: "get_rules",
            args: {},
        });
        console.log("rules: ", rules);
        return keyInfo.trial_data.exit == true;
    }
    catch (e) {
        console.log("error: ", e);
    }
    return false;
});
exports.canExitTrial = canExitTrial;
