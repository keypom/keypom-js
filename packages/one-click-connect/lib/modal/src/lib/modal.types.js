"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MODAL_DEFAULTS = exports.MODAL_TYPE_IDS = void 0;
exports.MODAL_TYPE_IDS = {
    BEGIN_TRIAL: "begin-trial",
    TRIAL_OVER: "trial-over",
    ACTION_ERROR: "action-error",
    INSUFFICIENT_BALANCE: "insufficient-balance",
};
exports.MODAL_DEFAULTS = {
    beginTrial: {
        landing: {
            title: "Create an Account",
            body: "To start, enter a username.",
            fieldPlaceholder: "Account Name",
            buttonText: "Create",
            subText: {
                landing: "Customize your account name.",
                invalidAccountId: "Invalid Character in Account Name.",
            },
        },
        claiming: {
            title: "Creating Account",
            body: "Your account is being created. Please wait...",
        },
        claimed: {
            title: "You're all set!🎉",
            body: "Your account has been successfully created.",
            buttonText: "Continue to app",
        },
    },
    trialOver: {
        mainBody: {
            title: "Your trial has ended",
            body: "Choose a wallet provider and onboard fully into the NEAR ecosystem.",
            imageOne: {
                title: "Secure Your Digital Assets",
                body: "Now that your trial is over, secure your account with an official wallet provider!",
            },
            imageTwo: {
                title: "Log In to Any NEAR App",
                body: "Once your account is secured, you can use any app on NEAR!",
            },
        },
        offboardingOptions: {
            title: "Choose a Wallet",
        },
    },
    invalidAction: {
        title: "Invalid Action",
        body: "Your trial does not allow you to perform this action. For more information, please contact the site administrator.",
    },
    insufficientBalance: {
        title: "Insufficient Balance",
        body: "Your account does not have enough balance for the action you are trying to perform. Please try again with a different action. For more information, please contact the site administrator.",
    },
};
