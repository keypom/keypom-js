import BN from 'bn.js';
import * as nearAPI from "near-api-js";
const {
	utils: {
		format: { parseNearAmount, formatNearAmount },
	},
} = nearAPI;
import { FinalExecutionOutcome, Transaction } from "@near-wallet-selector/core";
import { BrowserWalletBehaviour, Wallet } from '@near-wallet-selector/core/lib/wallet/wallet.types';
import { Account, KeyPair } from "near-api-js";
import { assert, assertDropIdUnique, assertValidDropConfig, assertValidFCData, isValidAccountObj } from './checks';
import { FCData } from './types/fc';
import { FTData } from './types/ft';
import { getEnv, supportedKeypomContracts } from "./keypom";
import {
	estimateRequiredDeposit,
	ftTransferCall, generateKeys, generatePerUsePasswords, getPubFromSecret, getStorageBase, key2str, keypomView, nftTransferCall, parseFTAmount
} from "./keypom-utils";
import { NFTData } from './types/nft';
import { ProtocolReturnedDrop, ProtocolReturnedDropConfig, ProtocolReturnedMethod } from './types/protocol';
import { SimpleData } from './types/simple';
import { CreateDropProtocolArgs, CreateOrAddReturn } from './types/params';
import { getDropInformation, getUserBalance } from './views';
import { DropConfig } from './types/drops';
import { wrapParams } from './selector/utils/keypom-v2-utils';

type AnyWallet = BrowserWalletBehaviour | Wallet;
export const KEY_LIMIT = 50;

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
 * @group Creating, And Claiming Drops
*/
export const createTrialAccountDrop = async ({
	account,
	wallet,
    contractBytes,
    trialFundsNEAR,
    trialFundsYocto,
    callableContracts,
    amounts,
    callableMethods,
    repayAmountNEAR,
    repayAmountYocto,
    repayTo,
	dropId,
    config = {},
	numKeys = 0,
	publicKeys,
	rootEntropy,
	metadata,
	useBalance = false,
	returnTransactions = false,
	successUrl
}: {
	/** Account object that if passed in, will be used to sign the txn instead of the funder account. */
	account?: Account,
	/** If using a browser wallet through wallet selector and that wallet should sign the transaction, pass in the object. */
	wallet?: AnyWallet,
    /** Bytes of the trial account smart contract */
    contractBytes: number[],
    /** How much $NEAR should the trial account be able to spend before the trial is exhausted. Unit in $NEAR (i.e `1` = 1 $NEAR) */
	trialFundsNEAR?: Number,
	/** How much $NEAR should the trial account be able to spend before the trial is exhausted. Unit in yoctoNEAR (1 yoctoNEAR = 1e-24 $NEAR) */
	trialFundsYocto?: string,
    /** The contracts that the trial account should be able to call. */
    callableContracts: string[],
    /** The upper bound of $NEAR that trial account is able to attach to calls associated with each contract passed in. For no upper limit, pass in `*`. Units are in $NEAR (i.e `1` = 1 $NEAR). */
    amounts: string[],
    /** The list of methods that the trial account should be able to call on each respective contract. For multiple methods on a contract, pass in a comma separated string with no spaces (`nft_mint,nft_transfer,nft_approve`). To allow any methods to be called on the receiver contract, pass in `*`. */
    callableMethods: string[],
    /** How much $NEAR should be paid back to the specified funder in order to unlock the trial account. Unit in $NEAR (i.e `1` = 1 $NEAR) */
    repayAmountNEAR?: Number,
    /** How much $NEAR should be paid back to the specified funder in order to unlock the trial account. Unit in yoctoNEAR (1 yoctoNEAR = 1e-24 $NEAR) */
    repayAmountYocto?: string,
    /** The account that should receive the repayment of the trial account. If not specified, the drop funder will be used. */
    repayTo?: string,
    /** Specify a custom drop ID rather than using the incrementing nonce on the contract. */
    dropId?: string,
    /** Allows specific drop behaviors to be configured such as the number of uses each key / link will have. */
    config?: DropConfig,
	/**
	 * Specify how many keys should be generated for the drop. If the funder has rootEntropy set OR rootEntropy is passed in, the keys will be
     * deterministically generated using the drop ID, key nonce, and entropy. Otherwise, each key will be generated randomly. 
	*/
	numKeys: number,
	/** Pass in a custom set of publicKeys to add to the drop. If this is not passed in, keys will be generated based on the numKeys parameter. */
	publicKeys?: string[],
	/** Specify an entropy to use for generating keys (will overload the funder's rootEntropy if applicable). This parameter only matters if the publicKeys variable is not passed in. */
	rootEntropy?: string,
	/** String of metadata to attach to the drop. This can be whatever you would like and is optional. Often this is stringified JSON. */
	metadata?: string,
	/** If the account has a balance within the Keypom contract, set this to true to avoid the need to attach a deposit. If the account doesn't have enough balance, an error will throw. */
	useBalance?: boolean,
	/** If true, the transaction will be returned instead of being signed and sent. This is useful for getting the requiredDeposit from the return value without actually signing the transaction. */
	returnTransactions?: boolean,
	/** When signing with a wallet, a success URl can be included that the user will be redirected to once the transaction has been successfully signed. */
	successUrl?: string
}): Promise<CreateOrAddReturn> => {
	const {
		near, viewCall, networkId,
		gas, attachedGas, contractId, receiverId, getAccount, execute, fundingAccountDetails
	} = getEnv()

	assert(isValidAccountObj(account), 'Passed in account is not a valid account object.')
	account = await getAccount({ account, wallet })
	assert(supportedKeypomContracts[networkId!][contractId] === true, "Only the latest Keypom contract can be used to call this methods. Please update the contract.");

	// Ensure that if the dropID is passed in, it's greater than 1 billion
	assert(parseInt(dropId || "1000000000") >= 1000000000, 'All custom drop IDs must be greater than 1_000_000_000');
	if (!dropId) dropId = Date.now().toString()

	await assertDropIdUnique(dropId);

	const finalConfig: ProtocolReturnedDropConfig = {
        uses_per_key: config?.usesPerKey || 1,
		time: config?.time,
		usage: {
            auto_delete_drop: config?.usage?.autoDeleteDrop || false,
			auto_withdraw: config?.usage?.autoWithdraw || true,
			permissions: config?.usage?.permissions,
			refund_deposit: config?.usage?.refundDeposit,
		},
		sale: config?.sale ? {
            max_num_keys: config?.sale?.maxNumKeys,
			price_per_key: config?.sale?.pricePerKeyYocto || config?.sale?.pricePerKeyNEAR ? parseNearAmount(config?.sale?.pricePerKeyNEAR?.toString())! : undefined,
			allowlist: config?.sale?.allowlist,
			blocklist: config?.sale?.blocklist,
			auto_withdraw_funds: config?.sale?.autoWithdrawFunds,
			start: config?.sale?.start,
			end: config?.sale?.end
		} : undefined,
		root_account_id: config?.dropRoot,
	}

	assertValidDropConfig(finalConfig);

	// If there are no publicKeys being passed in, we should generate our own based on the number of keys
	if (!publicKeys) {
		var keys;
		
		// Default root entropy is what is passed in. If there wasn't any, we should check if the funding account contains some.
		const rootEntropyUsed = rootEntropy || fundingAccountDetails?.rootEntropy;
		// If either root entropy was passed into the function or the funder has some set, we should use that.
		if(rootEntropyUsed) {
			// Create an array of size numKeys with increasing strings from 0 -> numKeys - 1. Each element should also contain the dropId infront of the string 
			const nonceDropIdMeta = Array.from({length: numKeys}, (_, i) => `${dropId}_${i}`);
			keys = await generateKeys({
				numKeys,
				rootEntropy: rootEntropyUsed,
				metaEntropy: nonceDropIdMeta
			});
		} else {
			// No entropy is provided so all keys should be fully random
			keys = await generateKeys({
				numKeys,
			});
		}
		
		publicKeys = keys.publicKeys
	}

	numKeys = publicKeys!.length;

    /// parse args
	if (trialFundsNEAR) {
		trialFundsYocto = parseNearAmount(trialFundsNEAR.toString()) || '0'
	}
	if (!trialFundsYocto) trialFundsYocto = '0';

    if (repayAmountNEAR) {
		repayAmountYocto = parseNearAmount(repayAmountNEAR.toString()) || '0'
	}
	if (!repayAmountYocto) repayAmountYocto = '0';

    const attachedDeposit = new BN(trialFundsYocto).add(new BN(parseNearAmount("0.3"))).toString();
    const rootReceiverId = finalConfig.root_account_id ?? (networkId == "testnet" ? "testnet" : "mainnet");

	const createDropArgs: CreateDropProtocolArgs = {
		drop_id: dropId,
		public_keys: publicKeys || [],
		deposit_per_use: '0',
		config: finalConfig,
		metadata,
		fc: {
			methods: [[
                {
                    receiver_id: rootReceiverId,
                    method_name: 'create_account_advanced',
                    //@ts-ignore
                    attached_deposit: attachedDeposit,
                    args: JSON.stringify({
                        new_account_id: "INSERT_NEW_ACCOUNT",
                        options: {
                            contract_bytes: contractBytes,
                            limited_access_keys: [{
                                public_key: "INSERT_TRIAL_PUBLIC_KEY",
                                allowance: trialFundsYocto,
                                receiver_id: "INSERT_NEW_ACCOUNT",
                                method_names: 'execute',
                            }],
                        }
                    }),
                    user_args_rule: "UserPreferred"
                },
                {
                    receiver_id: "",
                    method_name: 'setup',
                    //@ts-ignore
                    attached_deposit: '0',
                    args: JSON.stringify(wrapParams({
                        contracts: callableContracts,
                        amounts,
                        methods: callableMethods,
                        funder: repayTo || account!.accountId,
                        repay: repayAmountYocto,
                    })),
                    //user_args_rule: "UserPreferred",
                    receiver_to_claimer: true
                }
            ]]
		}
	}

    const fcData: FCData = {
        methods: [[{
            receiverId: rootReceiverId,
            methodName: 'create_account_advanced',
            //@ts-ignore
            attachedDeposit,
            args: JSON.stringify({
                new_account_id: "INSERT_NEW_ACCOUNT",
                options: {
                    contract_bytes: contractBytes,
                    limited_access_keys: [{
                        public_key: "INSERT_TRIAL_PUBLIC_KEY",
                        allowance: trialFundsYocto,
                        receiver_id: "INSERT_NEW_ACCOUNT",
                        method_names: 'execute',
                    }],
                }
            }),
            userArgsRule: "UserPreferred"
        },
        {
            receiverId: "",
            methodName: 'setup',
            //@ts-ignore
            attachedDeposit: '0',
            args: JSON.stringify(wrapParams({
                contracts: callableContracts,
                amounts,
                methods: callableMethods,
                funder: repayTo || account!.accountId,
                repay: repayAmountYocto,
            })),
            userArgsRule: "UserPreferred",
            receiverToClaimer: true
        }
        ]],
    }

	/// estimate required deposit
	const storageCalculated = getStorageBase(createDropArgs);
	let requiredDeposit = await estimateRequiredDeposit({
		near: near!,
		depositPerUse: '0',
		numKeys,
		usesPerKey: finalConfig.uses_per_key || 1,
		attachedGas: parseInt(attachedGas!),
		storage: storageCalculated,
		fcData,
	})

	var hasBalance = false;
	if(useBalance) {
		let userBal = await getUserBalance({accountId: account!.accountId});
		if(userBal < requiredDeposit) {
			throw new Error(`Insufficient balance on Keypom to create drop. Use attached deposit instead.`);
		}

		hasBalance = true;
	}

	const deposit = !hasBalance ? requiredDeposit : '0'
	
	let transactions: Transaction[] = []

	transactions.push({
		receiverId: receiverId!,
		signerId: account!.accountId, // We know this is not undefined since getAccount throws
		actions: [{
			type: 'FunctionCall',
			params: {
				methodName: 'create_drop',
				args: createDropArgs,
				gas: gas!,
				deposit,
			}
		}]
	})
	
	if (returnTransactions) {
		return { keys, dropId, transactions, requiredDeposit }
	}

	let responses = await execute({ transactions, account, wallet, successUrl })

	return { responses, keys, dropId, requiredDeposit }
}

/**
 * Claim a Keypom trial account drop which will create a new account, deploy and initialize the trial account contract, and setup the account with initial conditions as specified in the drop. 
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
 * @group Creating, And Claiming Drops
*/
export const claimTrialAccountDrop = async ({
	secretKey,
	desiredAccountId,
}: {
	/** The private key associated with the Keypom link. This can either contain the `ed25519:` prefix or not. */
	secretKey: string,
	/** The account ID that will be created for the trial */
	desiredAccountId: string, 
}) => {
	const {
		networkId, keyStore, attachedGas, contractId, contractAccount, receiverId, execute, fundingAccountDetails, near,
	} = getEnv()

	const keyPair = KeyPair.fromString(secretKey)
    const pubKey = keyPair.getPublicKey().toString();
	await keyStore!.setKey(networkId!, contractId!, keyPair)

	const dropInfo = await getDropInformation({secretKey});
    assert(dropInfo.fc !== undefined, "drop must be a trial account drop");

    let userFcArgs = {
		"INSERT_NEW_ACCOUNT": desiredAccountId,
        "INSERT_TRIAL_PUBLIC_KEY": pubKey
	}
	
	const transactions: any[] = [{
		receiverId,
		actions: [{ 
			type: 'FunctionCall',
			params: {
				methodName: 'claim',
				args: {
					account_id: desiredAccountId,
					fc_args: [JSON.stringify(userFcArgs), null]
				},
				gas: attachedGas,
			}
		}]
	}]
	
	const result = await execute({ transactions, account: contractAccount })

	return result
}
