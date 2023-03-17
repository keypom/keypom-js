import type { KeypomTrialModal, ModalOptions } from "./modal.types";
export declare const MODAL_TYPE: {
    TRIAL_OVER: string;
    ERROR: string;
};
export declare const MODAL_DEFAULTS: {
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
    error: {
        title: string;
        body: string;
    };
};
export declare const setupModal: (options: ModalOptions) => KeypomTrialModal;
