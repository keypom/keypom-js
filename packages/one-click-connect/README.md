<p align="center">
  <a href="https://docs.keypom.xyz/">
    <picture>
      <img src="https://cloudflare-ipfs.com/ipfs/bafybeightypuoqly32gsrivh4efckhdv6wsefiynpnonlem6ts3ypgdm7e" height="128">
    </picture>
    <h1 align="center">Keypom OneClick Connect</h1>
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

Keypom OneClick Connect is a package that allows apps to bypass the NEAR wallet selector modal and instantly sign users with the click of a button.

-   OneClick Connect [Demo](https://www.youtube.com/watch?v=p_NOcYbRlJw&feature=youtu.be)

# Table of Contents

-   [Introduction](#keypom-oneclick-connect-experiences)
-   [Installation](#installation)
-   [Getting Started](#getting-started)
    -   [Setup Keypom Parameters](#setup-keypom-parameters)
-   [Keypom Trial Accounts](#keypom-trial-accounts)
    -   [Trial Account Specs](#trial-account-specs)
    -   [Modal Options](#modal-options)
    -   [Example Trial Account Integration](#example-trial-account-integration)
-   [Keypom Instant Sign In Experiences](#keypom-instant-sign-in-experiences)
    -   [Instant Sign In Specs](#instant-sign-in-specs)
-   [Contributing](#contributing)

---

# Keypom OneClick Connect Experiences

OneClick Connect is a great way to reduce friction for users signing into applications. Currently, the sign in flow for a new user is as follows:

1. User creates an account.
2. They navigate to an application.
3. Sign-in is clicked.
4. The wallet selector modal is opened and the user needs to scroll to find their wallet.
5. The user clicks their wallet and is redirected to the wallet's website to approve a transaction.
6. The user is redirected back to the app and is signed in.

As NEAR pushes to abstract crypto complexities away from the end user, this approach is not scalable. Not only are there a lot of clicks and redirects, leading to a loss in user retention, but people must also know which wallet they own. This is a big problem for apps like Sweatcoin, where the wallet logic is hidden from the user.

The flow that OneClick Connect offers is as follows:

1. User creates an account.
2. User clicks a button from inside a wallet application.
3. User is instantly signed in and can start using the dApp.

This flow is much more seamless and removes all the redirects and wallet selector modal friction.

# Installation

To install the plugin, run the following command:

```bash
npm install @keypom/one-click-connect
# or
yarn add @keypom/one-click-connect
# or
pnpm add @keypom/one-click-connect
```

# Getting Started

Apps on NEAR should be compatible with the official [wallet selector](https://github.com/near/wallet-selector) plugin to enable signing and sending transactions. Like Mintbase Wallet, MyNEARWallet, Meteor Wallet etc, OneClick Connect is a simple module for the wallet selector. This means that all you need to do is install the plugin and add its setup function to the wallet selector exactly as you would do with any other wallet.

To get started, navigate to the app's `setupWalletSelector` code where the selector is initialized. Here, you can specify which wallet modules your app should support. Simply import and add OneClick Connect's `setupOneClickConnect` function to the list of modules and you're good to go!

```js
import { setupOneClickConnect } from '@keypom/one-click-connect';

const selector = await setupWalletSelector({
    network: "testnet",
    modules: [
        setupMyNearWallet(),
        ...,
        setupSender(),
        // Add the OneClick Connect function here
        setupOneClickConnect({
            networkId: "testnet",
            urlPattern: "#instant-url/:accountId/:secretKey/:walletId"
        })
    ],
});
```

## setupOneClickConnect Parameters

-   `networkId`: Either `testnet` or `mainnet`.
-   `urlPattern`: Specifies the URL structure needed to initiate the OneClick Connect process. The URL must contain placeholders `:accountId`, `:secretKey`, and `:walletId` each seperated by delimiters.

### What is `urlPattern`?

The `urlPattern` is a crucial configuration that dictates how URLs are structured in order to trigger the OneClick Connect process. It should include placeholders for `:accountId`, `:secretKey`, and `:walletId`, which should then be dynamically replaced with actual user data.

#### Example Usage

Apps can utilize OneClick Connect on any page by ensuring the URL matches the specified `urlPattern`. For instance:
- If your app is configured with urlPattern set to `"#instant-url/:accountId/:secretKey/:walletId"`, any navigation to a URL like `"http://app.example.com/#instant-url/benjiman.testnet/5aHto...7aX14G/sweat-wallet"` will automatically trigger the sign-in process using the provided account ID, secret key, and wallet ID.

Similarly, this would also trigger on `"http://app.example.com/nestedPage/gallery#instant-url/benjiman.testnet/5aHto...7aX14G/sweat-wallet"`

### Wallet IDs

Behind the scenes, Keypom will take the secret key and use it to sign transactions on behalf of the account whenever they perform an action. Since this key is limited access, there needs to be a way to approve any transaction that requires full access. This is why the `:walletId` field is present. This is the ID of the wallet that the user will be redirected to in order to approve any full access key required transactions.

Currently, Keypom supports:

-   MyNEARWallet: `my-near-wallet`,
-   SWEAT Wallet: `sweat-wallet`

# Contributing

First off, thanks for taking the time to contribute! Contributions are what makes the open-source community such an amazing place to learn, inspire, and create. Any contributions you make will benefit everybody else and are **greatly appreciated**.

Please try to create bug reports that are:

-   _Reproducible._ Include steps to reproduce the problem.
-   _Specific._ Include as much detail as possible: which version, what environment, etc.
-   _Unique._ Do not duplicate existing opened issues.
-   _Scoped to a Single Bug._ One bug per report.

You can use [markdownlint-cli](https://github.com/igorshubovych/markdownlint-cli) to check for common markdown style inconsistency.

# License

This project is licensed under the **GPL License**.
