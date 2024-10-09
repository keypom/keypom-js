// index.ts

/**
 * Main entry point for the Trial Accounts package.
 *
 * This package provides functions to deploy trial contracts,
 * create trials, add trial accounts, activate trial accounts,
 * perform actions, and broadcast transactions.
 *
 * @packageDocumentation
 */

export { createTrial } from "./lib/createTrial";
export { addTrialAccounts } from "./lib/addTrialKeys";
export { activateTrialAccounts } from "./lib/activateTrial";
export { performActions } from "./lib/performAction";
export { broadcastTransaction } from "./lib/broadcastTransaction";
export { initNear } from "./lib/nearUtils";
export { retryAsync } from "./lib/cryptoUtils";

// Export types for user convenience
export * from "./lib/types";
