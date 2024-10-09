// createTrial.ts

import { Account } from "@near-js/accounts";
import { TrialData } from "./types";
import { sendTransaction, toSnakeCase } from "./nearUtils";
import { parseNearAmount } from "@near-js/utils";

interface CreateTrialParams {
  signerAccount: Account;
  contractAccountId: string;
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
  const { signerAccount, contractAccountId, trialData } = params;

  console.log("Creating trial...");

  // Convert camelCase trialData to snake_case
  const snakeCaseArgs = toSnakeCase({
    ...trialData,
    initial_deposit: parseNearAmount(trialData.initialDeposit),
  });

  const result = await sendTransaction({
    signerAccount,
    receiverId: contractAccountId,
    methodName: "create_trial",
    args: snakeCaseArgs,
    deposit: "1",
    gas: "300000000000000",
  });

  const trialId = (result.status as any).SuccessValue
    ? parseInt(
        Buffer.from((result.status as any).SuccessValue, "base64").toString(),
        10,
      )
    : null;

  if (!trialId) {
    throw new Error("Failed to create trial");
  }

  console.log(`Trial created with ID: ${trialId}`);
  return trialId;
}
