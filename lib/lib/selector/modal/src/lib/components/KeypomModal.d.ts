import React from "react";
import type { ModalOptions } from "../modal.types";
interface ModalProps {
    options: ModalOptions;
    modalType: string;
    visible: boolean;
    hide: () => void;
}
export declare const KeypomModal: React.FC<ModalProps>;
export {};
