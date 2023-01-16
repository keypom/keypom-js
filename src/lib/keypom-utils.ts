import type { Action } from "@near-wallet-selector/core";
import { FinalExecutionOutcome } from "@near-wallet-selector/core";
import { SignAndSendTransactionParams, Transaction } from "@near-wallet-selector/core/lib/wallet";
import BN from 'bn.js';
import * as nearAPI from 'near-api-js';
import { Account, Near, transactions } from "near-api-js";
import { SignAndSendTransactionOptions } from "near-api-js/lib/account";
import { generateSeedPhrase } from 'near-seed-phrase';
import { getEnv } from "./keypom";
import { PasswordPerUse } from "./types/drops";
import { FCData } from "./types/fc";
import { GeneratedKeyPairs, NearKeyPair } from "./types/general";
import { CreateDropProtocolArgs, EstimatorParams, ExecuteParams, FTTransferCallParams, GenerateKeysParams, NFTTransferCallParams } from "./types/params";

const {
    KeyPair,
	utils,
	utils: {
		format: { parseNearAmount },
	},
} = nearAPI;

export const exportedNearAPI = nearAPI;

let sha256Hash
if (typeof crypto === 'undefined') {
    const nodeCrypto = require('crypto');
    sha256Hash = (ab) => nodeCrypto.createHash('sha256').update(ab).digest();
} else {
    sha256Hash = (ab) => crypto.subtle.digest('SHA-256', ab)
}

/// How much Gas each each cross contract call with cost to be converted to a receipt
const GAS_PER_CCC: number = 5000000000000; // 5 TGas
const RECEIPT_GAS_COST: number = 2500000000000; // 2.5 TGas
const YOCTO_PER_GAS: number = 100000000; // 100 million
export const ATTACHED_GAS_FROM_WALLET: number = 100000000000000; // 100 TGas

/// How much yoctoNEAR it costs to store 1 access key
const ACCESS_KEY_STORAGE: BN = new BN("1000000000000000000000");

export const key2str = (v) => typeof v === 'string' ? v : v.pk

const hashBuf = (str: string, fromHex = false): Promise<ArrayBuffer> => sha256Hash(Buffer.from(str, fromHex ? 'hex' : 'utf8'));


/**
 * Generate a sha256 hash of a passed in string. If the string is hex encoded, set the fromHex flag to true.
 * 
 * @param {string} str - the string you wish to hash. By default, this should be utf8 encoded. If the string is hex encoded, set the fromHex flag to true.
 * @param {boolean} fromHex (OPTIONAL) - A flag that should be set if the string is hex encoded. Defaults to false.
 * 
 * @returns {Promise<string>} - The resulting hash
 * 
 * @example <caption>Generating the required password to pass into `claim` given a base password</caption>
 * ```js
 * 	// Create the password to pass into claim which is a hash of the basePassword, public key and whichever use we are on
 * let currentUse = 1;
 * let passwordForClaim = await hashPassword(basePassword + publicKey + currentUse.toString());
 * ```
 */
export const hashPassword = async (str: string, fromHex = false): Promise<string> => {
    let buf = await hashBuf(str, fromHex);
    return Buffer.from(buf).toString('hex');
}

/**
 * Generate ed25519 KeyPairs that can be used for Keypom linkdrops, or full access keys to claimed accounts. These keys can optionally be derived from some entropy such as a root password and metadata pertaining to each key (user provided password etc.). 
 * Entropy is useful for creating an onboarding experience where in order to recover a keypair, the client simply needs to provide the meta entropy (could be a user's password) and the secret root key like a UUID).
 * 
 * @param {number} numKeys - The number of keys to generate
 * @param {string=} rootEntropy (OPTIONAL) - A root string that will be used as a baseline for all keys in conjunction with different metaEntropies (if provided) to deterministically generate a keypair. If not provided, the keypair will be completely random.
 * @param {string=} metaEntropy (OPTIONAL) - An array of entropies to use in conjunction with a base rootEntropy to deterministically generate the private keys. For single key generation, you can either pass in a string array with a single element, or simply 
 pass in the string itself directly (not within an array).
 * 
 * @returns {Promise<GeneratedKeyPairs>} - An object containing an array of KeyPairs, Public Keys and Secret Keys.
 * 
 * @example <caption>Generating 10 unique random keypairs with no entropy</caption>
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
 * 
 * @example <caption>Generating 1 keypair based on entropy</caption>
 * // Generate 1 key with the given entropy
 * let keys = await generateKeys({
 *     numKeys: 1,
 *     entropy: {
 *         rootKey: "my-global-password",
 *         meta: "user-password-123",
 *     } // In this case, since there is only 1 key, the entropy can be an array of size 1 as well.
 * })
 * 
 * let pubKey = keys.publicKeys[0];
 * let secretKey = keys.secretKeys[0];
 * 
 * console.log('Public Key: ', pubKey);
 * console.log('Secret Key: ', secretKey)
 * 
 * @example <caption>Generating 2 keypairs each with their own entropy</caption>
 * // Generate 2 keys each with their own unique entropy
 * let keys = await generateKeys({
 *     numKeys: 2,
 *     entropy: [
 *         {
 *             rootKey: "my-global-password",
 *             meta: "first-password",
 *             nonce: 1
 *         },
 *         {
 *             rootKey: "my-global-password",
 *             meta: "second-password",
 *             nonce: 2
 *         }
 *     ]
 * })
 * 
 * console.log('Pub Keys ', keys.publicKeys);
 * console.log('Secret Keys ', keys.secretKeys);
 */
export const generateKeys = async ({numKeys, rootEntropy, metaEntropy}: GenerateKeysParams): Promise<GeneratedKeyPairs> => {
    // If the metaEntropy provided is not an array (simply the string for 1 key), we convert it to an array of size 1 so that we can use the same logic for both cases
    if (metaEntropy && !Array.isArray(metaEntropy)) {
        metaEntropy = [metaEntropy]
    }

    // Ensure that if metaEntropy is provided, it should be the same length as the number of keys
    const numEntropy = metaEntropy?.length || numKeys;
    if (numEntropy != numKeys) {
        throw new Error(`You must provide the same number of meta entropy values as the number of keys`)
    }
    
    var keyPairs: NearKeyPair[] = []
    var publicKeys: string[] = []
    var secretKeys: string[] = []
    for (let i = 0; i < numKeys; i++) {
        if (rootEntropy) {
            const stringToHash = metaEntropy ? `${rootEntropy}_${metaEntropy[i]}` : rootEntropy;
            const hash: ArrayBuffer = await hashBuf(stringToHash);

            const { secretKey, publicKey } = generateSeedPhrase(hash)
            var keyPair = KeyPair.fromString(secretKey);
            keyPairs.push(keyPair);
            publicKeys.push(publicKey)
            secretKeys.push(secretKey)
        } else {
            var keyPair = await KeyPair.fromRandom('ed25519');
            keyPairs.push(keyPair);
            publicKeys.push(keyPair.getPublicKey().toString())
            // @ts-ignore - not sure why it's saying secret key isn't property of keypair
            secretKeys.push(keyPair.secretKey)
        }
    }

    return {
        keyPairs,
        publicKeys,
        secretKeys
    }
}

/**
 * Query for a user's current balance on the Keypom contract
 * 
 * @param {string} accountId The account ID of the user to retrieve the balance for.
 * 
 * @returns {string} The user's current balance
 * 
 * @example <caption>Query for a user's current balance on the Keypom contract</caption>
 *  * ```js
 * // Initialize the SDK on testnet. No funder is passed in since we're only doing view calls.
 * await initKeypom({
 * network: "testnet",
 * });
 * 
 * // Query for the drop information for a specific drop
 * const dropInfo = await getDropInformation({
 * dropId: "1669840629120",
 * withKeys: true
 * })
 * 
 * console.log('dropInfo: ', dropInfo)
 * ```
*/
export const getUserBalance = async ({
    accountId
}: {accountId: string}): Promise<string> => {
    const { contractId, viewAccount } = getEnv()
    return viewAccount.viewFunction2({ contractId, methodName: 'get_user_balance', args: { account_id: accountId }})
}

export const keypomView = async ({ methodName, args }) => {
    const {
		viewAccount, contractId,
	} = getEnv()

    if (!viewAccount) {
        throw new Error('initKeypom must be called before view functions can be called.')
    }

    return viewAccount!.viewFunction2({
		contractId,
		methodName,
		args
	})
}

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

export const execute = async ({
	transactions,
	account,
	wallet,
    fundingAccount,
}: ExecuteParams): Promise<void | FinalExecutionOutcome[] | Array<void | FinalExecutionOutcome>> => {

	const {
        contractId,
	} = getEnv()
    
	/// instance of walletSelector.wallet()
	if (wallet) {
        let needsRedirect = false;
        transactions.forEach((tx) => {
            if (tx.receiverId !== contractId) needsRedirect = true
            tx.actions.forEach((a) => {
                const { deposit } = (a as any)?.params
                if (deposit && deposit !== '0') needsRedirect = true
            })
        })
        
        if (needsRedirect) return await wallet.signAndSendTransactions({ transactions })
        // sign txs in serial without redirect
        const responses: Array<void | FinalExecutionOutcome> = []
        for (const tx of transactions) {
            responses.push(await wallet.signAndSendTransaction({
                actions: tx.actions
            }))
        }
        return responses
    }

	/// instance of NEAR Account (backend usage)
	const nearAccount = account || fundingAccount
	if (!nearAccount) {
		throw new Error(`Call with either a NEAR Account argument 'account' or initialize Keypom with a 'fundingAccount'`)
	}

	return await signAndSendTransactions(nearAccount, transformTransactions(<SignAndSendTransactionParams[]> transactions))
}

// TODO: Document this
export const ftTransferCall = ({
    account,
    contractId,
    args,
    returnTransaction = false,
}: FTTransferCallParams): Promise<void | FinalExecutionOutcome[]> | Transaction => {
    const tx: Transaction = {
        receiverId: contractId,
        signerId: account.accountId,
        actions: [{
            type: 'FunctionCall',
            params: {
                methodName: 'ft_transfer_call',
                args,
                gas: '50000000000000',
                deposit: '1',
            }
        }]
    }

    if (returnTransaction) return tx
    return execute({ account, transactions: [tx]}) as Promise<void | FinalExecutionOutcome[]>
}

// TODO: Document this
export const nftTransferCall = async ({
    account,
    wallet,
    contractId,
    receiverId,
    tokenIds,
    msg,
    returnTransactions = false,
}: NFTTransferCallParams): Promise<Array<void | FinalExecutionOutcome[]> | Transaction[]> => {

    const { getAccount } = getEnv();

	account = getAccount({ account, wallet })

    if (tokenIds.length > 6) {
        throw new Error(`This method can only transfer 6 NFTs in 1 batch transaction.`)
    }

    const responses: Array<FinalExecutionOutcome[]> = []

    const transactions: Transaction[] = []

    /// TODO batch calls in parallel where it makes sense
    for (let i = 0; i < tokenIds.length; i++) {
        const tx: Transaction = {
            receiverId: contractId,
            signerId: account!.accountId,
            actions: [{
                type: 'FunctionCall',
                params: {
                    methodName: 'nft_transfer_call',
                    args: {
                        receiver_id: receiverId,
                        token_id: tokenIds[i],
                        msg
                    },
                    gas: '50000000000000',
                    deposit: '1',
                }
            }]
        }
        transactions.push(tx)
        if (returnTransactions) continue

        responses.push(<FinalExecutionOutcome[]> await execute({
            account: account!,
            transactions,
        }))
    }
    return returnTransactions ? transactions : responses
}

/// https://github.com/near/near-api-js/blob/7f16b10ece3c900aebcedf6ebc660cc9e604a242/packages/near-api-js/src/utils/format.ts#L53
export const parseFTAmount = (amt: string, decimals: number): string => {
    amt = amt.replace(/,/g, '').trim();
    const split = amt.split('.');
    const wholePart = split[0];
    const fracPart = split[1] || '';
    if (split.length > 2 || fracPart.length > decimals) {
        throw new Error(`Cannot parse '${amt}' as NEAR amount`);
    }
    return trimLeadingZeroes(wholePart + fracPart.padEnd(decimals, '0'));
}

const trimLeadingZeroes = (value: string): string => {
    value = value.replace(/^0+/, '');
    if (value === '') {
        return '0';
    }
    return value;
}


/// sequentially execute all transactions
const signAndSendTransactions = async (account: Account, txs: SignAndSendTransactionOptions[]): Promise<FinalExecutionOutcome[]> => {
	const responses: FinalExecutionOutcome[] = []
    for (let i = 0; i < txs.length; i++) {
        // @ts-ignore
        // near-api-js marks this method as protected.
        // Reference: https://github.com/near/wallet-selector/blob/7f9f8598459cffb80583c2a83c387c3d5c2f4d5d/packages/my-near-wallet/src/lib/my-near-wallet.spec.ts#L31
		responses.push(await account.signAndSendTransaction(txs[i]));
	}
    return responses
}

export const transformTransactions = (transactions: SignAndSendTransactionParams[]): SignAndSendTransactionOptions[] => transactions.map(({ receiverId, actions: _actions }) => {
    const actions = _actions.map((action) =>
        createAction(action)
    );
    let txnOption: SignAndSendTransactionOptions = {
        receiverId: receiverId as string,
        actions
    };
    return (txnOption);
});

// reference: https://github.com/near/wallet-selector/blob/d09f69e50df05c8e5f972beab4f336d7cfa08c65/packages/wallet-utils/src/lib/create-action.ts
const createAction = (action: Action): transactions.Action => {
	switch (action.type) {
		case "CreateAccount":
			return transactions.createAccount();
		case "DeployContract": {
			const { code } = action.params;

			return transactions.deployContract(code);
		}
		case "FunctionCall": {
			const { methodName, args, gas, deposit } = action.params;

			return transactions.functionCall(
				methodName,
				args,
				new BN(gas),
				new BN(deposit)
			);
		}
		case "Transfer": {
			const { deposit } = action.params;

			return transactions.transfer(new BN(deposit));
		}
		case "Stake": {
			const { stake, publicKey } = action.params;

			return transactions.stake(new BN(stake), utils.PublicKey.from(publicKey));
		}
		case "AddKey": {
			const { publicKey, accessKey } = action.params;

			// return transactions.addKey(
			// 	utils.PublicKey.from(publicKey),
			// 	// TODO: Use accessKey.nonce? near-api-js seems to think 0 is fine?
			// 	getAccessKey(accessKey.permission)
			// );
		}
		case "DeleteKey": {
			const { publicKey } = action.params;

			return transactions.deleteKey(utils.PublicKey.from(publicKey));
		}
		case "DeleteAccount": {
			const { beneficiaryId } = action.params;

			return transactions.deleteAccount(beneficiaryId);
		}
		default:
			throw new Error("Invalid action type");
	}
};

export const getStorageBase = ({
    public_keys, 
    deposit_per_use, 
    drop_id, 
    config, 
    metadata, 
    simple, 
    ft, 
    nft, 
    fc, 
    passwords_per_use
}: CreateDropProtocolArgs) => {
    const storageCostNEARPerByte = 0.00001;
    let totalBytes = 0;

    // Get the bytes per public key, multiply it by number of keys, and add it to the total
    let bytesPerKey = Buffer.from("ed25519:88FHvWTp21tahAobQGjD8YweXGRgA7jE8TSQM6yg4Cim").length;
    let totalBytesForKeys = bytesPerKey * (public_keys?.length || 0);
    // console.log('totalBytesForKeys: ', totalBytesForKeys)
    // Bytes for the deposit per use
    let bytesForDeposit = Buffer.from(deposit_per_use.toString()).length;
    // console.log('bytesForDeposit: ', bytesForDeposit)
    // Bytes for the drop ID
    let bytesForDropId = Buffer.from(drop_id || "").length;
    // console.log('bytesForDropId: ', bytesForDropId)
    // Bytes for the config
    let bytesForConfig = Buffer.from(JSON.stringify(config || "")).length;
    // console.log('bytesForConfig: ', bytesForConfig)
    // Bytes for the metadata. 66 comes from collection initialization
    let bytesForMetadata = Buffer.from(metadata || "").length + 66;
    // console.log('bytesForMetadata: ', bytesForMetadata)
    // Bytes for the simple data
    let bytesForSimple = Buffer.from(JSON.stringify(simple || "")).length;
    // console.log('bytesForSimple: ', bytesForSimple)
    // Bytes for the FT data
    let bytesForFT = Buffer.from(JSON.stringify(ft || "")).length;
    // console.log('bytesForFT: ', bytesForFT)
    // Bytes for the NFT data
    let bytesForNFT = Buffer.from(JSON.stringify(nft || "")).length;
    // console.log('bytesForNFT: ', bytesForNFT)
    // Bytes for the FC data
    let bytesForFC = Buffer.from(JSON.stringify(fc || "")).length;
    // console.log('bytesForFC: ', bytesForFC)

    // Bytes for the passwords per use
    // Magic numbers come from plotting SDK data against protocol data and finding the best fit
    let bytesForPasswords = Buffer.from(JSON.stringify(passwords_per_use || "")).length * 4;
    
    // console.log('bytesForPasswords: ', bytesForPasswords)
    totalBytes += totalBytesForKeys + bytesForDeposit + bytesForDropId + bytesForConfig + bytesForMetadata + bytesForSimple + bytesForFT + bytesForNFT + bytesForFC + bytesForPasswords;
    
    // console.log('totalBytes: ', totalBytes)

    // Add a 30% buffer to the total bytes
    totalBytes = Math.round(totalBytes * 1.3);
    // console.log('totalBytes Rounded: ', totalBytes)
    

    let totalNEARAmount = (totalBytes * storageCostNEARPerByte)
    // console.log('totalNEARAmount BEFORE: ', totalNEARAmount)
    // Accounting for protocol storage for access keys
    // Magic numbers come from plotting SDK data against protocol data and finding the best fit 
    totalNEARAmount += (public_keys?.length || 0) * 0.005373134328 + 0.00376;
    // console.log('totalNEARAmount AFTER pk: ', totalNEARAmount.toString())

    // Multi use passwords need a little extra storage
    if (passwords_per_use) {
        totalNEARAmount += -0.00155 * ((config?.uses_per_key || 1) - 1) + 0.00285687;
        // console.log('totalNEARAmount AFTER pw per use conversion: ', totalNEARAmount.toString())
    }

    // Turns it into yocto
    return parseNearAmount(totalNEARAmount.toString());
}

// Initiate the connection to the NEAR blockchain.
export const estimateRequiredDeposit = async ({
    near,
    depositPerUse,
    numKeys,
    usesPerKey,
    attachedGas,
    storage = parseNearAmount("0.034"),
    keyStorage = parseNearAmount("0.0065"),
    fcData,
    ftData,
}: EstimatorParams): Promise<string>  => {
    ftData = toCamel(ftData);
    fcData = toCamel(fcData);

    const numKeysBN: BN = new BN(numKeys.toString())
    
    let totalRequiredStorage = new BN(storage).add(new BN(keyStorage).mul(numKeysBN));
    // console.log('totalRequiredStorage: ', totalRequiredStorage.toString())

    let actualAllowance = estimatePessimisticAllowance(attachedGas);
    // console.log('actualAllowance: ', actualAllowance.toString())

    let totalAllowance: BN  = actualAllowance.mul(numKeysBN);
    // console.log('totalAllowance: ', totalAllowance.toString())

    let totalAccessKeyStorage: BN  = ACCESS_KEY_STORAGE.mul(numKeysBN);
    // console.log('totalAccessKeyStorage: ', totalAccessKeyStorage.toString())

    let {numNoneFcs, depositRequiredForFcDrops} = getNoneFcsAndDepositRequired(fcData, usesPerKey);

    let totalDeposits = new BN(depositPerUse).mul(new BN(usesPerKey - numNoneFcs)).mul(numKeysBN);
    // console.log('totalDeposits: ', totalDeposits.toString())

    let totalDepositsForFc = depositRequiredForFcDrops.mul(numKeysBN);

    // console.log('totalDepositsForFc: ', totalDepositsForFc.toString())

    let requiredDeposit: BN  = totalRequiredStorage
        .add(totalAllowance)
        .add(totalAccessKeyStorage)
        .add(totalDeposits)
        .add(totalDepositsForFc);
    
    // console.log('requiredDeposit B4 FT costs: ', requiredDeposit.toString())
    
    if (ftData?.contractId) {
        let extraFtCosts = await getFtCosts(near, numKeys, usesPerKey, ftData?.contractId);
        requiredDeposit = requiredDeposit.add(new BN(extraFtCosts));

        // console.log('requiredDeposit AFTER FT costs: ', requiredDeposit.toString())
    }


    return requiredDeposit.toString();
};

// Estimate the amount of allowance required for a given attached gas.
const estimatePessimisticAllowance = (attachedGas: number): BN => {
    if (typeof attachedGas !== 'number') attachedGas = parseInt(attachedGas)
    // Get the number of CCCs you can make with the attached GAS
    let numCCCs = Math.floor(attachedGas / GAS_PER_CCC);
    // console.log('numCCCs: ', numCCCs)
    // Get the constant used to pessimistically calculate the required allowance
    let powOutcome = Math.pow(1.03, numCCCs);
    // console.log('powOutcome: ', powOutcome)

    let requiredGas = (attachedGas + RECEIPT_GAS_COST) * powOutcome + RECEIPT_GAS_COST;
    // console.log('requiredGas: ', requiredGas)
    let requiredAllowance: BN = new BN(requiredGas).mul(new BN(YOCTO_PER_GAS));
    // console.log('requiredAllowance: ', requiredAllowance.toString())
    return requiredAllowance;
};

// Estimate the amount of allowance required for a given attached gas.
const getNoneFcsAndDepositRequired = (fcData: FCData | undefined, usesPerKey: number) => {

    let depositRequiredForFcDrops = new BN(0);
    let numNoneFcs = 0;
    if (!fcData) {
        return {numNoneFcs, depositRequiredForFcDrops};
    }

    let numMethodData = fcData.methods.length;

    // If there's one method data specified and more than 1 claim per key, that data is to be used
    // For all the claims. In this case, we need to tally all the deposits for each method in all method data.
    if (usesPerKey > 1 && numMethodData == 1) {
        let methodData = fcData.methods[0];

        // Keep track of the total attached deposit across all methods in the method data
        let attachedDeposit = new BN(0);
        for (let i = 0; i < (methodData?.length || 0); i++) {
            attachedDeposit = attachedDeposit.add(new BN(methodData![i].attachedDeposit));
        }

        depositRequiredForFcDrops = depositRequiredForFcDrops.add(attachedDeposit).mul(usesPerKey);

        return {
            numNoneFcs,
            depositRequiredForFcDrops,
        }
    }
    // In the case where either there's 1 claim per key or the number of FCs is not 1,
    // We can simply loop through and manually get this data
    for (let i = 0; i < numMethodData; i++) {
        let methodData = fcData.methods[i];
        let isNoneFc = methodData == null;
        numNoneFcs += isNoneFc ? 1 : 0;

        if (!isNoneFc) {
            // Keep track of the total attached deposit across all methods in the method data
            let attachedDeposit = new BN(0);
            for (let j = 0; j < (methodData?.length || 0); j++) {
                attachedDeposit = attachedDeposit.add(new BN(methodData![j].attachedDeposit));
            }

            depositRequiredForFcDrops = depositRequiredForFcDrops.add(attachedDeposit);
        }
    }

    return {
        numNoneFcs,
        depositRequiredForFcDrops,
    } 
};

// Estimate the amount of allowance required for a given attached gas.
const getFtCosts = async (near: Near, numKeys: number, usesPerKey: number, ftContract: string): Promise<string> => {
    const viewAccount = await near.account("foo");
    const {min} = await viewAccount.viewFunction(ftContract, "storage_balance_bounds", {}); 
    // console.log('storageBalanceBounds: ', storageBalanceBounds)
    let costs: BN = new BN(min).mul(new BN(numKeys)).mul(new BN(usesPerKey)).add(new BN(min));
    // console.log('costs: ', costs.toString());
    return costs.toString();
};

/**
 * Generate passwords for a set of public keys. A unique password will be created for each specified use of a public key where the use is NOT zero indexed (i.e 1st use = 1).
 * The passwords will be generated via a double hash of the base password + public key + specific use
 * 
 * @param {string[]} publicKeys The public keys that will be used to generate the set of passwords
 * @param {string[]} uses An array of numbers that dictate which uses should be password protected. The 1st use of a key is 1 (NOT zero indexed).
 * @param {string=} basePassword All the passwords will be generated from this base password. It will be double hashed with the public key.
 * 
 * @returns {Promise<Array<Array<PasswordPerUse>>>} An array of objects for each key where each object has a password and maps it to its specific key use.
 */
export async function generatePerUsePasswords({
    publicKeys,
    uses,
    basePassword
}: {publicKeys: string[], uses: number[], basePassword: string}): Promise<Array<Array<PasswordPerUse>>> {
    let passwords: Array<Array<PasswordPerUse>> = [];
    
    // Loop through each pubKey to generate either the passwords
    for (var i = 0; i < publicKeys.length; i++) {
        
        // For each public key, we need to generate a password for each use
        let passwordsPerUse: Array<{ pw: string; key_use: number }> = [];
        for (var j = 0; j < uses.length; j++) {
            // First inner hash takes in utf8 and returns hash
            let innerHashBuff = await hashBuf(basePassword + publicKeys[i] + uses[j].toString());
            let innerHash = Buffer.from(innerHashBuff).toString('hex');

            // Outer hash takes in hex and returns hex
            let outerHashBuff = await hashBuf(innerHash, true);
            let outerHash = Buffer.from(outerHashBuff).toString('hex');

            let jsonPw = {
                pw: outerHash,
                key_use: uses[j]
            }
            passwordsPerUse.push(jsonPw);
        }
        passwords.push(passwordsPerUse);
    }

    return passwords;
}

// Taken from https://stackoverflow.com/a/61375162/16441367
export const snakeToCamel = str =>
  str.toLowerCase().replace(/([-_][a-z])/g, group =>
    group
      .toUpperCase()
      .replace('-', '')
      .replace('_', '')
  );
  

// Taken from https://stackoverflow.com/a/26215431/16441367
export const toCamel = o => {
	var newO, origKey, newKey, value
	if (o instanceof Array) {
	  return o.map(function(value) {
		  if (typeof value === "object") {
			value = toCamel(value)
		  }
		  return value
	  })
	} else {
	  newO = {}
	  for (origKey in o) {
		console.log('origKey: ', origKey)
		if (o.hasOwnProperty(origKey)) {
		  newKey = snakeToCamel(origKey);
		  console.log('newKey: ', newKey)
		  value = o[origKey]
		  if (value instanceof Array || (value !== null && value.constructor === Object)) {
			value = toCamel(value)
		  }
		  newO[newKey] = value
		}
	  }
	}
	return newO
  }
