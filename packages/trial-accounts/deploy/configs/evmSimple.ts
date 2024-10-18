// src/configs/simple.ts

import { UnencryptedFileSystemKeyStore } from "@near-js/keystores-node";
import path from "path";
import os from "os";
import { Config } from "./type";
import { TrialData, ActionToPerform, AccessList } from "../../src/index";
import { BASE_NFT_ABI } from "../abis/baseNFT";
import { parseUnits } from "ethers";

const homedir = os.homedir();
const CREDENTIALS_DIR = ".near-credentials";
const credentialsPath = path.join(homedir, CREDENTIALS_DIR);

export const config: Config = {
    networkId: "testnet",
    trialContractId: "1729285079158-trial-contract.testnet",
    signerAccountId: "benjiman.testnet",
    keyStore: new UnencryptedFileSystemKeyStore(credentialsPath),
    mpcContractId: "v1.signer-prod.testnet",
    numberOfKeys: 1,
    dataDir: "./data",
};

export const trialData: TrialData = {
    constraintsByChainId: {
        EVM: {
            chainId: 84532,
            allowedMethods: [
                "multiAddressLazyMintNone",
                "multiAddressLazyMint",
            ],
            allowedContracts: ["0xCeb40Ce9979f2F044031759cCA5a3e2C3fc04c42"],
            maxGas: 1000000, // Optional
            maxValue: "0", // Optional
        },
    },
    usageConstraints: null,
    interactionLimits: null,
    exitConditions: null,
    expirationTime: null,
    initialDeposit: "10",
};

// ARGUMENTS TO THE FUNCTION CALL
const args = [];

const accessList: AccessList = [];
export const actionsToPerform: ActionToPerform[] = [
    {
        chain: "EVM",
        chainId: 84532,
        targetContractId: "0xCeb40Ce9979f2F044031759cCA5a3e2C3fc04c42",
        methodName: "multiAddressLazyMintNone",
        args,
        abi: BASE_NFT_ABI, // Provide the ABI of the contract
        gasLimit: "100000", // Adjust as needed
        value: "0", // If no ETH is sent along with the transaction
        maxFeePerGas: parseUnits("20", "gwei").toString(),
        maxPriorityFeePerGas: parseUnits("2", "gwei").toString(),
        accessList: accessList,
    },
];
