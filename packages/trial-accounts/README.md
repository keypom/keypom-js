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

The **Keypom Trial Accounts SDK** provides a seamless way to interact with NEAR trial accounts through a set of easy-to-use methods. This SDK abstracts the complexities involved in creating and managing trial accounts, allowing developers to focus on building their applications. With this package, you can:

-   Deploy trial contracts
-   Create trials with customizable constraints
-   Add and activate trial accounts
-   Perform actions on behalf of trial accounts
-   Broadcast transactions signed via Multi-Party Computation (MPC)
-   Manage usage statistics and exit conditions for trial accounts

# Table of Contents

-   [Installation](#installation)
-   [Getting Started](#getting-started)
    -   [Initialization](#initialization)
    -   [Usage Examples](#usage-examples)
        -   [Creating a Trial](#creating-a-trial)
        -   [Adding and Activating Trial Accounts](#adding-and-activating-trial-accounts)
        -   [Performing Actions](#performing-actions)
    -   [Configuration](#configuration)
    -   [Retry Logic](#retry-logic)
-   [Concepts](#concepts)
    -   [Trial Accounts](#trial-accounts)
    -   [MPC Integration](#mpc-integration)
    -   [Usage Constraints](#usage-constraints)
-   [Contributing](#contributing)
-   [License](#license)

---

# Installation

To install the Keypom Trial Accounts SDK, run the following command:

```bash
npm install @keypom/trial-accounts
# or
yarn add @keypom/trial-accounts
# or
pnpm add @keypom/trial-accounts
```

# Getting Started

The first step in using the SDK is to initialize the `TrialAccountManager` class. This class provides methods to manage trial accounts and interact with the trial contract.

## Initialization

You need to create an instance of `TrialAccountManager` by providing the necessary parameters:

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

Create a new trial with specific constraints:

```js
const trialId = await trialManager.createTrial({;
    near,
    signerAccount,
    contractAccountId: "trial-contract.your-account.testnet",
    mpcContractId: "v1.signer-prod.testnet",
    wasmFilePath: "./out/trials.wasm",
    initialBalance: "50",
});
```

### Adding and Activating Trial Accounts

Add trial accounts to the trial and activate them:

TODO

### Performing Actions

Perform actions on behalf of the trial account:

TODO

## Configuration

You can customize the retry logic and other parameters through the `TrialAccountManager` constructor or using setter methods:

TODO

-   `maxRetries`: Maximum number of retries for operations.
-   `initialDelayMs`: Initial delay before retrying (in milliseconds).
-   `backoffFactor`: Exponential backoff factor.

## Retry Logic

All methods in `TrialAccountManager` include built-in retry logic to handle transient errors and network issues. You can adjust the retry settings as shown above.

# Concepts

## Trial Accounts

Trial accounts are temporary NEAR accounts with predefined constraints and usage limits. They are ideal for onboarding users without requiring them to have NEAR tokens upfront.

## MPC Integration

The SDK integrates with an MPC (Multi-Party Computation) service to securely sign transactions on behalf of trial accounts without exposing private keys.

## Usage Constraints

When creating a trial, you can specify various constraints:

-   **Allowed Methods**: Restrict which contract methods can be called.
-   **Allowed Contracts**: Restrict which contracts can be interacted with.
-   **Usage Limits**: Define maximum gas, deposit, interactions per day, etc.
-   **Exit Conditions**: Specify conditions under which the trial account expires or is deactivated.

Example:

TODO

# Contributing

We welcome contributions to the Keypom Trial Accounts SDK! Please follow these guidelines:

-   **Bug Reports**: Submit detailed bug reports with steps to reproduce.
-   **Feature Requests**: Open issues for feature enhancements with use cases.
-   **Pull Requests**: Ensure your code passes linting and tests before submitting.

# License

This project is licensed under the **GPL License**.

---

Thank you for using the Keypom Trial Accounts SDK! If you have any questions or need assistance, feel free to join our [community](https://t.me/+OqI-cKxQU05lZDIx) or open an issue on GitHub.

