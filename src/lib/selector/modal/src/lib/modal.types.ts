export type Theme = "dark" | "light" | "auto";

export interface ModalOptions {
  accountId: string;
  secretKey: string;
  delimiter: string;
  wallets: OffboardingWallet[];
  
  beginTrial?: BeginTrialCustomizations,
  trialOver?: TrialOverCustomizations,
  invalidAction?: InvalidActionCustomizations,
  insufficientBalance?: InsufficientBalanceCustomizations,

  theme?: Theme;
  onHide?: (hideReason: "user-triggered" | "wallet-navigation") => void;
}

export interface BeginTrialCustomizations {
  landing?: {
    title?: string;
    body?: string;
    fieldPlaceholder?: string;
    buttonText?: string;
  },
  claiming?: {
      title?: string;
      body?: string;
  },
  claimed?: {
      title?: string;
      body?: string;
      buttonText?: string;
  }
}

export interface TrialOverCustomizations {
  mainBody?: MainBodyCustomizations,
  offboardingOptions?: OffboardingWalletCustomizations
}

export interface MainBodyCustomizations {
  title?: string;
  body?: string;
  imageOne?: MainBodyImage,
  imageTwo?: MainBodyImage,
  button?: MainBodyButton
}

export interface OffboardingWalletCustomizations {
  title?: string;
}

export interface InvalidActionCustomizations {
  title?: string;
  body?: string;
}

export interface InsufficientBalanceCustomizations {
  title?: string;
  body?: string;
}

export interface OffboardingWallet {
  name: string;
  description: string;
  iconUrl: string;
  baseRedirectUrl: string;
  delimiter?: string;
}

export interface MainBodyImage {
  title: string;
  body: string;
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
  BEGIN_TRIAL: "begin-trial",
  TRIAL_OVER: "trial-over",
  ACTION_ERROR: "action-error",
  INSUFFICIENT_BALANCE: "insufficient-balance"
}

export const MODAL_DEFAULTS = {
  beginTrial: {
    landing: {
      title: "Create an Account",
      body: "To start, enter a username.",
      fieldPlaceholder: "Account ID",
      buttonText: "Create",
    },
    claiming: {
        title: "Creating Account",
        body: "Your account is being created. Please wait...",
    },
    claimed: {
        title: "You're all set!🎉",
        body: "Your account has been successfully created.",
        buttonText: "Continue to app"
    }
  },
  trialOver: {
    mainBody: {
      title: "Your trial has ended",
      body: "Choose a wallet provider and onboard fully into the NEAR ecosystem.",
      imageOne: {
        title: "Secure Your Digital Assets",
        body: "Now that your trial is over, secure your account with an official wallet provider!"
      },
      imageTwo: {
        title: "Log In to Any NEAR App",
        body: "Once your account is secured, you can use any app on NEAR!"
      }
    },
    offboardingOptions: {
      title: "Choose a Wallet",
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
