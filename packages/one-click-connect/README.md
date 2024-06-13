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

- [Table of Contents](#table-of-contents)
- [Keypom OneClick Connect Experiences](#keypom-oneclick-connect-experiences)
- [Installation](#installation)
- [Getting Started](#getting-started)
  - [setupOneClickConnect Parameters](#setuponeclickconnect-parameters)
  - [How do I trigger OneClick Connect?](#how-do-i-trigger-oneclick-connect)
    - [Connection Parameters](#connection-parameters)
    - [Optional Secret Key](#optional-secret-key)
      - [Example Flow with Secret Key](#example-flow-with-secret-key)
      - [Example Flow without Secret Key](#example-flow-without-secret-key)
      - [Example Usage](#example-usage)
    - [Wallet IDs](#wallet-ids)
- [Contributing](#contributing)
- [License](#license)

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
            contractId: "guestbook.near-examples.testnet",
            methods: ["add_message"], // Optional, defaults to any methods ["*"]
            allowance: "250000000000000000000000" // Optional, access key allowance in Yocto, defaults to 1 NEAR
        })
    ],
});
```

## setupOneClickConnect Parameters

-   `networkId`: Either `testnet` or `mainnet`.
-   `contractId`: Specifies the contract that the limited access key is capable of calling.
-   `methods` (*Optional*): This controls what methods any limited access keys added will be able to call. Defaults to all methods.
-   `allowance` (*Optional*): Outlines the allowance for any limited access keys added. This defaults to 1 NEAR. 

## How do I trigger OneClick Connect?

The OneClick Connect experience will trigger on any page that matches the following URL pattern:

```
"http://app.example.com/?connection=tbin329...adwe0vjer"
```

The string following `?connection=` is a base64 encoded stringified JSON containing connection information. This JSON can be seen below:

### Connection Parameters
```ts
connection = {
  accountId: string,
  walletId: string,
  walletTransactionUrl: string | undefined,
  chainId: string | undefined,
  secretKey: string | undefined,
};
```

-   `accountId`: The account being signed into the destination dApp.
-   `walletId`: ID of the wallet being used. For example, `sweat-wallet`. 
-   `walletTransactionUrl`: This is the URL for a wallet signing transactions.
-   `chainId`: Destination chain for the sign in, defaults to NEAR.
-   `secretKey`: The secret key for signing transactions on the destination dApp. If undefined, OneClick will try to add it along with the first transaction the user signs. 

Any malformed string following `?connection=` that cannot be base64 decoded and JSON stringified will lead to a failed login.
  
### Optional Secret Key
In the development of OneClick, it became apparent that exposing a secret key in the URL could pose a security concern in certain scenarios. For example, if the limited access key was meant to cast a vote in a DAO, then it would be imparative that the key is not exposed in order to ensure the integrity of the vote. This led to the creation of two flows, depending on your security needs. 

#### Example Flow with Secret Key
The first approach is the less secure method, directly exposing the secret key in the URL. The compromise in security grants you a smoother user experience. The flow is as follows:

1. dApp A, that the user is signed into with the full access key, creates a new limited access key for the user in the background
2. This new key is placed into the connection object in the URL
3. User clicks on the URL, signing them into dApp B. From here, they can instantly start signing transactions on dApp B, using the previously generated secret key, without ever needing to open their wallet.

#### Example Flow without Secret Key
The second approach is more secure but includes an extra step. Rather than dApp A creating a limited access key before redirecting, this occurs when the user attempts to sign the first transaction on dApp B:

1. dApp A, that the user is signed into with the full access key, creates a OneClick URL without any secret key in the connection object
2. User clicks on URL, signing them into dApp B
3. When the user tries to sign a transaction on dApp B, it redirects them back to their wallet to both sign the transaction and add a limited access key for dApp B.
4. Once the user signs this, and the dApp B limited access key is added, they can now proceed to sign further transactions on dApp B without needing to open their wallet. 


#### Example Usage
Apps can utilize OneClick Connect on any page by ensuring the URL contains the `?connection=` parameter. For instance:
- Any navigation to a URL like `"http://app.example.com/?connection=tbin329...adwe0vjer"` will automatically trigger the sign-in process using the provided connection object.

Similarly, this would also trigger on `"http://app.example.com/nestedPage/gallery?connection=tbin329...adwe0vjer"`

### Wallet IDs

Behind the scenes, Keypom will take the secret key and use it to sign transactions on behalf of the account whenever they perform an action. Since this key is limited access, there needs to be a way to approve any transaction that requires full access. This is why the `:walletId` field is present. This is the ID of the wallet that the user will be redirected to in order to approve any full access key required transactions.

Currently, Keypom supports:

-   SWEAT Wallet: `sweat-wallet`
-   [Coming Soon] MyNEARWallet: `my-near-wallet`,
-   [Coming Soon] Mintbase Wallet: `mintbase-wallet`,

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
