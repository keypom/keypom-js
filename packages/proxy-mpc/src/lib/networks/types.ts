import {
    Address,
    Hex,
    SignableMessage,
    Signature,
    TransactionSerializable,
    TypedDataDomain,
} from "viem";

/**
 * Represents the base transaction structure.
 *
 * @property {`0x${string}`} to - Recipient of the transaction.
 * @property {bigint} [value] - ETH value of the transaction.
 * @property {`0x${string}`} data - Call data of the transaction.
 * @property {number} chainId - Integer ID of the network for the transaction.
 * @property {number} [nonce] - Specified transaction nonce.
 * @property {bigint} [gas] - Optional gas limit.
 */
export interface BaseTx {
    to: `0x${string}`;
    value?: bigint;
    data?: `0x${string}`;
    chainId: number;
    nonce?: number;
    gas?: bigint;
}

/**
 * Represents the gas fees for an Ethereum transaction.
 *
 * @property {bigint} maxFeePerGas - The maximum fee per gas unit.
 * @property {bigint} maxPriorityFeePerGas - The maximum priority fee per gas unit.
 */
export interface GasFees {
    maxFeePerGas: bigint;
    maxPriorityFeePerGas: bigint;
}

/**
 * Represents the data for a message.
 *
 * @property {Hex} address - The address associated with the message.
 * @property {SignableMessage} message - The signable message.
 */
export interface MessageData {
    address: Hex;
    message: SignableMessage;
}

interface TypedDataTypes {
    name: string;
    type: string;
}
type TypedMessageTypes = {
    [key: string]: TypedDataTypes[];
};

/**
 * Represents the data for a typed message.
 *
 * @property {TypedDataDomain} domain - The domain of the message.
 * @property {TypedMessageTypes} types - The types of the message.
 * @property {Record<string, unknown>} message - The message itself.
 * @property {string} primaryType - The primary type of the message.
 */
export type EIP712TypedData = {
    domain: TypedDataDomain;
    types: TypedMessageTypes;
    message: Record<string, unknown>;
    primaryType: string;
};

/**
 * Represents the recovery data.
 *
 * @property {string} type - The type of the recovery data.
 * @property {MessageData | EIP712TypedData | Hex} data - The recovery data.
 */
export interface RecoveryData {
    // TODO use enum!
    type: string;
    data: MessageData | EIP712TypedData | Hex;
}

/**
 * Sufficient data required to construct a signed Ethereum Transaction.
 *
 * @property {Hex} transaction - Unsigned Ethereum transaction data.
 * @property {Signature} signature - Representation of the transaction's signature.
 */
export interface TransactionWithSignature {
    transaction: Hex;
    signature: Signature;
}

/// Below is hand-crafted types losely related to wallet connect

/**
 * Interface representing the parameters required for an Ethereum transaction.
 *
 * @property {Hex} from - The sender's Ethereum address in hexadecimal format.
 * @property {Hex} to - The recipient's Ethereum address in hexadecimal format.
 * @property {Hex} [gas] - Optional gas limit for the transaction in hexadecimal format.
 * @property {Hex} [value] - Optional amount of Ether to send in hexadecimal format.
 * @property {Hex} [data] - Optional data payload for the transaction in hexadecimal format, often used for contract interactions. */
export interface EthTransactionParams {
    from: Hex;
    to: Hex;
    gas?: Hex;
    value?: Hex;
    data?: Hex;
}

/**
 * Type representing the parameters for a personal_sign request.
 *
 * @type {[Hex, Address]}
 * @property {Hex} 0 - The message to be signed in hexadecimal format.
 * @property {Address} 1 - The address of the signer in hexadecimal format.
 */
export type PersonalSignParams = [Hex, Address];

/**
 * Type representing the parameters for an eth_sign request.
 *
 * @type {[Address, Hex]}
 * @property {Address} 0 - The address of the signer in hexadecimal format.
 * @property {Hex} 1 - The message to be signed in hexadecimal format.
 */
export type EthSignParams = [Address, Hex];

/**
 * Type representing the parameters for signing complex structured data (like EIP-712).
 *
 * @type {[Hex, string]}
 * @property {Hex} 0 - The address of the signer in hexadecimal format.
 * @property {string} 1 - The structured data in JSON string format to be signed.
 */
export type TypedDataParams = [Hex, string];

/**
 * Type representing the possible request parameters for a signing session.
 *
 * @type {EthTransactionParams[] | Hex | PersonalSignParams | EthSignParams | TypedDataParams}
 * @property {EthTransactionParams[]} - An array of Ethereum transaction parameters.
 * @property {Hex} - A simple hexadecimal value representing RLP Encoded Ethereum Transaction.
 * @property {PersonalSignParams} - Parameters for a personal sign request.
 * @property {EthSignParams} - Parameters for an eth_sign request.
 * @property {TypedDataParams} - Parameters for signing structured data.
 */
export type SessionRequestParams =
    | EthTransactionParams[]
    | Hex
    | PersonalSignParams
    | EthSignParams
    | TypedDataParams;

/**
 * An array of supported signing methods.
 */
export const signMethods = [
    "eth_sign",
    "personal_sign",
    "eth_sendTransaction",
    "eth_signTypedData",
    "eth_signTypedData_v4",
] as const;

/**
 * Type representing one of the supported signing methods.
 */
export type SignMethod = (typeof signMethods)[number];

/**
 * Interface representing the data required for a signature request.
 *
 * @property {SignMethods} method - The signing method to be used.
 * @property {number} chainId - The ID of the Ethereum chain where the transaction or signing is taking place.
 * @property {SessionRequestParams} params - The parameters required for the signing request, which vary depending on the method.
 */
export type SignRequestData = {
    method: SignMethod;
    chainId: number;
    params: SessionRequestParams;
};
