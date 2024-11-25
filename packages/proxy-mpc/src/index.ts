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

export { TrialAccountManager } from "./lib/TrialAccountManager";
export { setupKeypomTrialSelector } from "./lib/wallet-selector/setup";

// Export types for user convenience
export * from "./lib/types";
