import BN from 'bn.js';
//import * as nearAPI from "near-api-js";
// const {
//     utils: {
//         format: { parseNearAmount },
//     },
// } = nearAPI;

import {
    BrowserWalletBehaviour,
    Wallet
} from '@near-wallet-selector/core/lib/wallet/wallet.types';
//import { Account } from "near-api-js";
import { Account } from '@near-js/accounts';
import { parseNearAmount } from '@near-js/utils';
import { assert, isSupportedKeypomContract, isValidAccountObj } from './checks';
import { getEnv } from './keypom';
import {
    convertBasicTransaction,
    estimateRequiredDeposit,
    ftTransferCall,
    generateKeys,
    generatePerUsePasswords,
    key2str, nftTransferCall,
    toCamel
} from './keypom-utils';
import { CreateOrAddReturn } from './types/params';
import { ProtocolReturnedDrop } from './types/protocol';
import { canUserAddKeys, getDropInformation, getUserBalance } from './views';
import { Action, Transaction, stringifyJsonOrBytes } from '@near-js/transactions';

type AnyWallet = BrowserWalletBehaviour | Wallet;

/**
 * Add keys that are manually generated and passed in, or automatically generated to an existing drop. If they're
 * automatically generated, they can be based off a set of entropy. For NFT and FT drops, assets can automatically be sent to Keypom to register keys as part of the payload.
 * The deposit is estimated based on parameters that are passed in and the transaction can be returned instead of signed and sent to the network. This can allow you to get the
 * required deposit from the return value and use that to fund the account's Keypom balance to avoid multiple transactions being signed in the case of a drop with many keys.
 *
 * @return {Promise<CreateOrAddReturn>} Object containing: the drop ID, the responses of the execution, as well as any auto generated keys (if any).
 *
 * @example
 * Create a basic empty simple drop and add 10 keys. Each key is completely random:
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
 * // Create an empty simple drop with no keys.
 * const {dropId} = await createDrop({
 * 	depositPerUseNEAR: 1,
 * });
 *
 * // Add 10 completely random keys. The return value `keys` contains information about the generated keys
 * const {keys} = await addKeys({
 * 	dropId,
 * 	numKeys: 10
 * })
 *
 * console.log('public keys: ', keys.publicKeys);
 * console.log('private keys: ', keys.secretKeys);
 * ```
 *
 * @example
 * Init funder with root entropy, create empty drop and add generate deterministic keys. Compare with manually generated keys:
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
 * // Create a simple drop with no keys
 * const { dropId } = await createDrop({
 * 	depositPerUseNEAR: 1,
 * });
 *
 * // Add 5 keys to the empty simple drop. Each key will be derived based on the rootEntropy of the funder, the drop ID, and key nonce.
 * const {keys: keysFromDrop} = await addKeys({
 * 	dropId,
 * 	numKeys: 5
 * })
 *
 * // Deterministically Generate the Private Keys:
 * const nonceDropIdMeta = Array.from({length: 5}, (_, i) => `${dropId}_${i}`);
 * const manualKeys = await generateKeys({
 * 	numKeys: 5,
 * 	rootEntropy: "my-global-secret-password",
 * 	metaEntropy: nonceDropIdMeta
 * })
 *
 * // Get the public and private keys from the keys generated by addKeys
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
 * Create an empty drop and add manually created keys:
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
 * // Create an empty simple drop using the keys that were generated. Since keys are passed in, the return value won't contain information about the keys.
 * const {dropId} = await createDrop({
 * 	publicKeys,
 * 	depositPerUseNEAR: 1,
 * });
 *
 * // Generate 10 random keys
 * const {publicKeys} = await generateKeys({
 * 	numKeys: 10
 * });
 *
 * // Add keys to the drop using the keys that were generated. Since keys are passed in, the return value won't contain information about the keys.
 * await addKeys({
 * 	publicKeys,
 * 	dropId
 * })
 * ```
 * @group Creating, And Claiming Drops
 */
export const addKeys = async ({
    account,
    wallet,
    dropId,
    drop,
    numKeys,
    publicKeys,
    nftTokenIds,
    rootEntropy,
    basePassword,
    passwordProtectedUses,
    extraDepositNEAR,
    extraDepositYocto,
    useBalance = false,
    returnTransactions = false,
}: {
    /** Account object that if passed in, will be used to sign the txn instead of the funder account. */
    account?: Account;
    /** If using a browser wallet through wallet selector and that wallet should sign the transaction, pass in the object. */
    wallet?: AnyWallet;
    /**
     * Specify how many keys should be generated for the drop. If the funder has rootEntropy set OR rootEntropy is passed in, the keys will be
     * deterministically generated using the drop ID, key nonce, and entropy. Otherwise, each key will be generated randomly.
     */
    numKeys: number;
    /** Pass in a custom set of publicKeys to add to the drop. If this is not passed in, keys will be generated based on the numKeys parameter. */
    publicKeys?: string[];
    /**  Specify the drop ID for which you want to add keys to. */
    dropId?: string;
    /** If the drop information from getDropInformation is already known to the client, it can be passed in instead of the drop ID to reduce computation. */
    drop?: ProtocolReturnedDrop;
    /**
     * If the drop type is an NFT drop, the token IDs can be passed in so that the tokens are automatically sent to the Keypom contract rather
     * than having to do two separate transactions. A maximum of 2 token IDs can be sent during the `addKeys` function. To send more token IDs in
     * order to register key uses, use the `nftTransferCall` function.
     */
    nftTokenIds?: string[];
    /** Specify an entropy to use for generating keys (will overload the funder's rootEntropy if applicable). This parameter only matters if the publicKeys variable is not passed in. */
    rootEntropy?: string;
    /** For doing password protected drops, this is the base password that will be used to generate all the passwords. It will be double hashed with the public keys. If specified, by default, all key uses will have their own unique password unless passwordProtectedUses is passed in. */
    basePassword?: string;
    /** For doing password protected drops, specifies exactly which uses will be password protected. The uses are NOT zero indexed (i.e 1st use = 1). Each use will have a different, unique password generated via double hashing the base password + public key + key use. */
    passwordProtectedUses?: number[];
    /** For Public Sales, drops might require an additional fee for adding keys. This specifies the amount of $NEAR in human readable format (i.e `1.5` = 1.5 $NEAR) */
    extraDepositNEAR?: number;
    /** For Public Sales, drops might require an additional fee for adding keys. This specifies the amount of $NEAR in yoctoNEAR (i.e `1` = 1 $yoctoNEAR = 1e-24 $NEAR) */
    extraDepositYocto?: string;
    /** If the account has a balance within the Keypom contract, set this to true to avoid the need to attach a deposit. If the account doesn't have enough balance, an error will throw. */
    useBalance?: boolean;
    /** If true, the transaction will be returned instead of being signed and sent. This is useful for getting the requiredDeposit from the return value without actually signing the transaction. */
    returnTransactions?: boolean;
}): Promise<CreateOrAddReturn> => {
    const {
        near,
        gas,
        contractId,
        receiverId,
        getAccount,
        execute,
        fundingAccountDetails,
    } = getEnv();

    assert(
        isValidAccountObj(account),
        'Passed in account is not a valid account object.'
    );

    assert(drop || dropId, 'Either a dropId or drop object must be passed in.');
    assert(
        numKeys || publicKeys?.length,
        'Either pass in publicKeys or set numKeys to a positive non-zero value.'
    );
    assert(
        isSupportedKeypomContract(contractId!) === true,
        'Only the latest Keypom contract can be used to call this methods. Please update the contract'
    );

    account = await getAccount({ account, wallet });
    const pubKey = await account.connection.signer.getPublicKey(account.accountId, account.connection.networkId);

    const {
        drop_id,
        owner_id,
        required_gas,
        deposit_per_use,
        config,
        ft: ftData,
        nft: nftData,
        fc: fcData,
        next_key_id,
    } = drop || (await getDropInformation({ dropId: dropId! }));
    dropId = drop_id;

    const uses_per_key = config?.uses_per_key || 1;

    // If the contract is v1-3 or lower, just check if owner is the same as the calling account. If it's v1-4 or higher, check if the calling account has the permission to add keys.
    if (!contractId!.includes('v1-4.keypom')) {
        assert(
            owner_id === account!.accountId,
            'Calling account is not the owner of this drop.'
        );
    } else {
        const canAddKeys = await canUserAddKeys({
            accountId: account!.accountId,
            dropId,
        });
        assert(
            canAddKeys == true,
            'Calling account does not have permission to add keys to this drop.'
        );
    }

    // If there are no publicKeys being passed in, we should generate our own based on the number of keys
    let keys;
    if (!publicKeys) {

        // Default root entropy is what is passed in. If there wasn't any, we should check if the funding account contains some.
        const rootEntropyUsed =
            rootEntropy || fundingAccountDetails?.rootEntropy;
        // If either root entropy was passed into the function or the funder has some set, we should use that.
        if (rootEntropyUsed) {
            // Create an array of size numKeys with increasing strings from next_key_id -> next_key_id + numKeys - 1. Each element should also contain the dropId infront of the string
            const nonceDropIdMeta = Array.from(
                { length: numKeys },
                (_, i) => `${drop_id}_${next_key_id + i}`
            );
            keys = await generateKeys({
                numKeys,
                rootEntropy: rootEntropyUsed,
                metaEntropy: nonceDropIdMeta,
            });
        } else {
            // No entropy is provided so all keys should be fully random
            keys = await generateKeys({
                numKeys,
            });
        }

        publicKeys = keys.publicKeys;
    }

    numKeys = publicKeys!.length;
    assert(numKeys <= 100, 'Cannot add more than 100 keys at once');
    let passwords;
    if (basePassword) {
        assert(numKeys <= 50, 'Cannot add 50 keys at once with passwords');

        // Generate the passwords with the base password and public keys. By default, each key will have a unique password for all of its uses unless passwordProtectedUses is passed in
        passwords = await generatePerUsePasswords({
            publicKeys: publicKeys!,
            basePassword,
            uses:
                passwordProtectedUses ||
                Array.from({ length: uses_per_key }, (_, i) => i + 1),
        });
    }

    const camelFTData = toCamel(ftData);
    const camelFCData = toCamel(fcData);

    let requiredDeposit = await estimateRequiredDeposit({
        near: near!,
        depositPerUse: deposit_per_use,
        numKeys,
        usesPerKey: uses_per_key,
        attachedGas: parseInt(required_gas),
        storage: parseNearAmount('0.2') as string,
        fcData: camelFCData,
        ftData: camelFTData,
    });

    // If there is any extra deposit needed, add it to the required deposit
    extraDepositYocto = extraDepositYocto
        ? new BN(extraDepositYocto)
        : new BN('0');
    if (extraDepositNEAR) {
        extraDepositYocto = new BN(
            parseNearAmount(extraDepositNEAR.toString())
        );
    }
    requiredDeposit = new BN(requiredDeposit).add(extraDepositYocto).toString();

    let hasBalance = false;
    if (useBalance) {
        const userBal = new BN(
            await getUserBalance({ accountId: account!.accountId })
        );
        if (userBal.lt(new BN(requiredDeposit))) {
            throw new Error(
                'Insufficient balance on Keypom to create drop. Use attached deposit instead.'
            );
        }

        hasBalance = true;
    }

    let transactions: Transaction[] = [];

    const txn = await convertBasicTransaction({
        txnInfo: {
            receiverId,
            signerId: account!.accountId,
            actions: [
                {
                    enum: 'FunctionCall',
                    functionCall: {
                        methodName: 'add_keys',
                        args: stringifyJsonOrBytes({
                            drop_id,
                            public_keys: publicKeys,
                            passwords_per_use: passwords,
                        }),
                        gas,
                        deposit: !hasBalance ? requiredDeposit : undefined,
                    },
                },
            ],
        },
        signerId: account!.accountId,
        signerPk: pubKey
    });

    transactions.push(txn);

    if (ftData?.contract_id) {
        transactions.push(
            await ftTransferCall({
                account: account!,
                contractId: ftData.contract_id,
                absoluteAmount: new BN(ftData.balance_per_use!)
                    .mul(new BN(numKeys))
                    .mul(new BN(uses_per_key))
                    .toString(),
                dropId: drop_id,
                returnTransaction: true,
            }) as Transaction
        );
    }

    const tokenIds = nftTokenIds;
    if (nftData && tokenIds && tokenIds?.length > 0) {
        if (tokenIds.length > 2) {
            throw new Error(
                'You can only automatically register 2 NFTs with \'createDrop\'. If you need to register more NFTs you can use the method \'nftTransferCall\' after you create the drop.'
            );
        }
        const nftTXs = (await nftTransferCall({
            account: account!,
            contractId: nftData.contract_id,
            tokenIds,
            dropId: dropId!.toString(),
            returnTransactions: true,
        })) as Transaction[];
        transactions = transactions.concat(nftTXs);
    }

    if (returnTransactions) {
        return { keys, dropId: drop_id, transactions, requiredDeposit };
    }

    const responses = await execute({ transactions, account, wallet });

    return { responses, dropId: drop_id, keys, requiredDeposit };
};

/**
 * Delete a set of keys from a drop and optionally withdraw any remaining balance you have on the Keypom contract.
 *
 * @example
 * Create a drop with 5 keys and delete the first one:
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
 * // Create the simple drop with 5 random keys
 * const {keys, dropId} = await createDrop({
 * 	numKeys: 5,
 * 	depositPerUseNEAR: 1,
 * });
 *
 * await deleteKeys({
 * 	dropId,
 * 	publicKeys: keys.publicKeys[0] // Can be wrapped in an array as well
 * })
 * ```
 * @group Deleting State
 */
export const deleteKeys = async ({
    account,
    wallet,
    publicKeys,
    dropId,
    withdrawBalance = false,
}: {
    /** Account object that if passed in, will be used to sign the txn instead of the funder account. */
    account?: Account;
    /** If using a browser wallet through wallet selector and that wallet should sign the transaction, pass in the object. */
    wallet?: AnyWallet;
    /** Specify a set of public keys to delete. If deleting a single publicKey, the string can be passed in without wrapping it in an array. */
    publicKeys: string[] | string;
    /** Which drop ID do the keys belong to? */
    dropId: string;
    /** Whether or not to withdraw any remaining balance on the Keypom contract. */
    withdrawBalance?: boolean;
}) => {
    const { receiverId, execute, getAccount, contractId } = getEnv();
    assert(
        isSupportedKeypomContract(contractId!) === true,
        'Only the latest Keypom contract can be used to call this methods. Please update the contract'
    );

    const { owner_id, drop_id, registered_uses, ft, nft } =
        await getDropInformation({ dropId });

    assert(
        isValidAccountObj(account),
        'Passed in account is not a valid account object.'
    );
    account = await getAccount({ account, wallet });

    assert(
        owner_id == account!.accountId,
        'Only the owner of the drop can delete keys.'
    );

    const actions: Action[] = [];
    if ((ft || nft) && registered_uses > 0) {
        actions.push({
            enum: 'FunctionCall',
            functionCall: {
                methodName: 'refund_assets',
                args: stringifyJsonOrBytes({
                    drop_id,
                }),
                gas: '100000000000000',
                deposit: '0'
            },
        });
    }

    // If the publicKeys provided is not an array (simply the string for 1 key), we convert it to an array of size 1 so that we can use the same logic for both cases
    if (publicKeys && !Array.isArray(publicKeys)) {
        publicKeys = [publicKeys];
    }

    actions.push({
        enum: 'FunctionCall',
        functionCall: {
            methodName: 'delete_keys',
            args: stringifyJsonOrBytes({
                drop_id,
                public_keys: (publicKeys as string[]).map(key2str),
            }),
            gas: '100000000000000',
            deposit: '0'
        },
    });

    if (withdrawBalance) {
        actions.push({
            enum: 'FunctionCall',
            functionCall: {
                methodName: 'withdraw_from_balance',
                args: stringifyJsonOrBytes({}),
                gas: '100000000000000',
                deposit: '0'
            },
        });
    }

    const transactions: any[] = [
        {
            receiverId,
            actions,
        },
    ];

    return execute({ transactions, account, wallet });
};
