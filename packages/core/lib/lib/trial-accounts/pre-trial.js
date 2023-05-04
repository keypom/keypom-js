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
exports.claimTrialAccountDrop = exports.createTrialAccountDrop = exports.KEY_LIMIT = void 0;
const bn_js_1 = __importDefault(require("bn.js"));
//import { Account, KeyPair } from "near-api-js";
const checks_1 = require("../checks");
const keypom_1 = require("../keypom");
const keypom_utils_1 = require("../keypom-utils");
const views_1 = require("../views");
const utils_1 = require("./utils");
const utils_2 = require("@near-js/utils");
const crypto_1 = require("@near-js/crypto");
exports.KEY_LIMIT = 50;
/**
 * Creates a new trial account drop which can be used to instantly sign users into decentralized applications that support the Keypom wallet selector plugin.
 *
 * The trial account is locked into certain behaviors depending on what is passed into `createTrialAccountDrop`. These behaviors include callable contracts, methods on
 * those contracts, the maximum amount of $NEAR that can be spent on each contract as well as an exit condition. Once the trial account has run out of funds, the only way to
 * retain any assets from the trial or continue using the account ID, is to repay the specific account ID for the amount of $NEAR specified.
 *
 * @return {Promise<CreateOrAddReturn>} Object containing: the drop ID, the responses of the execution, as well as any auto generated keys (if any).
 *
 * @example
 * Creating a trial account with any callable methods, an amount of 0.5 $NEAR and 5 keys.
 * ```js
 * const {keys: {secretKeys: trialSecretKeys, publicKeys: trialPublicKeys}} = await createTrialAccountDrop({
 *     contractBytes: [...readFileSync('./test/ext-wasm/trial-accounts.wasm')],
 *     trialFundsNEAR: 0.5,
 *     callableContracts: ['dev-1676298343226-57701595703433'],
 *     callableMethods: ['*'],
 *     amounts: ['0.5'],
 *     numKeys: 5,
 *     config: {
 *         dropRoot: "linkdrop-beta.keypom.testnet"
 *     }
 * })
 *
 * const newAccountId = `${Date.now().toString()}.linkdrop-beta.keypom.testnet`
 * await claimTrialAccountDrop({
 *     secretKey: trialSecretKeys[0],
 *     desiredAccountId: newAccountId,
 * })
 *
 * console.log(`
 *
 * ${JSON.stringify({
 *     account_id: newAccountId,
 *     public_key: trialPublicKeys[0],
 *     private_key: trialSecretKeys[0]
 * })}
 *
 * `)
 *
 * console.log(`http://localhost:1234/keypom-url/${newAccountId}#${trialSecretKeys[0]}`)
 *
 * ```
 * @group Trial Accounts
 */
const createTrialAccountDrop = ({ account, wallet, contractBytes, startingBalanceNEAR, startingBalanceYocto, callableContracts, maxAttachableNEARPerContract, maxAttachableYoctoPerContract, callableMethods, trialEndFloorNEAR, trialEndFloorYocto, repayAmountNEAR, repayAmountYocto, repayTo, dropId, config = {}, numKeys = 0, publicKeys, rootEntropy, metadata, useBalance = false, returnTransactions = false, successUrl, }) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
    const { near, networkId, gas, attachedGas, contractId, receiverId, getAccount, execute, fundingAccountDetails, } = (0, keypom_1.getEnv)();
    (0, checks_1.assert)((0, checks_1.isValidAccountObj)(account), "Passed in account is not a valid account object.");
    account = yield getAccount({ account, wallet });
    (0, checks_1.assert)((0, checks_1.isSupportedKeypomContract)(contractId) === true, "Only the latest Keypom contract can be used to call this methods. Please update the contract.");
    // Ensure that if the dropID is passed in, it's greater than 1 billion
    (0, checks_1.assert)(parseInt(dropId || "1000000000") >= 1000000000, "All custom drop IDs must be greater than 1_000_000_000");
    if (!dropId)
        dropId = Date.now().toString();
    // Ensure that the length of the callable methods, contracts, and max attachable deposit per contract are all the same
    (0, checks_1.assert)(callableMethods.length === callableContracts.length &&
        callableMethods.length ===
            (maxAttachableNEARPerContract || maxAttachableYoctoPerContract)
                .length, "The length of the callable methods, contracts, and max attachable deposit per contract must all be the same.");
    yield (0, checks_1.assertDropIdUnique)(dropId);
    const finalConfig = {
        uses_per_key: (config === null || config === void 0 ? void 0 : config.usesPerKey) || 1,
        time: config === null || config === void 0 ? void 0 : config.time,
        usage: {
            auto_delete_drop: ((_a = config === null || config === void 0 ? void 0 : config.usage) === null || _a === void 0 ? void 0 : _a.autoDeleteDrop) || false,
            auto_withdraw: ((_b = config === null || config === void 0 ? void 0 : config.usage) === null || _b === void 0 ? void 0 : _b.autoWithdraw) || true,
            permissions: (_c = config === null || config === void 0 ? void 0 : config.usage) === null || _c === void 0 ? void 0 : _c.permissions,
            refund_deposit: (_d = config === null || config === void 0 ? void 0 : config.usage) === null || _d === void 0 ? void 0 : _d.refundDeposit,
        },
        sale: (config === null || config === void 0 ? void 0 : config.sale)
            ? {
                max_num_keys: (_e = config === null || config === void 0 ? void 0 : config.sale) === null || _e === void 0 ? void 0 : _e.maxNumKeys,
                price_per_key: ((_f = config === null || config === void 0 ? void 0 : config.sale) === null || _f === void 0 ? void 0 : _f.pricePerKeyYocto) ||
                    ((_g = config === null || config === void 0 ? void 0 : config.sale) === null || _g === void 0 ? void 0 : _g.pricePerKeyNEAR)
                    ? (0, utils_2.parseNearAmount)((_j = (_h = config === null || config === void 0 ? void 0 : config.sale) === null || _h === void 0 ? void 0 : _h.pricePerKeyNEAR) === null || _j === void 0 ? void 0 : _j.toString())
                    : undefined,
                allowlist: (_k = config === null || config === void 0 ? void 0 : config.sale) === null || _k === void 0 ? void 0 : _k.allowlist,
                blocklist: (_l = config === null || config === void 0 ? void 0 : config.sale) === null || _l === void 0 ? void 0 : _l.blocklist,
                auto_withdraw_funds: (_m = config === null || config === void 0 ? void 0 : config.sale) === null || _m === void 0 ? void 0 : _m.autoWithdrawFunds,
                start: (_o = config === null || config === void 0 ? void 0 : config.sale) === null || _o === void 0 ? void 0 : _o.start,
                end: (_p = config === null || config === void 0 ? void 0 : config.sale) === null || _p === void 0 ? void 0 : _p.end,
            }
            : undefined,
        root_account_id: config === null || config === void 0 ? void 0 : config.dropRoot,
    };
    (0, checks_1.assertValidDropConfig)(finalConfig);
    // If there are no publicKeys being passed in, we should generate our own based on the number of keys
    if (!publicKeys) {
        var keys;
        // Default root entropy is what is passed in. If there wasn't any, we should check if the funding account contains some.
        const rootEntropyUsed = rootEntropy || (fundingAccountDetails === null || fundingAccountDetails === void 0 ? void 0 : fundingAccountDetails.rootEntropy);
        // If either root entropy was passed into the function or the funder has some set, we should use that.
        if (rootEntropyUsed) {
            // Create an array of size numKeys with increasing strings from 0 -> numKeys - 1. Each element should also contain the dropId infront of the string
            const nonceDropIdMeta = Array.from({ length: numKeys }, (_, i) => `${dropId}_${i}`);
            keys = yield (0, keypom_utils_1.generateKeys)({
                numKeys,
                rootEntropy: rootEntropyUsed,
                metaEntropy: nonceDropIdMeta,
            });
        }
        else {
            // No entropy is provided so all keys should be fully random
            keys = yield (0, keypom_utils_1.generateKeys)({
                numKeys,
            });
        }
        publicKeys = keys.publicKeys;
    }
    numKeys = publicKeys.length;
    /// parse args
    startingBalanceYocto = (0, keypom_utils_1.nearArgsToYocto)(startingBalanceNEAR, startingBalanceYocto);
    repayAmountYocto = (0, keypom_utils_1.nearArgsToYocto)(repayAmountNEAR, repayAmountYocto);
    trialEndFloorYocto = (0, keypom_utils_1.nearArgsToYocto)(trialEndFloorNEAR, trialEndFloorYocto);
    // If max attachable deposit per contract in NEAR is passed in, loop through and convert to yocto
    if (maxAttachableNEARPerContract) {
        maxAttachableYoctoPerContract = maxAttachableNEARPerContract.map((deposit) => {
            if (deposit == "*")
                return "*";
            return (0, utils_2.parseNearAmount)(deposit.toString()) || "0";
        });
    }
    // If !maxAttachableYoctoPerContract, create an array of the same size as callableMethods and fill it with "*"
    if (!maxAttachableYoctoPerContract)
        maxAttachableYoctoPerContract = Array(callableMethods.length).fill("*");
    const rootReceiverId = (_q = finalConfig.root_account_id) !== null && _q !== void 0 ? _q : (networkId == "testnet" ? "testnet" : "near");
    // Account Mapping Contract Changes
    callableContracts.push(keypom_1.accountMappingContract[networkId]);
    maxAttachableYoctoPerContract.push((0, utils_2.parseNearAmount)("0.002"));
    callableMethods.push(["set"]);
    // Take the storage cost into consideration for the attached deposit and trial end floor
    const storageCost = (0, utils_2.parseNearAmount)("0.3");
    const attachedDeposit = new bn_js_1.default(startingBalanceYocto)
        .add(new bn_js_1.default(storageCost))
        .toString();
    trialEndFloorYocto = new bn_js_1.default(attachedDeposit)
        .sub(new bn_js_1.default(trialEndFloorYocto))
        .toString();
    // Generate the proper args for setup:
    let actualContracts = callableContracts.join(",");
    let actualAmounts = maxAttachableYoctoPerContract.join(",");
    let actualMethods = callableMethods
        .map((method) => method.join(":"))
        .join(",");
    const createDropArgs = {
        drop_id: dropId,
        public_keys: publicKeys || [],
        deposit_per_use: "0",
        config: finalConfig,
        metadata,
        required_gas: "150000000000000",
        fc: {
            methods: [
                [
                    {
                        receiver_id: rootReceiverId,
                        method_name: "create_account_advanced",
                        //@ts-ignore
                        attached_deposit: attachedDeposit,
                        args: JSON.stringify({
                            new_account_id: "INSERT_NEW_ACCOUNT",
                            options: {
                                contract_bytes: contractBytes,
                                limited_access_keys: [
                                    {
                                        public_key: "INSERT_TRIAL_PUBLIC_KEY",
                                        allowance: "0",
                                        receiver_id: "INSERT_NEW_ACCOUNT",
                                        method_names: "execute,create_account_and_claim",
                                    },
                                ],
                            },
                        }),
                        user_args_rule: "UserPreferred",
                    },
                    {
                        receiver_id: "",
                        method_name: "setup",
                        //@ts-ignore
                        attached_deposit: "0",
                        args: JSON.stringify((0, utils_1.wrapTxnParamsForTrial)({
                            contracts: actualContracts,
                            amounts: actualAmounts,
                            methods: actualMethods,
                            funder: repayTo || account.accountId,
                            repay: repayAmountYocto,
                            floor: trialEndFloorYocto,
                        })),
                        receiver_to_claimer: true,
                    },
                ],
            ],
        },
    };
    const fcData = {
        methods: [
            [
                {
                    receiverId: rootReceiverId,
                    methodName: "create_account_advanced",
                    //@ts-ignore
                    attachedDeposit,
                    args: JSON.stringify({
                        new_account_id: "INSERT_NEW_ACCOUNT",
                        options: {
                            contract_bytes: contractBytes,
                            limited_access_keys: [
                                {
                                    public_key: "INSERT_TRIAL_PUBLIC_KEY",
                                    allowance: "0",
                                    receiver_id: "INSERT_NEW_ACCOUNT",
                                    method_names: "execute,create_account_and_claim",
                                },
                            ],
                        },
                    }),
                    userArgsRule: "UserPreferred",
                },
                {
                    receiverId: "",
                    methodName: "setup",
                    //@ts-ignore
                    attachedDeposit: "0",
                    args: JSON.stringify((0, utils_1.wrapTxnParamsForTrial)({
                        contracts: actualContracts,
                        amounts: actualAmounts,
                        methods: actualMethods,
                        funder: repayTo || account.accountId,
                        repay: repayAmountYocto,
                        floor: trialEndFloorYocto,
                    })),
                    receiverToClaimer: true,
                },
            ],
        ],
    };
    /// estimate required deposit
    const storageCalculated = (0, keypom_utils_1.getStorageBase)(createDropArgs);
    let requiredDeposit = yield (0, keypom_utils_1.estimateRequiredDeposit)({
        near: near,
        depositPerUse: "0",
        numKeys,
        usesPerKey: finalConfig.uses_per_key || 1,
        attachedGas: parseInt(attachedGas),
        storage: storageCalculated,
        fcData,
    });
    var hasBalance = false;
    if (useBalance) {
        let userBal = yield (0, views_1.getUserBalance)({ accountId: account.accountId });
        if (userBal < requiredDeposit) {
            throw new Error(`Insufficient balance on Keypom to create drop. Use attached deposit instead.`);
        }
        hasBalance = true;
    }
    const deposit = !hasBalance ? requiredDeposit : "0";
    let transactions = [];
    transactions.push({
        receiverId: receiverId,
        signerId: account.accountId,
        actions: [
            {
                type: "FunctionCall",
                params: {
                    methodName: "create_drop",
                    args: createDropArgs,
                    gas: gas,
                    deposit,
                },
            },
        ],
    });
    if (returnTransactions) {
        return { keys, dropId, transactions, requiredDeposit };
    }
    let responses = yield execute({
        transactions,
        account,
        wallet,
        successUrl,
    });
    return { responses, keys, dropId, requiredDeposit };
});
exports.createTrialAccountDrop = createTrialAccountDrop;
/**
 * Claim a Keypom trial account drop which will create a new account, deploy and initialize the trial account contract, and setup the account with initial conditions as specified in the drop.
 *
 * @example
 * Creating a trial account with any callable methods, an amount of 0.5 $NEAR and 5 keys.
 * ```js
 * const callableContracts = [
 * 	`v1.social08.testnet`,
 * 	'guest-book.examples.keypom.testnet',
 * ]
 *
 * const {dropId, keys: {secretKeys: trialSecretKeys, publicKeys: trialPublicKeys}}
 * = await createTrialAccountDrop({
 * 	numKeys: 1,
 * 	contractBytes: [...readFileSync('./test/ext-wasm/trial-accounts.wasm')],
 * 	startingBalanceNEAR: 0.5,
 * 	callableContracts: callableContracts,
 * 	callableMethods: ['set:grant_write_permission', '*'],
 * 	maxAttachableNEARPerContract: callableContracts.map(() => '1'),
 * 	trialEndFloorNEAR: 0.33
 * })
 *
 * const newAccountId = `${Date.now().toString()}.linkdrop-beta.keypom.testnet`
 * await claimTrialAccountDrop({
 *     secretKey: trialSecretKeys[0],
 *     desiredAccountId: newAccountId,
 * })
 *
 * console.log(`
 *
 * ${JSON.stringify({
 *     account_id: newAccountId,
 *     public_key: trialPublicKeys[0],
 *     private_key: trialSecretKeys[0]
 * })}
 *
 * `)
 *
 * console.log(`http://localhost:1234/keypom-url/${newAccountId}#${trialSecretKeys[0]}`)
 *
 * ```
 * @group Trial Accounts
 */
const claimTrialAccountDrop = ({ secretKey, desiredAccountId, }) => __awaiter(void 0, void 0, void 0, function* () {
    const { networkId, keyStore, contractId, contractAccount, receiverId, execute } = (0, keypom_1.getEnv)();
    const keyPair = crypto_1.KeyPair.fromString(secretKey);
    const pubKey = keyPair.getPublicKey().toString();
    yield keyStore.setKey(networkId, contractId, keyPair);
    const dropInfo = yield (0, views_1.getDropInformation)({ secretKey });
    (0, checks_1.assert)(dropInfo.fc !== undefined, "drop must be a trial account drop");
    const attachedGas = dropInfo.required_gas;
    let userFcArgs = {
        INSERT_NEW_ACCOUNT: desiredAccountId,
        INSERT_TRIAL_PUBLIC_KEY: pubKey,
    };
    const transactions = [
        {
            receiverId,
            actions: [
                {
                    type: "FunctionCall",
                    params: {
                        methodName: "claim",
                        args: {
                            account_id: desiredAccountId,
                            fc_args: [JSON.stringify(userFcArgs), null],
                        },
                        gas: attachedGas,
                    },
                },
            ],
        },
    ];
    const result = yield execute({ transactions, account: contractAccount });
    return result;
});
exports.claimTrialAccountDrop = claimTrialAccountDrop;
