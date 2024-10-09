// createContract.ts

import { Account } from "@near-js/accounts";
import { Near } from "@near-js/wallet-account";
import { Config } from "./types";
import { createAccountDeployContract } from "./nearUtils";

interface DeployContractParams {
  near: Near;
  config: Config;
  signerAccount: Account;
  contractAccountId: string;
  mpcContractId: string;
  wasmFilePath: string;
  initialBalance: string; // NEAR amount as a string
}

/**
 * Deploys the trial contract by creating a new account and deploying the contract code.
 *
 * @param params - The parameters required to deploy the contract.
 * @returns A Promise that resolves when the deployment is complete.
 */
export async function deployTrialContract(
  params: DeployContractParams,
): Promise<void> {
  const {
    near,
    signerAccount,
    contractAccountId,
    config,
    mpcContractId,
    wasmFilePath,
    initialBalance,
  } = params;

  await createAccountDeployContract({
    config,
    near,
    signerAccount,
    newAccountId: contractAccountId,
    amount: initialBalance,
    wasmPath: wasmFilePath,
    methodName: "new",
    args: {
      mpc_contract: mpcContractId,
      admin_account: signerAccount.accountId,
    },
  });
}
