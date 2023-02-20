export type Theme = "dark" | "light" | "auto";
export interface ModalOptions {
    theme?: Theme;
    title: string;
    description: string;
    onHide?: (hideReason: "user-triggered") => void;
}
export type ModalHideReason = "user-triggered" | "wallet-navigation";
export interface KeypomTrialModal {
    show(): void;
    hide(): void;
}
export declare const setupKeypomModal: (options: ModalOptions, onSubmit: any) => KeypomTrialModal;
