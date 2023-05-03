import { FinalExecutionOutcome } from "@near-wallet-selector/core";
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
export declare const trialSignAndSendTxns: ({ trialAccountId, trialAccountSecretKey, txns, }: {
    /** The trial account ID to use */
    trialAccountId: string;
    /** The trial account secret key to use */
    trialAccountSecretKey: string;
    /** The transactions to execute */
    txns: {
        /** The contract ID to execute the transaction on */
        receiverId: string;
        /** The actions to execute */
        actions: {
            /** The type of action to execute */
            type: "FunctionCall";
            /** The parameters for the action */
            params: {
                /** The method name to execute */
                methodName: string;
                /** The arguments to pass to the method */
                args: Object;
                /** The amount of gas to attach to the transaction */
                gas: string;
                /** The amount of NEAR to attach to the transaction */
                deposit: string;
            };
        }[];
    }[];
}) => Promise<FinalExecutionOutcome[]>;
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
export declare const trialCallMethod: ({ trialAccountId, trialAccountSecretKey, contractId, methodName, args, attachedGas, attachedDeposit, }: {
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
}) => Promise<FinalExecutionOutcome[]>;
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
export declare const canExitTrial: ({ trialAccountId, }: {
    /** The account ID of the trial account */
    trialAccountId: string;
}) => Promise<boolean>;
