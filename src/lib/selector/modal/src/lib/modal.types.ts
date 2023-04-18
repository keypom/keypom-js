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
  data: string;
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
        data: "M33.5 1.83325L30.1666 5.16658M17.4818 17.8514C19.1406 19.5103 20.1666 21.8019 20.1666 24.3333C20.1666 29.3959 16.0626 33.4999 11 33.4999C5.93735 33.4999 1.8333 29.3959 1.8333 24.3333C1.8333 19.2706 5.93735 15.1666 11 15.1666C13.5313 15.1666 15.8229 16.1926 17.4818 17.8514ZM17.4818 17.8514L24.3333 10.9999M24.3333 10.9999L29.3333 15.9999L35.1666 10.1666L30.1666 5.16658M24.3333 10.9999L30.1666 5.16658",
        title: "Secure Your Digital Assets",
        body: "Now that your trial is over, secure your account with an official wallet provider!"
      },
      imageTwo: {
        data: "M35 12.1667H7C5.89543 12.1667 5 11.2712 5 10.1667V7.5C5 6.39543 5.89543 5.5 7 5.5H31.6667",
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
