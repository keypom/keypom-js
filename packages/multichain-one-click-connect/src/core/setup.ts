import Web3 from "web3";
import WalletConnectProvider from "@walletconnect/web3-provider";
import WalletConnect from "@walletconnect/client";

/**
 * Function to handle One Click Connect without wagmi.
 *
 * @param connect - Function to call once the wallet is connected.
 */
export const setupOneClickConnect = async (connect: Function) => {
    const urlParams = new URLSearchParams(window.location.search);
    const connectionAccount = urlParams.get("connectionAccount");
    console.log("connectionAccount", connectionAccount);

    if (connectionAccount) {
        try {
            // Initialize WalletConnect client
            const connector = new WalletConnect({
                bridge: "https://bridge.walletconnect.org", // Required
                qrcodeModal: undefined,
            });
            console.log("connector", connector);

            // If the session is already established, auto-connect to the account
            if (connector.connected) {
                const accounts = connector.accounts;
                const walletAddress = accounts[0];
                if (
                    walletAddress.toLowerCase() ===
                    connectionAccount.toLowerCase()
                ) {
                    // Initialize Web3 with the existing WalletConnect session
                    const provider = new WalletConnectProvider({
                        bridge: "https://bridge.walletconnect.org",
                        qrcode: false, // Disable QR code modal
                    });

                    // Enable session (trigger connection)
                    await provider.enable();

                    const web3 = new Web3(provider);
                    console.log("web3", web3);

                    // Call the connect function with the wallet details
                    connect({
                        walletAddress,
                        provider: web3.currentProvider,
                    });

                    console.info("Auto-connected to wallet:", walletAddress);
                    return;
                }
            }

            // If not already connected, create a session for the specified account
            if (!connector.connected) {
                await connector.createSession(); // Create a session
                console.log("connected", connector.connected);
            }

            // Auto-connect logic: Wait for the connection to complete
            connector.on("connect", async (error, payload) => {
                if (error) {
                    throw error;
                }

                const { accounts } = payload.params[0];
                const walletAddress = accounts[0];

                if (
                    walletAddress.toLowerCase() ===
                    connectionAccount.toLowerCase()
                ) {
                    // Initialize Web3 with the WalletConnect provider
                    const provider = new WalletConnectProvider({
                        bridge: "https://bridge.walletconnect.org",
                        qrcode: false, // Disable QR code modal
                    });

                    // Enable session (trigger connection)
                    await provider.enable();

                    const web3 = new Web3(provider);
                    console.log("web3", web3);

                    // Call the connect function with the wallet details
                    connect({
                        walletAddress,
                        provider: web3.currentProvider,
                    });

                    console.info("Connected to wallet:", walletAddress);
                } else {
                    console.warn(
                        "Wallet connected does not match connectionAccount from URL."
                    );
                }
            });
        } catch (error) {
            console.error(
                "OneClickConnect: Failed to auto-connect wallet",
                error
            );
        }
    }
};
