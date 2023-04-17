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
export declare const MODAL_TYPE_IDS: {
    CLAIM_TRIAL: string;
    TRIAL_OVER: string;
    ACTION_ERROR: string;
    INSUFFICIENT_BALANCE: string;
};
export declare const MODAL_DEFAULTS: {
    claimTrial: {
        mainBody: {
            title: string;
            body: string;
        };
    };
    trialOver: {
        mainBody: {
            title: string;
            body: string;
            headerOne: {
                title: string;
                description: string;
            };
            headerTwo: {
                title: string;
                description: string;
            };
        };
        moduleList: {
            modulesTitle: string;
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
