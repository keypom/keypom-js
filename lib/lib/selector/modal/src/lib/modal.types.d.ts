export type Theme = "dark" | "light" | "auto";
export interface ModalOptions {
    accountId: string;
    secretKey: string;
    delimiter: string;
    wallets: OffboardingWallet[];
    beginTrial?: BeginTrialCustomizations;
    trialOver?: TrialOverCustomizations;
    invalidAction?: InvalidActionCustomizations;
    insufficientBalance?: InsufficientBalanceCustomizations;
    theme?: Theme;
    onHide?: (hideReason: "user-triggered" | "wallet-navigation") => void;
}
export interface BeginTrialCustomizations {
    landing?: {
        title?: string;
        body?: string;
        fieldPlaceholder?: string;
        buttonText?: string;
    };
    claiming?: {
        title?: string;
        body?: string;
    };
    claimed?: {
        title?: string;
        body?: string;
        buttonText?: string;
    };
}
export interface TrialOverCustomizations {
    mainBody?: MainBodyCustomizations;
    offboardingOptions?: OffboardingWalletCustomizations;
}
export interface MainBodyCustomizations {
    title?: string;
    body?: string;
    imageOne?: MainBodyImage;
    imageTwo?: MainBodyImage;
    button?: MainBodyButton;
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
export declare const MODAL_TYPE_IDS: {
    BEGIN_TRIAL: string;
    TRIAL_OVER: string;
    ACTION_ERROR: string;
    INSUFFICIENT_BALANCE: string;
};
export declare const MODAL_DEFAULTS: {
    beginTrial: {
        landing: {
            title: string;
            body: string;
            fieldPlaceholder: string;
            buttonText: string;
        };
        claiming: {
            title: string;
            body: string;
        };
        claimed: {
            title: string;
            body: string;
            buttonText: string;
        };
    };
    trialOver: {
        mainBody: {
            title: string;
            body: string;
            imageOne: {
                title: string;
                body: string;
            };
            imageTwo: {
                title: string;
                body: string;
            };
        };
        offboardingOptions: {
            title: string;
        };
    };
    invalidAction: {
        title: string;
        body: string;
    };
    insufficientBalance: {
        title: string;
        body: string;
    };
};
