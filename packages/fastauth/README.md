<p align="center">
  <a href="https://docs.keypom.xyz/">
    <picture>
      <img src="https://cloudflare-ipfs.com/ipfs/bafybeightypuoqly32gsrivh4efckhdv6wsefiynpnonlem6ts3ypgdm7e" height="128">
    </picture>
    <h1 align="center">Keypom Multichain Trial Accounts</h1>
  </a>
</p>

<p align="center">
  <a aria-label="Made by Ben Kurrek" href="https://github.com/BenKurrek">
    <img src="https://img.shields.io/badge/MADE%20BY-Ben%20Kurrek-000000.svg?style=for-the-badge">
  </a>
  <a aria-label="License" href="https://github.com/keypom/keypom-js/blob/main/LICENSE">
    <img alt="" src="https://img.shields.io/badge/License-GNU%20GPL-green?style=for-the-badge">
  </a>
  <a aria-label="Join the community" href="https://t.me/+OqI-cKxQU05lZDIx">
    <img alt="" src="https://img.shields.io/badge/Join%20The-community-blueviolet.svg?style=for-the-badge">
  </a>
</p>

The Keypom Multichain Trial Accounts SDK provides a seamless way to create and manage trial accounts across multiple blockchain networks, including NEAR and EVM-compatible chains. This SDK abstracts the complexities involved in setting up trial accounts, managing their constraints, and performing actions on their behalf. With this package, you can:

-   Deploy and manage trial contracts.
-   Create trials with customizable constraints per chain.
-   Add and activate trial accounts with limited access keys.
-   Perform actions on behalf of trial accounts, including contract calls on NEAR and EVM chains.
-   Broadcast transactions signed via Multi-Party Computation (MPC).
-   Handle usage statistics, exit conditions, and expiration for trial accounts.

# Table of Contents

-   [Installation](#installation)
-   [Getting Started](#getting-started)
    -   [Prerequisites](#prerequisites)
    -   [Initialization](#initialization)
-   [Usage Examples](#usage-examples)
    -   [Creating a Trial](#creating-a-trial)
    -   [Adding and Activating Trial Accounts](#adding-and-activating-trial-accounts)
    -   [Performing Actions](#performing-actions)
-   [Configuration](#configuration)
-   [Scripts and Commands](#scripts-and-commands)
-   [Concepts](#concepts)
    -   [Trial Accounts](#trial-accounts)
    -   [MPC Integration](#mpc-integration)
    -   [Usage Constraints](#usage-constraints)
-   [Utilities](#utilities)
-   [Contributing](#contributing)
-   [License](#license)

---

# Installation

To install the Keypom Multichain Trial Accounts SDK, run one of the following commands:

```bash
npm install @keypom/trial-accounts
# or
yarn add @keypom/trial-accounts
# or
pnpm add @keypom/trial-accounts
```

# Getting Started

## Prerequisites

-   **Node.js**: Ensure you have Node.js installed (version 14 or higher recommended).
-   **NEAR CLI**: Install the NEAR CLI for interacting with NEAR blockchain.
-   **EVM Provider**: For EVM interactions, you'll need access to an EVM-compatible network (e.g., Base Sepolia) and an API key from a provider like Alchemy.

## Initialization

Before using the SDK, you need to initialize the `TrialAccountManager` class. This class provides methods to manage trial accounts and interact with the trial contract.

```js
import { TrialAccountManager } from "@keypom/trial-accounts";
import { Near, Account } from "@near-js/wallet-account";
import { UnencryptedFileSystemKeyStore } from "@near-js/keystores-node";
import path from "path";
import os from "os";

// Set up NEAR connection
const homedir = os.homedir();
const credentialsPath = path.join(homedir, ".near-credentials");
const keyStore = new UnencryptedFileSystemKeyStore(credentialsPath);
const near = new Near({
    networkId: "testnet",
    keyStore,
    nodeUrl: "https://rpc.testnet.near.org",
});

const signerAccount = await near.account("your-account.testnet");

const trialManager = new TrialAccountManager({
    trialContractId: "trial-contract.your-account.testnet",
    mpcContractId: "v1.signer-prod.testnet",
    signerAccount,
    near,
});
```

-   `trialContractId`: The account ID where the trial contract is deployed.
-   `mpcContractId`: The account ID of the MPC contract.
-   `signerAccount`: An instance of `Account` used for signing transactions.
-   `near`: The NEAR connection instance.

## Usage Examples

### Creating a Trial

Create a new trial with specific constraints per chain. For example, you can set different allowed methods and contracts for NEAR and EVM chains.

```js
import { TrialData } from "@keypom/trial-accounts";
import { parseEther } from "ethers";
import { parseNearAmount } from "@near-js/utils";

const trialData: TrialData = {
  constraintsByChainId: {
    EVM: {
      chainId: 84532,
      allowedMethods: ["setMessage"],
      allowedContracts: ["0xdf5c3bd628a11C97BB25d441D8b6d9Ce974dc552"],
      maxGas: 1000000,
      maxValue: "0",
      initialDeposit: parseEther("0.004"), // approximately $15 worth of ETH
    },
    NEAR: {
      allowedMethods: ["add_message"],
      allowedContracts: ["guestbook.near-examples.testnet"],
      maxGas: null,
      maxDeposit: null,
      initialDeposit: parseNearAmount("10")!, // 10 NEAR tokens
    },
  },
  usageConstraints: null,
  interactionLimits: null,
  exitConditions: null,
  expirationTime: null,
};

// Create the trial
const trialId = await trialManager.createTrial(trialData);
console.log(`Trial created with ID: ${trialId}`);
```

### Adding and Activating Trial Accounts

Add trial accounts to the trial by generating limited access keys and then activate them.

```js
// Add trial accounts
const numberOfKeys = 1;
const trialKeys = await trialManager.addTrialAccounts(numberOfKeys);
console.log(`Added ${trialKeys.length} trial account(s).`);

// Activate the trial account for a specific chain (e.g., NEAR or EVM)
const trialKey = trialKeys[0];
const chainId = "NEAR"; // or "84532" for EVM chain
const accountId = `trial-account-${Date.now()}.testnet`;

trialManager.setTrialAccountCredentials(
    accountId,
    trialKey.trialAccountSecretKey
);
await trialManager.activateTrialAccounts(accountId, chainId);
console.log(`Trial account ${accountId} activated.`);
```

### Performing Actions

Perform actions on behalf of the trial account, such as calling methods on contracts. The SDK ensures that the actions are within the specified constraints.

```ts
import { ActionToPerform } from "@keypom/trial-accounts";
import { BASE_GUESTBOOK_ABI } from "./abis/baseGuestbook";

// Define the action to perform on the EVM chain
const action: ActionToPerform = {
    chain: "EVM",
    chainId: 84532, // Base Sepolia chain ID
    targetContractId: "0xdf5c3bd628a11C97BB25d441D8b6d9Ce974dc552",
    methodName: "setMessage",
    args: ["Hello from the trial account!"],
    abi: BASE_GUESTBOOK_ABI,
    value: "0",
    accessList: [],
};

// Request signature and perform the action
const providerUrl = `https://base-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY`;
const { signatures, txnDatas } = await trialManager.performActions(
    [action],
    providerUrl
);

// Broadcast the transaction
const { result } = await trialManager.broadcastTransaction({
    actionToPerform: action,
    signatureResult: signatures[0],
    signerAccountId: accountId,
    providerUrl,
    txnData: txnDatas[0],
});

console.log("Action performed successfully.");
```

## Configuration

You can customize various settings, such as retry logic and configurations for different chains.

```ts
// Set custom retry logic
trialManager.setRetryConfig({
    maxRetries: 5,
    initialDelayMs: 2000,
    backoffFactor: 2,
});

// Set trial account credentials if needed
trialManager.setTrialAccountCredentials("trial-account.testnet", "ed25519:...");

// Set trial ID
trialManager.setTrialId(123);
```

-   `maxRetries`: Maximum number of retries for operations.
-   `initialDelayMs`: Initial delay before retrying (in milliseconds).
-   `backoffFactor`: Exponential backoff factor.

## Scripts And Commands

The package includes several scripts to automate common tasks. You can run these scripts using commands defined in the package.json.

```bash
pnpm run deploy:evm
pnpm run deploy:near
pnpm run deploy:omni
```

These scripts correspond to configurations defined in the configs directory:

-   nearSimple: For NEAR-only trials.
-   evmSimple: For EVM-only trials.
-   omniChainSimple: For trials that span both NEAR and EVM chains.

### Running the Scripts

1. Ensure Environment Variables are Set: Create a .env file in the root directory with the necessary environment variables, especially for EVM interactions.

    ```bash
    EVM_PRIVATE_KEY=your_evm_private_key
    ALCHEMY_API_KEY=your_alchemy_api_key
    ```

2. Install Dependencies:

    ```bash
    pnpm install
    ```

3. Run the scripts:
    ```bash
    pnpm run deploy:evm
    pnpm run deploy:near
    pnpm run deploy:omni
    ```

The script will:

-   Initialize the NEAR connection.
-   Create a trial with specified constraints.
-   Add and activate trial accounts.
-   Perform the defined actions.
-   Output the results and write data to the data directory.

# Concepts

## Trial Accounts

Trial accounts are temporary accounts with limited access, ideal for onboarding new users or running promotions. They use limited access keys to ensure they operate within specified constraints.

-   Limited Access Keys: These keys allow calling specific methods on the trial contract.

## MPC Integration

The SDK integrates with a Multi-Party Computation (MPC) service to securely sign transactions without exposing private keys.

-   MPC Contract: The mpcContractId points to the deployed MPC contract that handles signing.
-   Signature Requests: When performing actions, the SDK requests signatures from the MPC contract, ensuring secure transaction signing.

## Usage Constraints

When creating a trial, you can specify various constraints to control how trial accounts interact with the blockchain.

-   Constraints by Chain ID: Define constraints specific to each chain (NEAR, EVM, etc.).
-   Allowed Methods and Contracts: Restrict which methods and contracts trial accounts can interact with.
-   Gas and Value Limits: Set maximum gas usage and transaction values.
-   Initial Deposits: Fund trial accounts automatically upon activation.

Example:

```js
const trialData: TrialData = {
    constraintsByChainId: {
        EVM: {
            chainId: 84532,
            allowedMethods: ["setMessage"],
            allowedContracts: ["0xdf5c3bd628a11C97BB25d441D8b6d9Ce974dc552"],
            maxGas: 1000000,
            maxValue: "0",
            initialDeposit: parseEther("0.004"),
        },
    },
    usageConstraints: null,
    interactionLimits: null,
    exitConditions: null,
    expirationTime: null,
};
```

# Contributing

We welcome contributions to the Keypom Trial Accounts SDK! Please follow these guidelines:

-   **Bug Reports**: Submit detailed bug reports with steps to reproduce.
-   **Feature Requests**: Open issues for feature enhancements with use cases.
-   **Pull Requests**: Ensure your code passes linting and tests before submitting.

# License

This project is licensed under the **GPL License**.

---

Thank you for using the Keypom Trial Accounts SDK! If you have any questions or need assistance, feel free to join our [community](https://t.me/+OqI-cKxQU05lZDIx) or open an issue on GitHub.
