import React from "react";
import { ModalOptions, ModalType } from "../modal.types";
interface ModalProps {
    options: ModalOptions;
    modalType: ModalType;
    visible: boolean;
    hide: () => void;
}
export declare const KeypomModal: React.FC<ModalProps>;
export {};
