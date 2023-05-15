import React from "react";
import { InvalidActionCustomizations } from "../modal.types";
interface InvalidActionsProps {
    customizations?: InvalidActionCustomizations;
    hide: () => void;
}
export declare const InvalidActions: React.FC<InvalidActionsProps>;
export {};
