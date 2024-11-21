// src/FastAuthProvider.tsx
import React from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";

interface FastAuthProviderProps {
    children: React.ReactNode;
    clientId: string;
}

const FastAuthProvider: React.FC<FastAuthProviderProps> = ({
    children,
    clientId,
}) => {
    return (
        <GoogleOAuthProvider clientId={clientId}>
            {children}
        </GoogleOAuthProvider>
    );
};

export default FastAuthProvider;
