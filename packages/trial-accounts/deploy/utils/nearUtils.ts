import { FinalExecutionOutcome } from "@near-js/types";
import { Near } from "@near-js/wallet-account";
import { Config } from "../configs/type";

/**
 * Initializes a NEAR connection using the provided configuration.
 *
 * @param config - The configuration object containing network ID, key store, etc.
 * @returns A Promise that resolves to a Near instance.
 */
export async function initNear(config: Config): Promise<Near> {
    const nearConfig = {
        networkId: config.networkId,
        nodeUrl: `https://rpc.${config.networkId}.near.org`,
        keyStore: config.keyStore,
    };
    const near = new Near(nearConfig);
    return near;
}

export function isFinalExecutionOutcome(
    result: any
): result is FinalExecutionOutcome {
    return (
        result &&
        typeof result === "object" &&
        "final_execution_status" in result &&
        "status" in result &&
        "transaction" in result &&
        "transaction_outcome" in result &&
        "receipts_outcome" in result
    );
}
