// lib/icons/CloseIcon.tsx
import React from "react";

export const CloseIcon: React.FC = () => (
    <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            d="M11 3L3 11"
            stroke="var(--fastauth-close-button-icon-color)"
            strokeWidth="2"
            strokeLinecap="round"
        />
        <path
            d="M3 3L11 11"
            stroke="var(--fastauth-close-button-icon-color)"
            strokeWidth="2"
            strokeLinecap="round"
        />
    </svg>
);

export default CloseIcon;
