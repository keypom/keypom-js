import * as nearAPI from "near-api-js";
import { BrowserWalletBehaviour, Wallet } from '@near-wallet-selector/core/lib/wallet/wallet.types';
import { Account } from "near-api-js";
import { CreateOrAddReturn } from './types/params';
import { DropConfig } from './types/drops';
type AnyWallet = BrowserWalletBehaviour | Wallet;
export declare const KEY_LIMIT = 50;
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
export declare const createTrialAccountDrop: ({ account, wallet, contractBytes, trialFundsNEAR, trialFundsYocto, callableContracts, amounts, callableMethods, repayAmountNEAR, repayAmountYocto, repayTo, dropId, config, numKeys, publicKeys, rootEntropy, metadata, useBalance, returnTransactions, successUrl }: {
    /** Account object that if passed in, will be used to sign the txn instead of the funder account. */
    account?: nearAPI.Account | undefined;
    /** If using a browser wallet through wallet selector and that wallet should sign the transaction, pass in the object. */
    wallet?: AnyWallet | undefined;
    /** Bytes of the trial account smart contract */
    contractBytes: number[];
    /** How much $NEAR should the trial account be able to spend before the trial is exhausted. Unit in $NEAR (i.e `1` = 1 $NEAR) */
    trialFundsNEAR?: Number | undefined;
    /** How much $NEAR should the trial account be able to spend before the trial is exhausted. Unit in yoctoNEAR (1 yoctoNEAR = 1e-24 $NEAR) */
    trialFundsYocto?: string | undefined;
    /** The contracts that the trial account should be able to call. */
    callableContracts: string[];
    /** The upper bound of $NEAR that trial account is able to attach to calls associated with each contract passed in. For no upper limit, pass in `*`. Units are in $NEAR (i.e `1` = 1 $NEAR). */
    amounts: string[];
    /** The list of methods that the trial account should be able to call on each respective contract. For multiple methods on a contract, pass in a comma separated string with no spaces (`nft_mint,nft_transfer,nft_approve`). To allow any methods to be called on the receiver contract, pass in `*`. */
    callableMethods: string[];
    /** How much $NEAR should be paid back to the specified funder in order to unlock the trial account. Unit in $NEAR (i.e `1` = 1 $NEAR) */
    repayAmountNEAR?: Number | undefined;
    /** How much $NEAR should be paid back to the specified funder in order to unlock the trial account. Unit in yoctoNEAR (1 yoctoNEAR = 1e-24 $NEAR) */
    repayAmountYocto?: string | undefined;
    /** The account that should receive the repayment of the trial account. If not specified, the drop funder will be used. */
    repayTo?: string | undefined;
    /** Specify a custom drop ID rather than using the incrementing nonce on the contract. */
    dropId?: string | undefined;
    /** Allows specific drop behaviors to be configured such as the number of uses each key / link will have. */
    config?: DropConfig | undefined;
    /**
     * Specify how many keys should be generated for the drop. If the funder has rootEntropy set OR rootEntropy is passed in, the keys will be
     * deterministically generated using the drop ID, key nonce, and entropy. Otherwise, each key will be generated randomly.
    */
    numKeys: number;
    /** Pass in a custom set of publicKeys to add to the drop. If this is not passed in, keys will be generated based on the numKeys parameter. */
    publicKeys?: string[] | undefined;
    /** Specify an entropy to use for generating keys (will overload the funder's rootEntropy if applicable). This parameter only matters if the publicKeys variable is not passed in. */
    rootEntropy?: string | undefined;
    /** String of metadata to attach to the drop. This can be whatever you would like and is optional. Often this is stringified JSON. */
    metadata?: string | undefined;
    /** If the account has a balance within the Keypom contract, set this to true to avoid the need to attach a deposit. If the account doesn't have enough balance, an error will throw. */
    useBalance?: boolean | undefined;
    /** If true, the transaction will be returned instead of being signed and sent. This is useful for getting the requiredDeposit from the return value without actually signing the transaction. */
    returnTransactions?: boolean | undefined;
    /** When signing with a wallet, a success URl can be included that the user will be redirected to once the transaction has been successfully signed. */
    successUrl?: string | undefined;
}) => Promise<CreateOrAddReturn>;
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
export declare const claimTrialAccountDrop: ({ secretKey, desiredAccountId, }: {
    /** The private key associated with the Keypom link. This can either contain the `ed25519:` prefix or not. */
    secretKey: string;
    /** The account ID that will be created for the trial */
    desiredAccountId: string;
}) => Promise<any>;
export {};
