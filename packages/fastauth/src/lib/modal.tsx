// modal.tsx
import React from "react";
import { WalletSelector } from "@near-wallet-selector/core";
import type { Root } from "react-dom/client";
import { createRoot } from "react-dom/client";
import FastAuthModal from "./FastAuthModal";
import FastAuthProvider from "./FastAuthProvider"; // Import the provider
import { setupModal as setupWalletSelectorModal } from "@near-wallet-selector/modal-ui"; // Import setupModal

interface MyCustomModal {
    show: () => void;
    hide: () => void;
}

let root: Root | null = null;

export function setupModal(
    selector: WalletSelector,
    options: any
): MyCustomModal {
    let isVisible = false;
    let walletSelectorModal = null;

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

        if (!walletSelectorModal) {
            walletSelectorModal = setupWalletSelectorModal(selector, {
                contractId: options.contractId,
                methodNames: options.methodNames,
                theme: options.theme,
                description: options.description,
                // Include other options as needed
            });
        }

        root.render(
            <FastAuthProvider clientId={options.clientId}>
                <FastAuthModal
                    selector={selector}
                    options={options}
                    isVisible={isVisible}
                    onClose={hide}
                    walletSelectorModal={walletSelectorModal}
                />
            </FastAuthProvider>
        );
    };

    return {
        show,
        hide,
    };
}
