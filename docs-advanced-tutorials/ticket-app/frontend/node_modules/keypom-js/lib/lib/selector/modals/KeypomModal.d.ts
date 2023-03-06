import React from "react";
import { ModalOptions } from "./modal";
interface ModalProps {
    options: ModalOptions;
    visible: boolean;
    hide: () => void;
    onSubmit: (e: any) => void;
}
export declare const KeypomModal: React.FC<ModalProps>;
export {};
