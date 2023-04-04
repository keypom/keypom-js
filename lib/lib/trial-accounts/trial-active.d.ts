import { FinalExecutionOutcome } from "@near-wallet-selector/core";
export declare const trialSignAndSendTxns: ({ trialAccountId, trialAccountSecretKey, txns }: {
    trialAccountId: any;
    trialAccountSecretKey: any;
    txns: any;
}) => Promise<FinalExecutionOutcome[]>;
/**
 * Execute a method using a trial account. If the trial account is in the exit state, this will throw an error. Similarly, if the given method data
 * cannot be executed by the trial account (e.g. the attached deposit exceeds the trial account's restrictions), this will throw an error.
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
export declare const trialCallMethod: ({ trialAccountId, trialAccountSecretKey, contractId, methodName, args, attachedGas, attachedDeposit }: {
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
 * @group Trial Accounts
*/
export declare const canExitTrial: ({ trialAccountId }: {
    /** The account ID of the trial account */
    trialAccountId: string;
}) => Promise<boolean>;
