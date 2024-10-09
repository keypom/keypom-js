"use strict";
// createTrial.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTrial = void 0;
const types_1 = require("./types");
const nearUtils_1 = require("./nearUtils");
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
    // Convert camelCase trialData to snake_case
    const snakeCaseArgs = (0, types_1.toSnakeCase)({
        ...trialData,
        initial_deposit: (0, utils_1.parseNearAmount)(trialData.initialDeposit),
    });
    const result = await (0, nearUtils_1.sendTransaction)({
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
    if (!trialId) {
        throw new Error("Failed to create trial");
    }
    console.log(`Trial created with ID: ${trialId}`);
    return trialId;
}
exports.createTrial = createTrial;
