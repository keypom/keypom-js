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

export interface KeypomTrialModal {
  show(): void;
  hide(): void;
}
