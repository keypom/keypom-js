// src/modal.tsx
import React from "react";
import { WalletSelector } from "@near-wallet-selector/core";
import type { Root } from "react-dom/client";
import { createRoot } from "react-dom/client";
import FastAuthModal from "./FastAuthModal";

interface MyCustomModal {
    show: () => void;
    hide: () => void;
}

let root: Root | null = null;

export function setupModal(
    selector: WalletSelector,
    options: any
): MyCustomModal {
    console.log("setupModal", selector, options);
    let isVisible = false;

    const show = () => {
        isVisible = true;
        renderModal();
    };

    const hide = () => {
        isVisible = false;
        renderModal();
    };

    const renderModal = () => {
        const container =
            document.getElementById("fastauth-wallet-selector-modal") ||
            document.createElement("div");
        container.id = "fastauth-wallet-selector-modal";
        document.body.appendChild(container);

        if (!root) {
            root = createRoot(container);
        }

        root.render(
            <FastAuthModal
                selector={selector}
                options={options}
                isVisible={isVisible}
                onClose={hide}
            />
        );
    };

    return {
        show,
        hide,
    };
}
