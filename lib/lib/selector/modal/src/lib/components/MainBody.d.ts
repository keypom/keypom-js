import React from "react";
import { MainBodyButton, MainBodyHeaders } from "../modal.types";
interface WalletHomeProps {
    title: string;
    body: string;
    headerOne: MainBodyHeaders | null;
    headerTwo: MainBodyHeaders | null;
    button?: MainBodyButton;
    onCloseModal: () => void;
}
export declare const MainBody: React.FC<WalletHomeProps>;
export {};
