"use strict";
// lib/createTrial.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTrial = void 0;
const types_1 = require("./types");
const near_1 = require("./networks/near");
const utils_1 = require("@near-js/utils");
/**
 * Creates a new trial on the trial contract.
 *
 * @param params - The parameters required to create a trial.
 * @returns A Promise that resolves to the trial ID.
 * @throws Will throw an error if the trial creation fails.
 */
async function createTrial(params) {
    const { signerAccount, trialContractId, trialData } = params;
    console.log("Creating trial...");
    // Serialize chain constraints appropriately
    const { chainConstraints, ...restTrialData } = trialData;
    let serializedChainConstraints;
    if (chainConstraints.NEAR) {
        serializedChainConstraints = {
            NEAR: (0, types_1.toSnakeCase)(chainConstraints.NEAR),
        };
    }
    else if (chainConstraints.EVM) {
        serializedChainConstraints = { EVM: (0, types_1.toSnakeCase)(chainConstraints.EVM) };
    }
    else {
        throw new Error("chainConstraints must have either NEAR or EVM defined");
    }
    // Convert camelCase trialData to snake_case and include chain_constraints
    const snakeCaseArgs = (0, types_1.toSnakeCase)({
        ...restTrialData,
        initial_deposit: (0, utils_1.parseNearAmount)(trialData.initialDeposit),
        chain_constraints: serializedChainConstraints,
    });
    const result = await (0, near_1.sendTransaction)({
        signerAccount,
        receiverId: trialContractId,
        methodName: "create_trial",
        args: snakeCaseArgs,
        deposit: "1",
        gas: "300000000000000",
    });
    const trialId = result.status.SuccessValue
        ? parseInt(Buffer.from(result.status.SuccessValue, "base64").toString(), 10)
        : null;
    if (trialId === null) {
        throw new Error("Failed to create trial");
    }
    console.log(`Trial created with ID: ${trialId}`);
    return trialId;
}
exports.createTrial = createTrial;
