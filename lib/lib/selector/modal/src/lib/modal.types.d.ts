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
    text?: string;
}
export interface KeypomTrialModal {
    show(modalType?: string): void;
    hide(): void;
}
