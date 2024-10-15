// lib/createTrial.ts

import { Account } from "@near-js/accounts";
import { toSnakeCase, TrialData } from "./types";
import { sendTransaction } from "./networks/near";
import { parseNearAmount } from "@near-js/utils";

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

    console.log("Creating trial...");

    // Serialize chain constraints appropriately
    const { chainConstraints, ...restTrialData } = trialData;

    let serializedChainConstraints: any;
    if (chainConstraints.NEAR) {
        serializedChainConstraints = {
            NEAR: toSnakeCase(chainConstraints.NEAR),
        };
    } else if (chainConstraints.EVM) {
        serializedChainConstraints = { EVM: toSnakeCase(chainConstraints.EVM) };
    } else {
        throw new Error(
            "chainConstraints must have either NEAR or EVM defined"
        );
    }

    // Convert camelCase trialData to snake_case and include chain_constraints
    const snakeCaseArgs = toSnakeCase({
        ...restTrialData,
        initial_deposit: parseNearAmount(trialData.initialDeposit),
        chain_constraints: serializedChainConstraints,
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
