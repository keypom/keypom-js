import { BrowserWalletBehaviour, Wallet } from "@near-wallet-selector/core/lib/wallet/wallet.types";
import { Maybe } from "../keypom";
import { PasswordPerUse } from "./drops";
import { GeneratedKeyPairs } from "./general";
import { ProtocolReturnedDropConfig, ProtocolReturnedFCData, ProtocolReturnedFTData, ProtocolReturnedNFTData, ProtocolReturnedSimpleData } from "./protocol";
import { Account } from "@near-js/accounts";
import { Transaction } from "@near-js/transactions";
export declare type AnyWallet = BrowserWalletBehaviour | Wallet | Promise<Wallet>;
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
    keys?: GeneratedKeyPairs;
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
    config?: ProtocolReturnedDropConfig;
    metadata?: string;
    required_gas?: string;
    simple?: ProtocolReturnedSimpleData;
    ft?: ProtocolReturnedFTData;
    nft?: ProtocolReturnedNFTData;
    fc?: ProtocolReturnedFCData;
    passwords_per_use?: Array<Maybe<Array<PasswordPerUse>>>;
}
