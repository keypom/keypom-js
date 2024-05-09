import React from "react";
import { ModalType, ModalCustomizations } from "../modal.types";
interface ModalProps {
    options: ModalCustomizations;
    modalType: ModalType;
    visible: boolean;
    hide: () => void;
}
export declare const KeypomModal: React.FC<ModalProps>;
export {};
