import Web3 from "web3";
import WalletConnectProvider from "@walletconnect/web3-provider";

/**
 * Function to handle One Click Connect without wagmi, using WalletConnectProvider.
 *
 * @param connect - Function to call once the wallet is connected.
 */
export const setupOneClickConnect = async (connect: Function) => {
    const urlParams = new URLSearchParams(window.location.search);
    const connectionAccount = urlParams.get("connectionAccount");
    console.log("connectionAccount from URL:", connectionAccount);

    if (connectionAccount) {
        try {
            // Initialize the WalletConnect provider
            const provider = new WalletConnectProvider({
                bridge: "https://bridge.walletconnect.org", // Required bridge for WalletConnect
                qrcode: false, // Disable QR code since we are doing a direct connection
            });

            // Enable the provider, which initiates the connection
            await provider.enable();
            console.log("Provider enabled:", provider);

            // Initialize Web3 with the WalletConnect provider
            const web3 = new Web3(provider);
            console.log("Web3 instance created:", web3);

            // Call the connect function with the wallet details
            connect({
                walletAddress: connectionAccount,
                provider, // Pass the provider directly instead of web3.currentProvider
            });
        } catch (error) {
            console.error("Failed to connect WalletConnect:", error);
        }
    }
};
