<p align="center">
  <a href="https://docs.keypom.xyz/">
    <picture>
      <img src="https://cloudflare-ipfs.com/ipfs/bafybeightypuoqly32gsrivh4efckhdv6wsefiynpnonlem6ts3ypgdm7e" height="128">
    </picture>
    <h1 align="center">Keypom Wallet Selector</h1>
  </a>
</p>

<p align="center">
  <a aria-label="Made by Ben Kurrek" href="https://github.com/BenKurrek">
    <img src="https://img.shields.io/badge/MADE%20BY-Ben%20Kurrek-000000.svg?style=for-the-badge">
  </a>
  <a aria-label="Made by Matt Lockyer" href="https://github.com/mattlockyer">
    <img src="https://img.shields.io/badge/MADE%20BY-Matt%20Lockyer-000000.svg?style=for-the-badge">
  </a>
  <a aria-label="License" href="https://github.com/keypom/keypom-js/blob/main/LICENSE">
    <img alt="" src="https://img.shields.io/badge/License-GNU%20GPL-green?style=for-the-badge">
  </a>
  <a aria-label="Join the community" href="https://t.me/+OqI-cKxQU05lZDIx">
    <img alt="" src="https://img.shields.io/badge/Join%20The-community-blueviolet.svg?style=for-the-badge">
  </a>
</p>

The Keypom Wallet Selector is a package that allows apps to be fully compatible with both trial accounts and instant sign in experiences. See the following demos for examples of the user experience.
- Instant Sign-In [Demo](https://www.youtube.com/watch?v=p_NOcYbRlJw&feature=youtu.be)
- Trial Account [Demo](https://www.youtube.com/watch?v=p_NOcYbRlJw)

# Table of Contents
- [Installation](#installation)
- [Getting Started](#getting-started)
    - [Setup Keypom Parameters](#setup-keypom-parameters)
- [Keypom Trial Accounts](#keypom-trial-accounts)
    - [Trial Account Specs](#trial-account-specs)
    - [Modal Options](#modal-options)
    - [Example Trial Account Integration](#example-trial-account-integration)
- [Keypom Instant Sign In Experiences](#keypom-instant-sign-in-experiences)
    - [Instant Sign In Specs](#instant-sign-in-specs)
- [Contributing](#contributing)

---

# Installation

To install the Keypom Wallet Selector, run the following command:

```bash
npm install @keypom/selector
# or
yarn add @keypom/selector
# or
pnpm add @keypom/selector
```

# Getting Started

Most apps on NEAR should be compatible with the official [wallet selector](https://github.com/near/wallet-selector) to enable sign-in and sending transactions. For this reason, the Keypom selector has been made to fully support any app that uses the wallet selector.

To get started, navigate to the app's `setupWalletSelector` code where the selector is initialized. Here, you can specify which wallet modules your app should support. Simply add Keypom's `setupKeypom` function to the list of modules and you're good to go!

```js
const selector = await setupWalletSelector({
  network: "testnet",
  modules: [
    setupMyNearWallet(),
    ...
    setupSender(),
    setupKeypom(PARAMS)
  ],
});
```

## Setup Keypom Parameters

`setupKeypom` is the core of the Keypom wallet selector and is the only function you should know about. There are a ton of customizable features that you can make use of to tailor the user experience to your app's needs. At its core, the setup function takes the following parameters:

- `networkId`: Either `testnet` or `mainnet`.
- `signInContractId`: Which contract will be used to sign in users.
- `trialAccountSpecs`: If specified, trial accounts will be supported on the app. These specifications outline two aspects:
    1. How the URL should be constructed for the app to trigger the trial account sign in flow.
    2. Customizable options for the trial account modals including *all* the text such as titles, descriptions, buttons, placeholders etc. In addition, you can specify exactly which off-boarding wallets you'd like to support.
- `instantSignInSpecs`: If specified, trial accounts will be supported on the app. The instant sign in specs dictate how the URL should be constructed for the app to trigger the instant sign in flow.

# Keypom Trial Accounts

Keypom Trial Accounts are an exciting new opportunity for Web3 apps to seamlessly onboard users whether they’re completely new to crypto or seasoned veterans. With the click of a link, users require no software, wallet setup, wallet connection, and are *instantly signed into apps* with their trial account, ready to make on-chain transactions. Unlike most other onboarding mechanisms, the entire experience can be embedded *directly in the app* to increase user retention and is entirely on-chain.

This technology is perfect for dApps of all sizes ranging from small indie to large enterprise applications.

- Trial Account [Demo](https://www.youtube.com/watch?v=p_NOcYbRlJw)

In order to support trial accounts, your app must have the `setupKeypom` function embedded within the wallet selector with the `trialAccountSpecs` parameter specified.

## Trial Account Specs

The trial account specifications allows the Keypom wallet selector to support trial accounts on your app. In order to trigger the sign in flow, the user must be on the correct URL. This URL is specified in the specifications as a string and should look like this:

```js
https://near.org/#trial-url/ACCOUNT_ID/SECRET_KEY
```

The URL *must* have the `ACCOUNT_ID` and `SECRET_KEY` placeholders.

As an example, if you wanted your trial users to sign in once they reached `https://near.org/#trial-url/`, and you wanted the account and secret key to be separated using `/`, your specs should look like this:

```js
trialAccountSpecs: {
    url: "https://near.org/#trial-url/ACCOUNT_ID/SECRET_KEY",
}
```

Alternatively, you could swap the `/` delimiter with a `#` instead:

```js
trialAccountSpecs: {
    url: "https://near.org/#trial-url/ACCOUNT_ID#SECRET_KEY",
}
```

> **NOTE:** The account ID must come first and the secret key must follow the delimiter. For unclaimed trial account linkdrops, the account ID will be the Keypom contract. For claimed trial account linkdrops, the account ID will be the account ID chosen by the user.

## Modal Options

The second field in the trial account specs is the `modalOptions`. This contains all the customizable options for the trial account modals as well as the wallets you want to support for user offboarding.

```js
export interface ModalCustomizations {
  wallets: OffboardingWallet[];
  theme?: Theme;
  beginTrial?: BeginTrialCustomizations,
  trialOver?: TrialOverCustomizations,
  invalidAction?: InvalidActionCustomizations,
  insufficientBalance?: InsufficientBalanceCustomizations,
}
```

#### Wallets

The only required field is `wallets`. This should be a list of valid domains that support trial account offboarding. Each of the wallets in the list will be displayed as a button once the trial is over.

```js
export interface OffboardingWallet {
  name: string;
  description: string;
  iconUrl: string;
  redirectUrl: string;
}
```

For each wallet, you can specify a name to display, a description, an image (in the form of a URL), and where to redirect the user to once the button is clicked. The redirect URL follows the same format as the trial account URL and should look like this:

```js
https://app.mynearwallet.com/linkdrop/ACCOUNT_ID/SECRET_KEY
```

The URL *must* have the `ACCOUNT_ID` and `SECRET_KEY` placeholders.

### Theme And CSS

The modal used by Keypom uses the same CSS as the official wallet selector modal behind the scenes. To learn how to customize the theme to match your app, see the selector's [documentation](https://github.com/near/wallet-selector/tree/main/packages/modal-ui#react--vue).

If you only wish to change the theme between light and dark mode, you can pass in a `theme` field in the modal options. This field should be either `light` or `dark`.

### Modal Text 

In addition to the modal style, you have complete control over the text that is displayed at each stage of the claiming process. To see the default text, see the [Default Text](#modal-default-text) section.

For the trial account creation process, there are currently 3 modals that can be customized:

1. Landing page: what the user sees when they first click the link

```bash
landing?: {
    title?: string;
    body?: string;
    fieldPlaceholder?: string;
    buttonText?: string;
    subText?: {
        landing?: string;
        invalidAccountId?: string;
        accountIdTaken?: string;
        accountIdAvailable?: string;
    }
},
```

2. Claiming: while the account is being created:
```bash
claiming?: {
    title?: string;
    body?: string;
},  
```

3. Claimed: once the account has been created:
```bash
claimed?: {
    title?: string;
    body?: string;
    buttonText?: string;
}
```

The next stage that can be customized is what the user sees once their trial is over and they need to choose a wallet to offboard to.

```bash
trialOver?: {
    mainBody?: {
        title?: string;
        body?: string;
        imageOne?: {
            title: string;
            body: string;
        },
        imageTwo?: {
            title: string;
            body: string;
        },
        button?: {
            url?: string;
            newTab?: boolean;
            text?: string;
        }
    },
    offboardingOptions?: {
        title?: string;
    }
}
```

You can change the titles, descriptions, button text / behaviour and more to tailor the experience to your app. Finally, you can change the text for when the user tries to perform an invalid action, or tries to spend more $NEAR than the account has available.


## Example Trial Account Integration

In the following example, you'll see how the trial account flow can be fully integrated into an application. The app has the domain `https://example.com` and the trial account modals should show up once the user lands on `https://example.com/trial-accounts`. In addition, the app doesn't want to expose the secret key in their analytics so they'll separate the account ID and secret key using a `#` instead of a `/`.

The app will also support MyNEARWallet offboarding and will change the default text for the landing modal when the trial begins.

```js
const NETWORK_ID = "testnet";
const CONTRACT_ID = "example.near";

export const KEYPOM_OPTIONS = {
  beginTrial: {
    landing: {
      title: "Welcome To My Cool Example App!",
    },
  },
  wallets: [
    {
      name: "MyNEARWallet",
      description: "Secure your account with a Seed Phrase",
      redirectUrl: "https://testnet.mynearwallet.com/linkdrop/ACCOUNT_ID/SECRET_KEY",
      iconUrl: "INSERT_ICON_URL_HERE"
    },
  ]
}

const selector = await setupWalletSelector({
  network: NETWORK_ID,
  modules: [
    setupMyNearWallet(),
    ...
    setupSender(),
    setupKeypom({ 
        networkId: NETWORK_ID, 
        signInContractId: CONTRACT_ID,
        trialAccountSpecs: {
            url: "https://example.com/trial-accounts/ACCOUNT_ID#SECRET_KEY",
            modalOptions: KEYPOM_OPTIONS
        }
    })
  ],
});
```

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

- Instant Sign-In [Demo](https://www.youtube.com/watch?v=p_NOcYbRlJw&feature=youtu.be)

In order to support instant sign in, your app must have the `setupKeypom` function embedded within the wallet selector with the `instantSignInSpecs` parameter specified.

## Instant Sign In Specs

The instant sign in specifications allows the Keypom wallet selector to support instant sign on experiences for your app. In order to trigger the sign in flow, the user must be on the correct URL. This URL is specified in the specifications as a string and should look like this:

```js
https://near.org/#trial-url/ACCOUNT_ID/SECRET_KEY/MODULE_ID
```

The URL *must* have the `ACCOUNT_ID`, `SECRET_KEY`, and `MODULE_ID` placeholders.

Behind the scenes, Keypom will take the secret key and use it to sign transactions on behalf of the account whenever they perform an action. Since this key is limited access, there needs to be a way to approve any transaction that requires full access. This is why the `MODULE_ID` field is present. This is the ID of the wallet that the user will be redirected to in order to approve any full access key required transactions.

Currently, Keypom supports:
- MyNEARWallet: `my-near-wallet`,
- NEAR Wallet: `near-wallet`,
- SWEAT Wallet: `sweat-wallet`

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
    ...
    setupSender(),
    setupKeypom({ 
        networkId: NETWORK_ID, 
        signInContractId: CONTRACT_ID,
        instantSignInSpecs: {
            url: "https://near.org/#instant-url/ACCOUNT_ID#SECRET_KEY/MODULE_ID"
        }
    })
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

- _Reproducible._ Include steps to reproduce the problem.
- _Specific._ Include as much detail as possible: which version, what environment, etc.
- _Unique._ Do not duplicate existing opened issues.
- _Scoped to a Single Bug._ One bug per report.

You can use [markdownlint-cli](https://github.com/igorshubovych/markdownlint-cli) to check for common markdown style inconsistency.

# License

This project is licensed under the **GPL License**.