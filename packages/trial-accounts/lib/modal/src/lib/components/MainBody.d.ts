import React from "react";
import { MainBodyButton, MainBodyImage } from "../modal.types";
interface MainBodyProps {
    title: string;
    body: string;
    imageOne: MainBodyImage | null;
    imageTwo: MainBodyImage | null;
    button: MainBodyButton | null;
    onCloseModal: () => void;
}
export declare const MainBody: React.FC<MainBodyProps>;
export {};
