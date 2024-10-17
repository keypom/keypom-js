import { ethers, JsonRpcProvider } from "ethers";

export function getSponsorEVMWallet(
    evmPrivateKey: string,
    providerUrl: string,
    chainId: string
) {
    // Convert the hex private key string into a Uint8Array
    const hexPrivateKey = evmPrivateKey.startsWith("0x")
        ? evmPrivateKey.slice(2)
        : evmPrivateKey;

    const privateKeyBytes = Uint8Array.from(Buffer.from(hexPrivateKey, "hex"));

    // Initialize provider
    const provider = new JsonRpcProvider(providerUrl, chainId);

    // Create the wallet using the private key bytes
    const SPONSOR_WALLET = new ethers.Wallet(
        new ethers.SigningKey(privateKeyBytes),
        provider
    );

    return SPONSOR_WALLET;
}
