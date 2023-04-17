export type Theme = "dark" | "light" | "auto";

export interface ModalOptions {
  modules: any[];
  accountId: string;
  secretKey: string;
  modulesTitle?: string;
  mainTitle?: string;
  mainBody?: string;
  headerOne?: any;
  headerTwo?: any;
  button?: any;
  delimiter: string;
  theme?: Theme;
  description?: string;
  onHide?: (hideReason: "user-triggered" | "wallet-navigation") => void;
}

export interface PostTrialModules {
  name: string;
  description: string;
  iconUrl: string;
  baseRedirectUrl: string;
  delimiter?: string;
}

export interface MainBodyHeaders {
  title?: string;
  description?: string;
}

export interface MainBodyButton {
  url?: string;
  newTab?: boolean;
  text?: string;
}

export interface KeypomTrialModal {
  show(modalType?: ModalType): void;
  hide(): void;
}

export interface ModalType {
  id: string;
  meta?: any;
}

export const MODAL_TYPE_IDS = {
  CLAIM_TRIAL: "claim-trial",
  TRIAL_OVER: "trial-over",
  ACTION_ERROR: "action-error",
  INSUFFICIENT_BALANCE: "insufficient-balance"
}
export const MODAL_DEFAULTS = {
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
}
