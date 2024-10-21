import {
    Hash,
    Hex,
    keccak256,
    parseTransaction,
    serializeTransaction,
} from "viem";
import { Network } from ".";
import { TransactionWithSignature } from "./types";

export function addSignature({
    transaction,
    signature,
}: TransactionWithSignature): Hex {
    // @ts-ignore
    const txData = parseTransaction(transaction);
    const signedTx = {
        ...signature,
        ...txData,
    };
    // @ts-ignore
    return serializeTransaction(signedTx);
}

/**
 * Relays valid representation of signed transaction to Etherem mempool for execution.
 *
 * @param {TransactionWithSignature} tx - Signed Ethereum transaction.
 * @returns Hash of relayed transaction.
 */
export async function broadcastSignedTransaction(
    tx: TransactionWithSignature
): Promise<Hash> {
    const signedTx = addSignature(tx);
    return relaySignedTransaction(signedTx);
}

/**
 * Relays signed transaction to Ethereum mem-pool for execution.
 * @param serializedTransaction - Signed Ethereum transaction.
 * @returns Transaction Hash of relayed transaction.
 */
export async function relaySignedTransaction(
    serializedTransaction: Hex,
    wait: boolean = true
): Promise<Hash> {
    // @ts-ignore
    const tx = parseTransaction(serializedTransaction);
    const network = Network.fromChainId(tx.chainId!);
    if (wait) {
        // @ts-ignore
        const hash = await network.client.sendRawTransaction({
            serializedTransaction,
        });
        console.log(`Transaction Confirmed: ${network.scanUrl}/tx/${hash}`);
        return hash;
    } else {
        // @ts-ignore
        network.client.sendRawTransaction({
            serializedTransaction,
        });
        return keccak256(serializedTransaction);
    }
}
