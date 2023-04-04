import { FinalExecutionOutcome } from "@near-wallet-selector/core";
import { KeyPair } from "near-api-js";
import { getEnv } from "../keypom";
import { getPubFromSecret } from "../keypom-utils";
import { convertTxnToTrialTxn, estimateTrialGas, generateTrialExecuteArgs, TRIAL_ERRORS, validateTransactions } from "./utils";


export const trialSignAndSendTxns = async ({
	trialAccountId,
	trialAccountPublicKey,
	txns
}) => {
	const {near} = getEnv();
	const exitExpected = await canExitTrial({trialAccountId});
	if (exitExpected == true) {
		throw TRIAL_ERRORS.EXIT_EXPECTED;
	}

	const {argsToValidate, generatedArgs} = await generateTrialExecuteArgs({txns});

	const isValidTxn = await validateTransactions({txnInfos: argsToValidate, trialAccountId});
	console.log('isValidTxn: ', isValidTxn)

	if (isValidTxn == false) {
		throw TRIAL_ERRORS.INVALID_ACTION;
	}

	const account = await near!.account(trialAccountId);

	const gasToAttach = estimateTrialGas({txns: generatedArgs.transactions});
	const transformedTransactions = await convertTxnToTrialTxn({
		trialAccountId,
		trialAccountPublicKey,
		txns: [{
			receiverId: account.accountId,
			actions: [{
				type: 'FunctionCall',
				params: {
					methodName: 'execute',
					args: generatedArgs,
					gas: gasToAttach,
				}
			}]
		}]
	})
	console.log("debugging")
	console.log('transformedTransactions: ', transformedTransactions)

	const promises = transformedTransactions.map((tx) => (account as any).signAndSendTransaction(tx));
	return await Promise.all(promises) as FinalExecutionOutcome[];
}

/**
 * Execute a method using a trial account. If the trial account is in the exit state, this will throw an error. Similarly, if the given method data
 * cannot be executed by the trial account (e.g. the attached deposit exceeds the trial account's restrictions), this will throw an error.
 * 
 * @example
 * Using a trial account to mint a new NFT:
 * ```js
 * ```
 * 
 * @group Trial Accounts
 */
export const trialCallMethod = async ({
	trialAccountId,
	trialAccountSecretKey,
	contractId,
	methodName,
	args,
	attachedGas,
	attachedDeposit
}: {
	/** The account ID of the trial account */
	trialAccountId: string;
	/** The secret key of the trial account */
	trialAccountSecretKey: string;
	/** The contract ID of the contract to call */
	contractId: string;
	/** The method name to call */
	methodName: string;
	/** The arguments to pass to the method */
	args: Object;
	/** The amount of gas to attach to the transaction */
	attachedGas: string;
	/** The amount of NEAR to attach to the transaction */
	attachedDeposit: string;
}) => {
	const {near, keyStore, networkId} = getEnv();
	const exitExpected = await canExitTrial({trialAccountId});
	if (exitExpected == true) {
		throw TRIAL_ERRORS.EXIT_EXPECTED;
	}

	const txns = [{
		receiverId: contractId,
		actions: [
			{
				type: 'FunctionCall',
				params: {
					methodName,
					args,
					gas: attachedGas,
					deposit: attachedDeposit
				},
			},
		],
	}];

	const {argsToValidate, generatedArgs} = await generateTrialExecuteArgs({txns});

	const isValidTxn = await validateTransactions({txnInfos: argsToValidate, trialAccountId});
	console.log('isValidTxn: ', isValidTxn)

	if (isValidTxn == false) {
		throw TRIAL_ERRORS.INVALID_ACTION;
	}

	const trialKeyPair = KeyPair.fromString(trialAccountSecretKey);
	const pubKey = trialKeyPair.getPublicKey();
	await keyStore!.setKey(networkId!, trialAccountId, trialKeyPair)
	const account = await near!.account(trialAccountId);
	
	const gasToAttach = estimateTrialGas({txns: generatedArgs.transactions});
	const transformedTransactions = await convertTxnToTrialTxn({
		trialAccountId,
		trialAccountPublicKey: pubKey,
		txns: [{
			receiverId: account.accountId,
			actions: [{
				type: 'FunctionCall',
				params: {
					methodName: 'execute',
					args: generatedArgs,
					gas: gasToAttach,
				}
			}]
		}]
	})
	console.log("debugging")
	console.log('transformedTransactions: ', transformedTransactions)

	const promises = transformedTransactions.map((tx) => (account as any).signAndSendTransaction(tx));
	return await Promise.all(promises) as FinalExecutionOutcome[];
}

/**
 * Check whether a trial account is able to exit their trial state and become a fully fledged normal account.
 * 
 * @group Trial Accounts
*/
export const canExitTrial = async ({
	trialAccountId
}: {
	/** The account ID of the trial account */
	trialAccountId: string
}) => {
	const {viewCall} = getEnv();

	try {
		const keyInfo = await viewCall({
			contractId: trialAccountId,
			methodName: 'get_key_information',
			args: {}
		})
		console.log(`keyInfo: `, keyInfo)

		const rules = await viewCall({
			contractId: trialAccountId,
			methodName: 'get_rules',
			args: {}
		})
		console.log('rules: ', rules)

		return keyInfo.trial_data.exit == true
	} catch (e: any) {
		console.log('error: ', e)
	}

	return false;
}