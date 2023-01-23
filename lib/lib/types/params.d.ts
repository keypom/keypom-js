import { Transaction } from '@near-wallet-selector/core';
import { BrowserWalletBehaviour, Wallet } from '@near-wallet-selector/core/lib/wallet/wallet.types';
import { Account } from "near-api-js";
import { Maybe } from '../keypom';
import { PasswordPerUse } from './drops';
import { GeneratedKeyPairs } from './general';
type AnyWallet = BrowserWalletBehaviour | Wallet;
/**
 * Information returned when creating a drop or adding keys via `createDrop` and `addKeys` respectively.
 */
export interface CreateOrAddReturn {
    /** The responses to any transactions that were signed and sent to the network. */
    responses?: any;
    /** Information about the transactions if `returnTransactions` is specified in the arguments. This will result in the information being returned instead of signed and sent.  */
    transactions?: Transaction[];
    /** The required deposit that should be attached to the transaction. */
    requiredDeposit?: string;
    /** Any keys that were automatically generated. */
    keys?: Maybe<GeneratedKeyPairs>;
    /** The drop ID for the drop that is being interacted with. */
    dropId: string;
}
/**
 * @ignore
 */
export interface RegisterUsesParams {
    account?: Account;
    wallet?: AnyWallet;
    dropId: string;
    numUses: number;
    useBalance?: boolean;
}
/** @internal */
export interface CreateDropProtocolArgs {
    public_keys?: string[];
    deposit_per_use: string;
    drop_id?: string;
    config?: {
        uses_per_key?: number;
        time?: {
            start?: number;
            end?: number;
            throttle?: number;
            interval?: number;
        };
        usage?: {
            permission?: string;
            refund_deposit?: boolean;
            auto_delete_drop?: boolean;
            auto_withdraw?: boolean;
        };
        root_account_id?: string;
    };
    metadata?: string;
    simple?: {
        lazy_register?: boolean;
    };
    ft?: {
        contract_id?: string;
        sender_id?: string;
        balance_per_use?: string;
    };
    nft?: {
        sender_id?: string;
        contract_id?: string;
    };
    fc?: {
        methods: Array<Maybe<Array<{
            receiver_id: string;
            method_name: string;
            args: string;
            attached_deposit: string;
            account_id_field?: string;
            drop_id_field?: string;
            key_id_field?: string;
        }>>>;
        config?: {
            attached_gas?: string;
        };
    };
    passwords_per_use?: Array<Maybe<Array<PasswordPerUse>>>;
}
export {};
