import { ActionToPerform, TrialData } from "./types";
/**
 * Checks the validity of actions against trial data constraints.
 * @param actionsToPerform - The actions to validate.
 * @param trialData - The trial data containing constraints.
 * @throws Will throw an error if any action is invalid.
 */
export declare function checkActionValidity(actionsToPerform: ActionToPerform[], trialData: TrialData): void;
