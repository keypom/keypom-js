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
exports.deleteDrops = exports.createDrop = exports.KEY_LIMIT = void 0;
const bn_js_1 = __importDefault(require("bn.js"));
const transactions_1 = require("@near-js/transactions");
const utils_1 = require("@near-js/utils");
const checks_1 = require("./checks");
const keypom_1 = require("./keypom");
const keypom_utils_1 = require("./keypom-utils");
const views_1 = require("./views");
exports.KEY_LIMIT = 50;
/**
 * Creates a new drop based on parameters passed in. This drop can have keys that are manually generated and passed in, or automatically generated. If they're
 * automatically generated, they can be based off a set of entropy. For NFT and FT drops, assets can automatically be sent to Keypom to register keys as part of the payload.
 * The deposit is estimated based on parameters that are passed in and the transaction can be returned instead of signed and sent to the network. This can allow you to get the
 * required deposit from the return value and use that to fund the account's Keypom balance to avoid multiple transactions being signed in the case of a drop with many keys.
 *
 * @return {Promise<CreateOrAddReturn>} Object containing: the drop ID, the responses of the execution, as well as any auto generated keys (if any).
 *
 * @example
 * Create a basic simple drop containing 10 keys each with 1 $NEAR. Each key is completely random:
 * ```js
 * // Initialize the SDK for the given network and NEAR connection. No entropy passed in so any auto generated keys will
 * // be completely random unless otherwise overwritten.
 * await initKeypom({
 * 	network: "testnet",
 * 	funder: {
 * 		accountId: "benji_demo.testnet",
 * 		secretKey: "ed25519:5yARProkcALbxaSQ66aYZMSBPWL9uPBmkoQGjV3oi2ddQDMh1teMAbz7jqNV9oVyMy7kZNREjYvWPqjcA6LW9Jb1"
 * 	}
 * });
 *
 * // Create a drop with 10 completely random keys. The return value `keys` contains information about the generated keys
 * const {keys} = await createDrop({
 * 	numKeys: 10,
 * 	depositPerUseNEAR: 1,
 * });
 *
 * console.log('public keys: ', keys.publicKeys);
 * console.log('private keys: ', keys.secretKeys);
 * ```
 *
 * @example
 * Init funder with root entropy and generate deterministic keys for a drop. Compare with manually generated keys:
 * ```js
 * // Initialize the SDK for the given network and NEAR connection. Root entropy is passed into the funder account so any generated keys
 * // Will be based off that entropy.
 * await initKeypom({
 * 	network: "testnet",
 * 	funder: {
 * 		accountId: "benji_demo.testnet",
 * 		secretKey: "ed25519:5yARProkcALbxaSQ66aYZMSBPWL9uPBmkoQGjV3oi2ddQDMh1teMAbz7jqNV9oVyMy7kZNREjYvWPqjcA6LW9Jb1",
 * 		rootEntropy: "my-global-secret-password"
 * 	}
 * });
 *
 * // Create a simple drop with 5 keys. Each key will be derived based on the rootEntropy of the funder, the drop ID, and key nonce.
 * const { keys: keysFromDrop, dropId } = await createDrop({
 * 	numKeys: 5,
 * 	depositPerUseNEAR: 1,
 * });
 *
 * // Deterministically Generate the Private Keys:
 * const nonceDropIdMeta = Array.from({length: 5}, (_, i) => `${dropId}_${i}`);
 * const manualKeys = await generateKeys({
 * 	numKeys: 5,
 * 	rootEntropy: "my-global-secret-password",
 * 	metaEntropy: nonceDropIdMeta
 * })
 *
 * // Get the public and private keys from the keys generated by the drop
 * const {publicKeys, secretKeys} = keysFromDrop;
 * // Get the public and private keys from the keys that were manually generated
 * const {publicKeys: pubKeysGenerated, secretKeys: secretKeysGenerated} = manualKeys;
 * // These should match!
 * console.log('secretKeys: ', secretKeys)
 * console.log('secretKeysGenerated: ', secretKeysGenerated)
 *
 * // These should match!
 * console.log('publicKeys: ', publicKeys)
 * console.log('pubKeysGenerated: ', pubKeysGenerated)
 * ```
 *
 * @example
 * Use manually generated keys to create a drop:
 * ```js
 * // Initialize the SDK for the given network and NEAR connection. No entropy passed in so any auto generated keys will
 * // be completely random unless otherwise overwritten.
 * await initKeypom({
 * 	network: "testnet",
 * 	funder: {
 * 		accountId: "benji_demo.testnet",
 * 		secretKey: "ed25519:5yARProkcALbxaSQ66aYZMSBPWL9uPBmkoQGjV3oi2ddQDMh1teMAbz7jqNV9oVyMy7kZNREjYvWPqjcA6LW9Jb1"
 * 	}
 * });
 *
 * // Generate 10 random keys
 * const {publicKeys} = await generateKeys({
 * 	numKeys: 10
 * });
 *
 * // Create a drop using the keys that were generated. Since keys are passed in, the return value won't contain information about the keys.
 * await createDrop({
 * 	publicKeys,
 * 	depositPerUseNEAR: 1,
 * });
 * ```
 *
 * @example
 * Create a simple drop with 1 key and 1 use per key. This 1 use-key should be password protected based on a base-password:
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
 * ```
 * @group Creating, And Claiming Drops
 */
const createDrop = ({ account, wallet, dropId, numKeys = 0, publicKeys, rootEntropy, depositPerUseNEAR, depositPerUseYocto, metadata, requiredGas, config = {}, ftData, nftData, simpleData = {}, fcData, basePassword, passwordProtectedUses, useBalance = false, returnTransactions = false, successUrl, }) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x;
    const { near, viewCall, gas, attachedGas, contractId, receiverId, getAccount, execute, fundingAccountDetails, } = (0, keypom_1.getEnv)();
    (0, checks_1.assert)((0, checks_1.isValidAccountObj)(account), 'Passed in account is not a valid account object.');
    account = yield getAccount({ account, wallet });
    (0, checks_1.assert)((0, checks_1.isSupportedKeypomContract)(contractId) === true, 'Only the latest Keypom contract can be used to call this methods. Please update the contract.');
    (0, checks_1.assert)(publicKeys != undefined || numKeys != undefined, 'Must pass in either publicKeys or numKeys to create a drop.');
    /// parse args
    depositPerUseYocto = (0, keypom_utils_1.nearArgsToYocto)(depositPerUseNEAR, depositPerUseYocto);
    // Ensure that if the dropID is passed in, it's greater than 1 billion
    (0, checks_1.assert)(parseInt(dropId || '1000000000') >= 1000000000, 'All custom drop IDs must be greater than 1_000_000_000');
    if (!dropId)
        dropId = Date.now().toString();
    yield (0, checks_1.assertDropIdUnique)(dropId);
    const finalConfig = {
        uses_per_key: (config === null || config === void 0 ? void 0 : config.usesPerKey) || 1,
        time: config === null || config === void 0 ? void 0 : config.time,
        usage: {
            auto_delete_drop: ((_a = config === null || config === void 0 ? void 0 : config.usage) === null || _a === void 0 ? void 0 : _a.autoDeleteDrop) || false,
            auto_withdraw: (((_b = config === null || config === void 0 ? void 0 : config.usage) === null || _b === void 0 ? void 0 : _b.autoWithdraw) === true) || false,
            permissions: (_c = config === null || config === void 0 ? void 0 : config.usage) === null || _c === void 0 ? void 0 : _c.permissions,
            refund_deposit: (_d = config === null || config === void 0 ? void 0 : config.usage) === null || _d === void 0 ? void 0 : _d.refundDeposit,
            account_creation_fields: {
                account_id_field: (_f = (_e = config === null || config === void 0 ? void 0 : config.usage) === null || _e === void 0 ? void 0 : _e.accountCreationFields) === null || _f === void 0 ? void 0 : _f.accountIdField,
                drop_id_field: (_h = (_g = config === null || config === void 0 ? void 0 : config.usage) === null || _g === void 0 ? void 0 : _g.accountCreationFields) === null || _h === void 0 ? void 0 : _h.dropIdField,
                key_id_field: (_k = (_j = config === null || config === void 0 ? void 0 : config.usage) === null || _j === void 0 ? void 0 : _j.accountCreationFields) === null || _k === void 0 ? void 0 : _k.keyIdField,
                funder_id_field: (_m = (_l = config === null || config === void 0 ? void 0 : config.usage) === null || _l === void 0 ? void 0 : _l.accountCreationFields) === null || _m === void 0 ? void 0 : _m.funderIdField,
            },
        },
        sale: (config === null || config === void 0 ? void 0 : config.sale)
            ? {
                max_num_keys: (_o = config === null || config === void 0 ? void 0 : config.sale) === null || _o === void 0 ? void 0 : _o.maxNumKeys,
                price_per_key: ((_p = config === null || config === void 0 ? void 0 : config.sale) === null || _p === void 0 ? void 0 : _p.pricePerKeyYocto) ||
                    ((_q = config === null || config === void 0 ? void 0 : config.sale) === null || _q === void 0 ? void 0 : _q.pricePerKeyNEAR)
                    ? (0, utils_1.parseNearAmount)((_s = (_r = config === null || config === void 0 ? void 0 : config.sale) === null || _r === void 0 ? void 0 : _r.pricePerKeyNEAR) === null || _s === void 0 ? void 0 : _s.toString())
                    : undefined,
                allowlist: (_t = config === null || config === void 0 ? void 0 : config.sale) === null || _t === void 0 ? void 0 : _t.allowlist,
                blocklist: (_u = config === null || config === void 0 ? void 0 : config.sale) === null || _u === void 0 ? void 0 : _u.blocklist,
                auto_withdraw_funds: (_v = config === null || config === void 0 ? void 0 : config.sale) === null || _v === void 0 ? void 0 : _v.autoWithdrawFunds,
                start: (_w = config === null || config === void 0 ? void 0 : config.sale) === null || _w === void 0 ? void 0 : _w.start,
                end: (_x = config === null || config === void 0 ? void 0 : config.sale) === null || _x === void 0 ? void 0 : _x.end,
            }
            : undefined,
        root_account_id: config === null || config === void 0 ? void 0 : config.dropRoot,
    };
    (0, checks_1.assertValidDropConfig)(finalConfig);
    // If there are no publicKeys being passed in, we should generate our own based on the number of keys
    let keys;
    if (!publicKeys) {
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
    (0, checks_1.assert)(numKeys <= 100, 'Cannot add more than 100 keys at once');
    let passwords;
    if (basePassword) {
        (0, checks_1.assert)(numKeys <= 50, 'Cannot add more than 50 keys at once with passwords');
        // Generate the passwords with the base password and public keys. By default, each key will have a unique password for all of its uses unless passwordProtectedUses is passed in
        passwords = yield (0, keypom_utils_1.generatePerUsePasswords)({
            publicKeys: publicKeys,
            basePassword,
            uses: passwordProtectedUses ||
                Array.from({ length: (config === null || config === void 0 ? void 0 : config.usesPerKey) || 1 }, (_, i) => i + 1),
        });
    }
    let ftBalancePerUse;
    if (ftData) {
        ftBalancePerUse = (ftData === null || ftData === void 0 ? void 0 : ftData.absoluteAmount) || '0';
        if (ftData.amount) {
            const metadata = viewCall({
                contractId: ftData.contractId,
                methodName: 'ft_metadata',
            });
            ftBalancePerUse = (0, keypom_utils_1.parseFTAmount)(ftData.amount.toString(), metadata.decimals);
        }
    }
    (0, checks_1.assertValidFCData)(fcData, finalConfig.uses_per_key || 1);
    const createDropArgs = {
        drop_id: dropId,
        public_keys: publicKeys || [],
        deposit_per_use: depositPerUseYocto,
        config: finalConfig,
        metadata,
        required_gas: requiredGas,
        ft: (ftData === null || ftData === void 0 ? void 0 : ftData.contractId)
            ? {
                contract_id: ftData.contractId,
                sender_id: ftData.senderId,
                balance_per_use: ftBalancePerUse,
            }
            : undefined,
        nft: (nftData === null || nftData === void 0 ? void 0 : nftData.contractId)
            ? {
                contract_id: nftData.contractId,
                sender_id: nftData.senderId,
            }
            : undefined,
        fc: (fcData === null || fcData === void 0 ? void 0 : fcData.methods)
            ? {
                methods: fcData.methods.map((useMethods) => useMethods
                    ? useMethods.map((method) => {
                        const ret = {
                            receiver_id: method.receiverId,
                            method_name: method.methodName,
                            args: method.args,
                            attached_deposit: method.attachedDeposit,
                            attached_gas: method.attachedGas,
                            account_id_field: method.accountIdField,
                            drop_id_field: method.dropIdField,
                            key_id_field: method.keyIdField,
                            funder_id_field: method.funderIdField,
                            receiver_to_claimer: method.receiverToClaimer,
                            user_args_rule: method.userArgsRule,
                        };
                        return ret;
                    })
                    : undefined),
            }
            : undefined,
        simple: (simpleData === null || simpleData === void 0 ? void 0 : simpleData.lazyRegister)
            ? {
                lazy_register: simpleData.lazyRegister,
            }
            : undefined,
        passwords_per_use: passwords,
    };
    // If there is no ft data, nft data, or fc data, ensure the deposit per use is greater than 0
    if (createDropArgs.fc === undefined &&
        createDropArgs.ft === undefined &&
        createDropArgs.nft === undefined) {
        (0, checks_1.assert)(depositPerUseYocto != '0', 'Deposit per use must be greater than 0 for simple drops');
    }
    /// estimate required deposit
    const storageCalculated = (0, keypom_utils_1.getStorageBase)(createDropArgs);
    const requiredDeposit = yield (0, keypom_utils_1.estimateRequiredDeposit)({
        near: near,
        depositPerUse: depositPerUseYocto,
        numKeys,
        usesPerKey: finalConfig.uses_per_key || 1,
        attachedGas: parseInt(requiredGas || attachedGas),
        storage: storageCalculated,
        ftData,
        fcData,
    });
    let hasBalance = false;
    if (useBalance) {
        const userBal = new bn_js_1.default(yield (0, views_1.getUserBalance)({ accountId: account.accountId }));
        if (userBal.lt(new bn_js_1.default(requiredDeposit))) {
            throw new Error('Insufficient balance on Keypom to create drop. Use attached deposit instead.');
        }
        hasBalance = true;
    }
    const deposit = !hasBalance ? requiredDeposit : '0';
    let transactions = [];
    const pk = yield account.connection.signer.getPublicKey(account.accountId, account.connection.networkId);
    (0, checks_1.assert)(pk !== null, 'Could not get public key from signer. Ensure you have the key in the key store.');
    const txnInfo = {
        receiverId: receiverId,
        signerId: account.accountId,
        actions: [
            {
                enum: 'FunctionCall',
                functionCall: {
                    methodName: 'create_drop',
                    args: (0, transactions_1.stringifyJsonOrBytes)(createDropArgs),
                    gas: gas,
                    deposit,
                }
            },
        ],
    };
    transactions.push(yield (0, keypom_utils_1.convertBasicTransaction)({ txnInfo, signerId: account.accountId, signerPk: pk }));
    if ((ftData === null || ftData === void 0 ? void 0 : ftData.contractId) && (publicKeys === null || publicKeys === void 0 ? void 0 : publicKeys.length)) {
        transactions.push((yield (0, keypom_utils_1.ftTransferCall)({
            account: account,
            contractId: ftData.contractId,
            absoluteAmount: new bn_js_1.default(ftBalancePerUse)
                .mul(new bn_js_1.default(numKeys))
                .mul(new bn_js_1.default(finalConfig.uses_per_key))
                .toString(),
            dropId,
            returnTransaction: true,
        })));
    }
    const tokenIds = nftData === null || nftData === void 0 ? void 0 : nftData.tokenIds;
    if (nftData && tokenIds && (tokenIds === null || tokenIds === void 0 ? void 0 : tokenIds.length) > 0) {
        if (tokenIds.length > 2) {
            throw new Error('You can only automatically register 2 NFTs with \'createDrop\'. If you need to register more NFTs you can use the method \'nftTransferCall\' after you create the drop.');
        }
        const nftTXs = (yield (0, keypom_utils_1.nftTransferCall)({
            account: account,
            contractId: nftData.contractId,
            tokenIds,
            dropId: dropId.toString(),
            returnTransactions: true,
        }));
        transactions = transactions.concat(nftTXs);
    }
    if (returnTransactions) {
        return { keys, dropId, transactions, requiredDeposit };
    }
    const responses = yield execute({
        transactions,
        account,
        wallet,
        successUrl,
    });
    return { responses, keys, dropId, requiredDeposit };
});
exports.createDrop = createDrop;
/**
 * Delete a set of drops and optionally withdraw any remaining balance you have on the Keypom contract.
 *
 * @example
 * Create 5 drops and delete each of them:
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
 * // loop to create 5 simple drops each with 5 more keys than the next
 * for(var i = 0; i < 5; i++) {
 * 	// create 10 keys with no entropy (all random)
 * 	const {publicKeys} = await generateKeys({
 * 		numKeys: 5 * (i+1) // First drop will have 5, then 10, then 15 etc..
 * 	});
 *
 * 	// Create the simple
 * 	await createDrop({
 * 		publicKeys,
 * 		depositPerUseNEAR: 1,
 * 	});
 * }
 *
 * let drops = await getDrops({accountId: "benji_demo.testnet"});
 * console.log('drops: ', drops)
 *
 * await deleteDrops({
 * 	drops
 * })
 *
 * 	// Get the number of drops the account has after deletion (should be zero)
 * 	const numDrops = await getDropSupply({
 * 		accountId: "benjiman.testnet"
 * });
 * console.log('numDrops: ', numDrops)
 * ```
 * @group Deleting State
 */
const deleteDrops = ({ account, wallet, drops, dropIds, withdrawBalance = true, }) => __awaiter(void 0, void 0, void 0, function* () {
    const { gas300, receiverId, execute, getAccount, contractId } = (0, keypom_1.getEnv)();
    (0, checks_1.assert)((0, checks_1.isSupportedKeypomContract)(contractId) === true, 'Only the latest Keypom contract can be used to call this methods. Please update the contract.');
    (0, checks_1.assert)((0, checks_1.isValidAccountObj)(account), 'Passed in account is not a valid account object.');
    account = yield getAccount({ account, wallet });
    const pubKey = yield account.connection.signer.getPublicKey(account.accountId, account.connection.networkId);
    // If the drop information isn't passed in, we should get it from the drop IDs
    if (!drops) {
        if (!dropIds) {
            throw new Error('Must pass in either drops or dropIds');
        }
        // For each drop ID in drop IDs, get the drop information
        drops = [];
        yield Promise.all(yield dropIds.map((dropId) => __awaiter(void 0, void 0, void 0, function* () {
            drops === null || drops === void 0 ? void 0 : drops.push(yield (0, views_1.getDropInformation)({ dropId }));
        })));
    }
    const responses = yield Promise.all(drops.map(({ owner_id, drop_id, registered_uses, ft, nft }) => __awaiter(void 0, void 0, void 0, function* () {
        (0, checks_1.assert)(owner_id == account.accountId, 'Only the owner of the drop can delete drops.');
        let keySupply;
        let keys;
        const updateKeys = () => __awaiter(void 0, void 0, void 0, function* () {
            const keyPromises = [
                (() => __awaiter(void 0, void 0, void 0, function* () {
                    keySupply = yield (0, keypom_utils_1.keypomView)({
                        methodName: 'get_key_supply_for_drop',
                        args: {
                            drop_id: drop_id.toString(),
                        },
                    });
                }))(),
            ];
            keyPromises.push((() => __awaiter(void 0, void 0, void 0, function* () {
                keys = yield (0, keypom_utils_1.keypomView)({
                    methodName: 'get_keys_for_drop',
                    args: {
                        drop_id: drop_id.toString(),
                        from_index: '0',
                        limit: exports.KEY_LIMIT,
                    },
                });
            }))());
            yield Promise.all(keyPromises);
        });
        yield updateKeys();
        const responses = [];
        if (registered_uses !== 0 &&
            (ft !== undefined || nft !== undefined)) {
            const txn = yield (0, keypom_utils_1.convertBasicTransaction)({
                txnInfo: {
                    receiverId,
                    signerId: account.accountId,
                    actions: [
                        {
                            enum: 'FunctionCall',
                            functionCall: {
                                methodName: 'refund_assets',
                                args: (0, transactions_1.stringifyJsonOrBytes)({
                                    drop_id,
                                }),
                                gas: gas300,
                                deposit: '0'
                            },
                        },
                    ],
                },
                signerId: account.accountId,
                signerPk: pubKey
            });
            responses.push(...(yield execute({
                account,
                wallet,
                transactions: [txn],
            })));
        }
        const deleteKeys = () => __awaiter(void 0, void 0, void 0, function* () {
            const txn = yield (0, keypom_utils_1.convertBasicTransaction)({
                txnInfo: {
                    receiverId,
                    signerId: account.accountId,
                    actions: [
                        {
                            enum: 'FunctionCall',
                            functionCall: {
                                methodName: 'delete_keys',
                                args: (0, transactions_1.stringifyJsonOrBytes)({
                                    drop_id,
                                    public_keys: keys.map(keypom_utils_1.key2str),
                                }),
                                gas: gas300,
                                deposit: '0'
                            },
                        },
                    ],
                },
                signerId: account.accountId,
                signerPk: pubKey
            });
            responses.push(...(yield execute({
                account,
                wallet,
                transactions: [txn],
            })));
            if (keySupply > ((keys === null || keys === void 0 ? void 0 : keys.length) || 0)) {
                yield updateKeys();
                yield deleteKeys();
            }
        });
        yield deleteKeys();
        if (withdrawBalance) {
            const txn = yield (0, keypom_utils_1.convertBasicTransaction)({
                txnInfo: {
                    receiverId,
                    signerId: account.accountId,
                    actions: [
                        {
                            enum: 'FunctionCall',
                            functionCall: {
                                methodName: 'withdraw_from_balance',
                                args: (0, transactions_1.stringifyJsonOrBytes)({}),
                                gas: '50000000000000',
                                deposit: '0'
                            },
                        },
                    ],
                },
                signerId: account.accountId,
                signerPk: pubKey
            });
            responses.push(...(yield execute({
                account,
                wallet,
                transactions: [txn],
            })));
        }
        return responses;
    })));
    return responses;
});
exports.deleteDrops = deleteDrops;
// This should be done later. Very small number of drops will have lazy registrations enabled.
// /**
//  * Allows a user to register uses for a simple drop that has lazy registrations enabled. This drop can be over-registered.
//  *
//  * @param {Account=} account (OPTIONAL) If specified, the passed in account will be used to sign the txn instead of the funder account.
//  * @param {BrowserWalletBehaviour=} wallet (OPTIONAL) If using a browser wallet through wallet selector and that wallet should sign the transaction, pass it in.
//  * @param {string[]=} dropId Specify the drop ID of the drop you want to register uses on
//  *
//  * @example <caption>Create 5 drops and delete each of them</caption>
//  * ```js
//  * ```
// */
// export const registerUses = async ({
// 	account,
// 	wallet,
// 	dropId,
// 	numUses,
// 	useBalance = false,
// }: RegisterUsesParams) => {
// 	const {
// 		gas300, receiverId, execute, getAccount
// 	} = getEnv()
// 	account = await getAccount({ account, wallet });
// }
