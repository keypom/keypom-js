import BN from 'bn.js';
import { Account, transactions } from 'near-api-js';
import { base_decode } from 'near-api-js/lib/utils/serialize';
import { getEnv } from '../keypom';
import { createAction } from '../keypom-utils';

// helpers for keypom account contract args
const RECEIVER_HEADER = '|kR|'
const ACTION_HEADER = '|kA|'
const PARAM_START = '|kP|'
const PARAM_STOP = '|kS|'

export const TRIAL_ERRORS = {
    EXIT_EXPECTED: 'exit',
    INVALID_ACTION: 'invalid_action'
}

/**
 * Check whether a trial account is able to exit their trial state and become a fully fledged normal account.
 * 
 * @group Trial Accounts
*/
export const convertTxnToTrialTxn = ({
	txns,
	trialAccountId,
	trialAccountPublicKey
}) => {
	const {near} = getEnv();

	const account = new Account(near!.connection, trialAccountId);
	const { provider } = account.connection;

	return Promise.all(
		txns.map(async (transaction, index) => {
			const actions = transaction.actions.map((action) =>
				createAction(action)
			);

			console.log('actions: ', actions)
			const block = await provider.block({ finality: "final" });
			console.log('block: ', block)

			const accessKey: any = await provider.query(
				`access_key/${trialAccountId}/${trialAccountPublicKey}`,
				""
			);
			console.log('accessKey: ', accessKey)

			return transactions.createTransaction(
				trialAccountId,
				trialAccountPublicKey,
				transaction.receiverId,
				accessKey.nonce + index + 1,
				actions,
				base_decode(block.header.hash)
			);
		})
	);
}

export const validateTransactions = async ({
	txnInfos,
	trialAccountId
}) => {
	const {viewCall} = getEnv();

	let validInfo = {}
	try {
		const rules = await viewCall({
			contractId: trialAccountId,
			methodName: 'get_rules',
			args: {}
		})
		let contracts = rules.contracts.split(",");
		let amounts = rules.amounts.split(",");
		let methods = rules.methods.split(",");

		for (let i = 0; i < contracts.length; i++) {
			validInfo[contracts[i]] = {
				maxDeposit: amounts[i],
				allowableMethods: methods[i] == "*" ? "*" : methods[i].split(":")
			}
		}
	} catch (e: any) {
		console.log('error: ', e)
	}
	console.log('validInfo after view calls: ', validInfo)

	// Loop through each transaction in the array
	for (let i = 0; i < txnInfos.length; i++) {
		const transaction = txnInfos[i];
		console.log('transaction: ', transaction)

		const validInfoForReceiver = validInfo[transaction.receiverId];
		console.log('validInfoForReceiver: ', validInfoForReceiver)
		// Check if the contractId is valid
		if (!validInfoForReceiver) {
			console.log('!validInfo[transaction.receiverId]: ', !validInfo[transaction.receiverId])
			return false;
		}

		// Check if the method name is valid
		if (validInfoForReceiver.allowableMethods != "*" && !validInfoForReceiver.allowableMethods.includes(transaction.methodName)) {
			console.log('!validInfo[transaction.receiverId].allowableMethods.includes(transaction.methodName): ', !validInfo[transaction.receiverId].allowableMethods.includes(transaction.methodName))
			return false;
		}

		// Check if the deposit is valid
		if (validInfoForReceiver.maxDeposit != "*" && new BN(transaction.deposit).gt(new BN(validInfoForReceiver.maxDeposit))) {
			console.log('new BN(transaction.deposit).gt(new BN(validInfo[transaction.receiverId].maxDeposit)): ', new BN(transaction.deposit).gt(new BN(validInfo[transaction.receiverId].maxDeposit)))
			return false;
		}
	}

	return true;
}

export const convertArgsToTrialArgs = (params, newParams = {}) => {
    Object.entries(params).forEach(([k, v]) => {
        if (k === 'args' && typeof v !== 'string') {
            v = JSON.stringify(v)
        }
        if (Array.isArray(v)) v = v.join()
        newParams[PARAM_START + k] = v + PARAM_STOP
    })
    return newParams
}

export const generateTrialExecuteArgs = ({ txns }) => {
	const argsToValidate: any = [];
	const generatedArgs: any = {
		transactions: []
	}

    txns.forEach((tx) => {
        const newTx: any = {}
        newTx[RECEIVER_HEADER] = tx.contractId || tx.receiverId
        newTx.actions = []
        console.log('newTx: ', newTx)

        tx.actions.forEach((action) => {
            console.log('action: ', action)
            argsToValidate.push({
                receiverId: tx.contractId || tx.receiverId,
                methodName: action.params.methodName,
                deposit: action.params.deposit
            })

            const newAction: any = {}
            console.log('newAction 1: ', newAction)
            newAction[ACTION_HEADER] = action.type
            console.log('newAction 2: ', newAction)
            newAction.params = convertArgsToTrialArgs(action.params)
            console.log('newAction 3: ', newAction)
            newTx.actions.push(newAction)
        })
        generatedArgs.transactions.push(newTx)
    })
    return {
        generatedArgs,
        argsToValidate
    }
}

export const estimateTrialGas = ({ txns }) => {
	let incomingGas = new BN("0");
	let numActions = 0;
	try {
		for (let i = 0; i < txns.length; i++) {
			let transaction = txns[i];
			console.log('transaction in gas loop: ', transaction)
			for (let j = 0; j < transaction.actions.length; j++) {
				let action = transaction.actions[j];
				console.log('action in gas loop: ', action)
				let gasToAdd = action.params[`|kP|gas`].split(`|kS|`)[0].toString();
				console.log('gasToAdd: ', gasToAdd)
				incomingGas = incomingGas.add(new BN(gasToAdd));
				numActions += 1
			}
		}
	} catch (e) {
		numActions = 1;
		console.log('e: ', e)
		incomingGas = new BN(`300000000000000`);
	}

	console.log('incomingGas: ', incomingGas.toString())
	// Take 15 TGas as a base for loading rules as well as 20 TGas for the callback.
	// For each action, add 15 TGas on top of that and then add the final incoming gas on top.
	let gasToAttach = new BN('15000000000000') // Loading rules
		.add(new BN('20000000000000')) // Callback
		.add(new BN('15000000000000').mul(new BN(numActions))) // Actions
		.add(incomingGas).toString(); // Incoming gas

	// check if the gas to attach is over 300 TGas and if it is, clamp it
	if (new BN(gasToAttach).gt(new BN('300000000000000'))) {
		console.log('gas to attach is over 300 TGas. Clamping it')
		gasToAttach = '300000000000000';
	}

    return gasToAttach;
}