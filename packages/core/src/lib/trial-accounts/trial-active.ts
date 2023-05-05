import { FinalExecutionOutcome, Transaction } from "@near-wallet-selector/core";
//import { KeyPair } from "near-api-js";
import { getEnv } from "../keypom";
import { createTransactions } from "../keypom-utils";
import {
	estimateTrialGas,
	generateExecuteArgs,
	hasEnoughBalance,
	TRIAL_ERRORS,
	validateDesiredMethods
} from "./utils";
import { KeyPair } from "@near-js/crypto";
import { stringifyJsonOrBytes } from "@near-js/transactions";

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
export const trialSignAndSendTxns = async ({
    trialAccountId,
    trialAccountSecretKey,
    txns,
}: {
    /** The trial account ID to use */
    trialAccountId: string;
    /** The trial account secret key to use */
    trialAccountSecretKey: string;
    /** The transactions to execute */
    txns: Transaction[];
}): Promise<FinalExecutionOutcome[]> => {
    const { near, keyStore, networkId } = getEnv();
    const exitExpected = await canExitTrial({ trialAccountId });
    if (exitExpected == true) {
        throw TRIAL_ERRORS.EXIT_EXPECTED;
    }

    const {
        methodDataToValidate,
        executeArgs,
        totalAttachedYocto,
        totalGasForTxns,
    } = await generateExecuteArgs({ desiredTxns: txns });

    const isValidTxn = await validateDesiredMethods({
        methodData: methodDataToValidate,
        trialAccountId,
    });
    console.log("isValidTxn: ", isValidTxn);

    if (isValidTxn == false) {
        throw TRIAL_ERRORS.INVALID_ACTION;
    }

    const hasBal = await hasEnoughBalance({
        trialAccountId,
        totalAttachedYocto,
        totalGasForTxns,
    });
    if (hasBal == false) {
        throw TRIAL_ERRORS.INSUFFICIENT_BALANCE;
    }

    const trialKeyPair = KeyPair.fromString(trialAccountSecretKey);
    const pubKey = trialKeyPair.getPublicKey();
    await keyStore!.setKey(networkId!, trialAccountId, trialKeyPair);
    const account = await near!.account(trialAccountId);

    const gasToAttach = estimateTrialGas({ executeArgs });
    const transformedTransactions = await createTransactions({
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
                            args: stringifyJsonOrBytes(executeArgs),
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

    const promises = transformedTransactions.map((tx) =>
        (account as any).signAndSendTransaction(tx)
    );
    return (await Promise.all(promises)) as FinalExecutionOutcome[];
};

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
export const trialCallMethod = async ({
    trialAccountId,
    trialAccountSecretKey,
    contractId,
    methodName,
    args,
    attachedGas,
    attachedDeposit,
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
    const { near, keyStore, networkId } = getEnv();
    const exitExpected = await canExitTrial({ trialAccountId });
    if (exitExpected == true) {
        throw TRIAL_ERRORS.EXIT_EXPECTED;
    }

    const trialKeyPair = KeyPair.fromString(trialAccountSecretKey);
    const pubKey = trialKeyPair.getPublicKey();
    await keyStore!.setKey(networkId!, trialAccountId, trialKeyPair);
    const account = await near!.account(trialAccountId);

    const txns: Transaction[] = [{
        signerId: trialAccountId,
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

    console.log(`txns: ${JSON.stringify(txns)}`);

    const {
        methodDataToValidate,
        executeArgs,
        totalAttachedYocto,
        totalGasForTxns,
    } = await generateExecuteArgs({ desiredTxns: txns });

    const isValidTxn = await validateDesiredMethods({
        methodData: methodDataToValidate,
        trialAccountId,
    });
    console.log("isValidTxn: ", isValidTxn);

    if (isValidTxn == false) {
        throw TRIAL_ERRORS.INVALID_ACTION;
    }

    const hasBal = await hasEnoughBalance({
        trialAccountId,
        totalAttachedYocto,
        totalGasForTxns,
    });
    if (hasBal == false) {
        throw TRIAL_ERRORS.INSUFFICIENT_BALANCE;
    }

    const gasToAttach = estimateTrialGas({ executeArgs });
    const transformedTransactions = await createTransactions({
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
                            args: stringifyJsonOrBytes(executeArgs),
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

    const promises = transformedTransactions.map((tx) =>
        (account as any).signAndSendTransaction(tx)
    );
    return (await Promise.all(promises)) as FinalExecutionOutcome[];
};

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
export const canExitTrial = async ({
    trialAccountId,
}: {
    /** The account ID of the trial account */
    trialAccountId: string;
}) => {
    const { viewCall } = getEnv();

    try {
        const keyInfo = await viewCall({
            contractId: trialAccountId,
            methodName: "get_key_information",
            args: {},
        });
        console.log(`keyInfo: `, keyInfo);

        const rules = await viewCall({
            contractId: trialAccountId,
            methodName: "get_rules",
            args: {},
        });
        console.log("rules: ", rules);

        return keyInfo.trial_data.exit == true;
    } catch (e: any) {
        console.log("error: ", e);
    }

    return false;
};
