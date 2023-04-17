"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MODAL_DEFAULTS = exports.MODAL_TYPE_IDS = void 0;
exports.MODAL_TYPE_IDS = {
    CLAIM_TRIAL: "claim-trial",
    TRIAL_OVER: "trial-over",
    ACTION_ERROR: "action-error",
    INSUFFICIENT_BALANCE: "insufficient-balance"
};
exports.MODAL_DEFAULTS = {
    claimTrial: {
        mainBody: {
            title: "Create An Account",
            body: "Choose a new Account name to start using the app:",
        }
    },
    trialOver: {
        mainBody: {
            title: "Your Trial Has Ended",
            body: "To continue using NEAR, secure your account with a wallet.",
            headerOne: {
                title: "Secure & Manage Your Digital Assets",
                description: "No need to create new accounts or credentials. Connect your wallet and you are good to go!"
            },
            headerTwo: {
                title: "Log In to Any NEAR App",
                description: "No need to create new accounts or credentials. Connect your wallet and you are good to go!"
            },
        },
        moduleList: {
            modulesTitle: "Choose a Wallet",
        }
    },
    invalidAction: {
        title: "Invalid Action",
        body: "Your trial does not allow you to perform this action. For more information, please contact the site administrator."
    },
    insufficientBalance: {
        title: "Insufficient Balance",
        body: "Your account does not have enough balance for the action you are trying to perform. Please try again with a different action. For more information, please contact the site administrator."
    }
};
