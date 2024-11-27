<p align="center">
  <a href="https://docs.keypom.xyz/">
    <picture>
      <img src="https://cloudflare-ipfs.com/ipfs/bafybeightypuoqly32gsrivh4efckhdv6wsefiynpnonlem6ts3ypgdm7e" height="128">
    </picture>
    <h1 align="center">Keypom Multichain FastAuth</h1>
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

This document explains key concepts related to the FastAuth SDK, including session keys, attestations, ETH implicit accounts, app IDs, iframes, wrappers around Wallet Selector, and styling. It also details the steps for integrating the package into your application.

# Table of Contents

-   [Key Concepts](#key-concepts)
    -   [Session Keys](#session-keys)
    -   [Attestations](#attestations)
    -   [Eth Implicit Accounts](#eth-implicit-accounts)
    -   [Iframes](#iframes)
    -   [Wallet Selector](#wallet-selector)
    -   [Styling](#styling)
-   [Integration Steps](#integration-steps)
-   [Contributing](#contributing)
-   [License](#license)

---

# Key Concepts

## Session Keys

Session keys are short-lived cryptographic key pairs generated to facilitate secure and lightweight authentication for users. These keys are stored locally and used to sign paylods without requiring the user's oauth token. This improves security by limiting the exposure of long-term keys and provides flexibility for session-based interactions.

-   **Lifecycle**: Session keys are created when a user logs in and are cleared upon logout.
-   **Usage**: They are used to authenticate user actions and sign payloads which are sent to the server, authenticated, and relayed on-chain.
-   **Storage**: Session keys are stored in local storage.

## Attestations

Attestations verify the integrity and authenticity of actions made by users of FastAuth ecosystem. These include:

-   **User Identity Attestations**: Proofs that a specific user owns a session key.
-   **Transaction Attestations**: Evidence that a signed transaction was authorized by a valid session key.

Attestations rely on cryptographic signatures and are validated by the backend and sent to the FastAuth smart contract.

## Eth Implicit Accounts

ETH implicit accounts are Ethereum-compatible addresses derived from the hash of the user's google ID using the MPC service. These accounts are created when a new user logs into FastAuth and do not require meta-transactions since they have a proxy contract automatically deployed to them upon activation.

## Iframes

The FastAuth iframe is used to handle social logins and user authentication securely within a sandboxed environment. The iframe serves as the front-end interface for interacting with OAuth providers, like Google, while isolating authentication workflows from the parent application so that the user's oauth token is never exposed.

-   **Communication**: Uses postMessage API to securely exchange data between the iframe and the parent application.
-   **Parameters**: Includes public keys and app IDs as URL parameters which are sent to the attestation server for verification.
-   **Security**: Sandbox configuration prevents the iframe from accessing the parent application’s DOM or cookies.

## Wallet Selector

FastAuth integrates with the NEAR Wallet Selector by wrapping its functionality, adding:

1. **FastAuth Wallet Module**: A custom wallet module for managing session keys and authenticating users via the FastAuth modal.
2. **Extended Modal Support**: Includes options for both traditional wallet logins and social logins (e.g., Google).
3. **Custom Authentication Flow**: Combines Wallet Selector’s existing functionality with FastAuth’s session-based authentication.

## Styling

The FastAuth SDK includes a CSS file (`styles.css`) that defines default styles for modals, buttons, and components. The CSS uses CSS variables for easy customization and supports light and dark themes.

-   **Customization**: You can override theme variables to match your application’s design.
-   **Components**: Includes predefined styles for modals, social login buttons, and wallet login buttons.
-   **Themes**:
    -   **Light theme**: Default appearance.
    -   **Dark theme**: Activated using the dark-theme class on the root modal element.

# Integration Steps

To integrate the FastAuth SDK into your application:

1. Install the FastAuth SDK: `npm install @keypom/fastauth`
2. Replace Wallet Selector Imports: Replace the existing imports for `setupWalletSelector` and `setupModal` to use FastAuth’s versions:

```js
import { setupWalletSelector, setupModal } from "@keypom/fastauth";
```

3. Import the CSS file:

```js
import "@keypom/fastauth/lib/styles.css";
```

By following these steps, you’ll integrate the FastAuth SDK into your application, enabling secure, flexible, and interoperable authentication.

# Contributing

We welcome contributions to the Keypom FastAuth SDK! Please follow these guidelines:

-   **Bug Reports**: Submit detailed bug reports with steps to reproduce.
-   **Feature Requests**: Open issues for feature enhancements with use cases.
-   **Pull Requests**: Ensure your code passes linting and tests before submitting.

# License

This project is licensed under the **GPL License**.

---

Thank you for using the Keypom FastAuth SDK! If you have any questions or need assistance, feel free to join our [community](https://t.me/+OqI-cKxQU05lZDIx) or open an issue on GitHub.
