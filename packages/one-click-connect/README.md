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

# Installation

To install the plugin, run the following command:

```bash
npm install @keypom/selector
# or
yarn add @keypom/selector
# or
pnpm add @keypom/selector
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
        setupOneClickConnecj({
            networkId: "testnet",
            url: "https://www.metapool.app/vote/?network=near#ACCOUNT_ID/SECRET_KEY/MODULE_ID"
        })
    ],
});
```

## setupOneClickConnect Parameters

-   `networkId`: Either `testnet` or `mainnet`.
-   `signInContractId`: Which contract will be used to sign in users.
-   `trialAccountSpecs`: If specified, trial accounts will be supported on the app. These specifications outline two aspects:
    1. How the URL should be constructed for the app to trigger the trial account sign in flow.
    2. Customizable options for the trial account modals including _all_ the text such as titles, descriptions, buttons, placeholders etc. In addition, you can specify exactly which off-boarding wallets you'd like to support.
-   `instantSignInSpecs`: If specified, trial accounts will be supported on the app. The instant sign in specs dictate how the URL should be constructed for the app to trigger the instant sign in flow.

# Keypom Instant Sign In Experiences

Instant sign in experiences are a great way to reduce friction for users signing into applications. Currently, the sign in flow for a new user is as follows:

1. User creates an account.
2. They navigate to an application.
3. Sign-in is clicked.
4. The wallet selector modal is opened and the user needs to scroll to find their wallet.
5. The user clicks their wallet and is redirected to the wallet's website to approve a transaction.
6. The user is redirected back to the app and is signed in.

As NEAR pushes to abstract the crypto complexities and jargon away from the end user, this current approach is not scalable. Not only is there a huge amount of clicks and redirects which leads to a loss in conversion, but the user is also expected to know which wallet they own. This is a huge barrier to entry as often times, the wallet logic will be abstracted from the user as seen with SWEAT.

The flow that Keypom offers is as follows:

1. User creates an account.
2. User clicks discovers an application from their wallet.
3. User is instantly signed in and can start using the application.

This flow is much more seamless and removes all the redirects and wallet selector modal friction.

-   Instant Sign-In [Demo](https://www.youtube.com/watch?v=p_NOcYbRlJw&feature=youtu.be)

In order to support instant sign in, your app must have the `setupKeypom` function embedded within the wallet selector with the `instantSignInSpecs` parameter specified.

## Instant Sign In Specs

The instant sign in specifications allows the Keypom wallet selector to support instant sign on experiences for your app. In order to trigger the sign in flow, the user must be on the correct URL. This URL is specified in the specifications as a string and should look like this:

```js
https://near.org/#trial-url/ACCOUNT_ID/SECRET_KEY/MODULE_ID
```

The URL _must_ have the `ACCOUNT_ID`, `SECRET_KEY`, and `MODULE_ID` placeholders.

Behind the scenes, Keypom will take the secret key and use it to sign transactions on behalf of the account whenever they perform an action. Since this key is limited access, there needs to be a way to approve any transaction that requires full access. This is why the `MODULE_ID` field is present. This is the ID of the wallet that the user will be redirected to in order to approve any full access key required transactions.

Currently, Keypom supports:

-   MyNEARWallet: `my-near-wallet`,
-   NEAR Wallet: `near-wallet`,
-   SWEAT Wallet: `sweat-wallet`

As an example, if you wanted to support instant sign in for users once they reached `https://near.org/#instant-url/`, and you wanted the account and secret key to be separated using `#`, but the module ID and secret key to be separated by `/`, your specs should look like this:

```js
instantSignInSpecs: {
    url: "https://near.org/#instant-url/ACCOUNT_ID#SECRET_KEY/MODULE_ID",
}
```

> **NOTE:** The account ID must come first followed by the secret key and then finally the module ID.

The wallet selector would then look as follows.

```js
const selector = await setupWalletSelector({
    network: NETWORK_ID,
    modules: [
        setupMyNearWallet(),
        ...setupSender(),
        setupKeypom({
            networkId: NETWORK_ID,
            signInContractId: CONTRACT_ID,
            instantSignInSpecs: {
                url: "https://near.org/#instant-url/ACCOUNT_ID#SECRET_KEY/MODULE_ID",
            },
        }),
    ],
});
```

From this point onwards, any app or wallet could create a limited access key for the contract that your app is using and then redirect the user to your instant sign in URL. An example could be that that account `benjiman.near` wants to use the `near.org` app and the contract being used there is `social.near`. Benji came from MyNEARWallet and so the URL would be:

```
https://near.org/#instant-url/benjiman.near#3C6rhKRWLFmho9bQo32EUmk9Ldx47paRSMUdaoR551EtcaNSPziave55HJosi71tfWSRQjjRrL4exfaBi9o7XKUG/my-near-wallet
```

At this point, Benji would be instantly signed into `near.org` and can start using the app. If anything requires a full access key, he would be redirected to MyNEARWallet to approve the transaction and come back.

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
