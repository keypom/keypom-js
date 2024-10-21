// lib/createTrial.ts

import { Account } from "@near-js/accounts";
import { toSnakeCase, TrialData } from "./types";
import { sendTransaction } from "./networks/near";
import { ExtEVMConstraints, NEARConstraints } from "./types/ChainConstraints";

interface CreateTrialParams {
    signerAccount: Account;
    trialContractId: string;
    trialData: TrialData;
}

/**
 * Creates a new trial on the trial contract.
 *
 * @param params - The parameters required to create a trial.
 * @returns A Promise that resolves to the trial ID.
 * @throws Will throw an error if the trial creation fails.
 */
export async function createTrial(params: CreateTrialParams): Promise<number> {
    const { signerAccount, trialContractId, trialData } = params;

    // Type guard to check if value is ExtEVMConstraints
    const isExtEVMConstraints = (
        value: NEARConstraints | ExtEVMConstraints
    ): value is ExtEVMConstraints => {
        return (value as ExtEVMConstraints).chainId !== undefined;
    };

    // Transform constraintsByChainId to use chain ID directly if it's EVM
    const transformedConstraints = Object.entries(
        trialData.constraintsByChainId
    ).reduce((acc, [key, value]) => {
        if (key === "EVM" && isExtEVMConstraints(value)) {
            // Now TypeScript knows that value is ExtEVMConstraints
            const evmConstraints = value;
            acc[evmConstraints.chainId] = { ...evmConstraints };
            acc[evmConstraints.chainId].initialDeposit =
                acc[evmConstraints.chainId].initialDeposit.toString();
            // @ts-ignore
            delete acc[evmConstraints.chainId].chainId; // Remove chainId as it's now used as the key
        } else {
            acc[key] = value;
        }
        return acc;
    }, {} as Record<string | number, NEARConstraints | ExtEVMConstraints>);

    const { constraintsByChainId, ...restTrialData } = trialData;

    const snakeCaseArgs = toSnakeCase({
        ...restTrialData,
        chain_constraints: transformedConstraints, // Use transformed constraints here
    });

    const result = await sendTransaction({
        signerAccount,
        receiverId: trialContractId,
        methodName: "create_trial",
        args: snakeCaseArgs,
        deposit: "1",
        gas: "300000000000000",
    });

    const trialId = (result.status as any).SuccessValue
        ? parseInt(
              Buffer.from(
                  (result.status as any).SuccessValue,
                  "base64"
              ).toString(),
              10
          )
        : null;

    if (trialId === null) {
        throw new Error("Failed to create trial");
    }

    console.log(`Trial created with ID: ${trialId}`);
    return trialId;
}
