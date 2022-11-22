import { FinalExecutionOutcome } from "@near-wallet-selector/core";
import { SignAndSendTransactionParams, Transaction } from "@near-wallet-selector/core/lib/wallet";
import type { Action } from "@near-wallet-selector/core";
import { Account, Near, transactions } from "near-api-js";
import { SignAndSendTransactionOptions } from "near-api-js/lib/account";
import { EstimatorParams, ExecuteParams, FTTransferCallParams, NFTTransferCallParams } from "./types";

const nearAPI =  require("near-api-js");
const {
    KeyPair,
	utils,
	utils: {
		format: { parseNearAmount, formatNearAmount },
	},
} = nearAPI;

import BN from 'bn.js';
import { getEnv } from "./keypom";

const { generateSeedPhrase } = require("near-seed-phrase");

/// How much Gas each each cross contract call with cost to be converted to a receipt
const GAS_PER_CCC: number = 5000000000000; // 5 TGas
const RECEIPT_GAS_COST: number = 2500000000000; // 2.5 TGas
const YOCTO_PER_GAS: number = 100000000; // 100 million
export const ATTACHED_GAS_FROM_WALLET: number = 100000000000000; // 100 TGas

/// How much yoctoNEAR it costs to store 1 access key
const ACCESS_KEY_STORAGE: BN = new BN("1000000000000000000000");

export const snakeToCamel = (s) =>
    s.toLowerCase().replace(/([-_][a-z])/g, (m) => m.toUpperCase().replace(/-_/g, '')
);

export const key2str = (v) => typeof v === 'string' ? v : v.pk

const hashBuf = (str: string): Promise<ArrayBuffer> => crypto.subtle.digest('SHA-256', new TextEncoder().encode(str))
export const genKey = async (rootKey: string, meta: string, nonce: number): Promise<typeof KeyPair> => {
	const hash: ArrayBuffer = await hashBuf(`${rootKey}_${meta}_${nonce}`)
	const { secretKey } = generateSeedPhrase(hash)
	return KeyPair.fromString(secretKey)
}

/// TODO WIP: helper to remove the deposit if the user already has enough balance to cover the drop,add_keys
export const hasDeposit = ({
    accountId,
    transactions,
}) => {
    const { contractId, viewAccount } = getEnv()

    const totalDeposit = transactions.reduce((a, c) =>
        a.add(c.actions.reduce((a, c) => a.add(new BN(c.deposit || '0')), new BN('0')))
    , new BN('0'))

	const userBalance = viewAccount.viewFunction2({ contractId, methodName: 'get_user_balance', args: { account_id: accountId }})

    if (new BN(userBalance.gt(totalDeposit))) {
        transactions
            .filter(({ receiverId }) => contractId === receiverId)
            .forEach((tx) => tx.actions.forEach((a) => {
                if (/create_drop|add_keys/gi.test(a.methodName)) delete a.deposit
            }))
    }
}

export const execute = async ({
	transactions,
	account,
	wallet,
    fundingAccount,
}: ExecuteParams): Promise<void | FinalExecutionOutcome[] | Array<void | FinalExecutionOutcome>> => {

	const {
        contractId,
	} = getEnv()

    let needsRedirect = false;
    transactions.forEach((tx) => {
        if (tx.receiverId !== contractId) needsRedirect = true
        tx.actions.forEach((a) => {
            const { deposit } = (a as any)?.params
            if (deposit && deposit !== '0') needsRedirect = true
        })
    })
    
	/// instance of walletSelector.wallet()
	if (wallet) {
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

export const nftTransferCall = async ({
    account,
    contractId,
    receiverId,
    tokenIds,
    msg,
    returnTransactions = false,
}: NFTTransferCallParams): Promise<Array<void | FinalExecutionOutcome[]> | Transaction[]> => {
    const responses: Array<FinalExecutionOutcome[]> = []

    /// TODO batch calls
    const transactions: Transaction[] = []

    for (let i = 0; i < tokenIds.length; i++) {
        const tx: Transaction = {
            receiverId: contractId,
            signerId: account.accountId,
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
            account,
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

export const getStorageBase = ({ nftData, fcData }) => {
    if (fcData?.methods) return parseNearAmount('0.015')
    if (nftData.contractId) return parseNearAmount('0.05')
    return parseNearAmount('0.01')
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
    
    if (ftData?.contractId != null) {
        let extraFtCosts = await getFtCosts(near, numKeys, usesPerKey, ftData.contractId || ftData.contractId);
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
const getNoneFcsAndDepositRequired = (fcData, usesPerKey) => {

    let depositRequiredForFcDrops = new BN(0);
    let numNoneFcs = 0;
    if (fcData == null) {
        return {numNoneFcs, depositRequiredForFcDrops};
    }

    let numMethodData = fcData.methods.length;

    // If there's one method data specified and more than 1 claim per key, that data is to be used
    // For all the claims. In this case, we need to tally all the deposits for each method in all method data.
    if (usesPerKey > 1 && numMethodData == 1) {
        let methodData = fcData.methods[0];

        // Keep track of the total attached deposit across all methods in the method data
        let attachedDeposit = new BN(0);
        for (let i = 0; i < methodData.length; i++) {
            attachedDeposit = attachedDeposit.add(new BN(methodData[i].attachedDeposit));
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
            for (let j = 0; j < methodData.length; j++) {
                attachedDeposit = attachedDeposit.add(new BN(methodData[j].attachedDeposit));
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