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

<details open="open">
<summary>Table of Contents</summary>

- [Installation](#installation)
- [Getting Started](#getting-started)
    - [Setup Keypom Parameters](#setup-keypom-parameters)
- [Keypom Trial Accounts](#keypom-trial-accounts)
- [Instant Sign-In Experiences](#instant-sign-in-experiences)
- [Contributing](#contributing)

</details>

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

`setupKeypom` is the core of the Keypom wallet selector and is the only function you need to worry about. There are a suite of customizable features that you can make use of to tailor the user experience to your app's needs. At its core, the setup function takes the following parameters:

- `networkId`: Either `testnet` or `mainnet`.
- `signInContractId`: Which contract will be used to sign in users.
- `trialAccountSpecs`: If specified, trial accounts will be supported on the app. These specifications outline two aspects:
    1. How the URL should be constructed for the app to trigger the trial account sign in flow.
    2. Customizable options for the trial account modals including *all* the text such as titles, descriptions, buttons, placeholders etc. In addition, you can specify exactly which off-boarding wallets you'd like to support.
- `instantSignInSpecs`: If specified, trial accounts will be supported on the app. The instant sign in specs dictate how the URL should be constructed for the app to trigger the instant sign in flow.

# Keypom Trial Accounts

Keypom Trial Accounts are an exciting new opportunity for Web3 apps to seamlessly onboard users whether they’re completely new to crypto or seasoned veterans. With the click of a link, users require no software, wallet setup, wallet connection, and are *instantly signed into apps* with their trial account, ready to make on-chain transactions. Unlike most other onboarding mechanisms, the entire experience can be embedded *directly in the app* to increase user retention and is entirely on-chain.

This technology is perfect for dApps of all sizes ranging from small indie to large enterprise applications.

In order to support trial accounts, your app must have the `setupKeypom` function embedded within the wallet selector with the `trialAccountSpecs` parameter specified.


```js
await initKeypom({
    network: "testnet"
});

const keys = await generateKeys({
    numKeys: 1
})
console.log('keys: ', keys)

const dropSupply = await getKeyTotalSupply();
console.log('dropSupply: ', dropSupply)
```

## Funder Object

If you have the private key of an account that you'd like to use to sign transactions with, you can pass in a `funder` object to `initKeypom`. The private key can either be hardcoded or passed in through environment variables / secrets.

Using this method, you only need to pass the funder object once on initialization and can freely invoke any of the SDK methods moving forward. To update the funder object, you can call `updateFunder` and pass in different information.

```js
await initKeypom({
    network: "testnet",
    funder: {
        accountId: "benji_demo.testnet",
        secretKey: "ed25519:5yARProkcALbxaSQ66aYZMSBPWL9uPBmkoQGjV3oi2ddQDMh1teMAbz7jqNV9oVyMy7kZNREjYvWPqjcA6LW9Jb1"
    }
});

const dropSupply = await getKeyTotalSupply();
console.log('dropSupply: ', dropSupply)

const {keys} = await createDrop({
    numKeys: 1,
    depositPerUseNEAR: 1
})
console.log('keys: ', keys)
```

## Customized KeyStore & Multiple Signers

Passing in a custom `near` object when initializing Keypom has several benefits as seen below:
- If you have multiple accounts that will be signing transactions and don't want to keep calling `updateFunder`.
- You don't want to hardcode the private key in the `funder` object.
- You have a keystore containing keys that will be used to sign transactions already in scope.

In this case, you can pass in an existing `near` object and then pass in `Account` objects when calling the SDK methods.

```js
let keyStore = new UnencryptedFileSystemKeyStore(credentialsPath);  
let nearConfig = {
    networkId: NETWORK_ID,
    keyStore: keyStore,
    nodeUrl: `https://rpc.${NETWORK_ID}.near.org`,
    walletUrl: `https://wallet.${NETWORK_ID}.near.org`,
    helperUrl: `https://helper.${NETWORK_ID}.near.org`,
    explorerUrl: `https://explorer.${NETWORK_ID}.near.org`,
};  
let near = new Near(nearConfig);


await initKeypom({
    near
});

const dropSupply = await getKeyTotalSupply();
console.log('dropSupply: ', dropSupply)

const fundingAccount = new Account(near.connection, funderAccountId);
const {keys} = await createDrop({
    account: fundingAccount,
    numKeys: 1,
    depositPerUseNEAR: 1
})
console.log('keys: ', keys)
```

# Costs

It is important to note that the Keypom contracts are 100% **FEE FREE** and will remain that way for the *forseeable future*. These contracts are a public good and are meant to inspire change in the NEAR ecosystem.

With that being said, there are several mandatory costs that must be taken into account when using Keypom. These costs are broken down into two categories: per key and per drop.

> **NOTE:** Creating an empty drop and then adding 100 keys in separate calls will incur the same cost as creating a drop with 100 keys in the same call.

## Per Drop

When creating an empty drop, there is only one cost to keep in mind regardless of the drop type:
- Storage cost (**~0.006 $NEAR** for simple drops)

## Per Key
Whenever keys are added to a drop (either when the drop is first created or at a later date), the costs are outlined below.

### Key Costs for Simple Drop

- $NEAR sent whenever the key is used (can be 0).
- Access key allowance (**~0.0187 $NEAR per use**).
- Storage for creating access key (**0.001 $NEAR**).
- Storage cost (**~0.006 $NEAR** for simple drops)

### Additional Costs for NFT Drops

Since keys aren't registered for use until **after** the contract has received the NFT, we don't know how much storage the token IDs will use on the contract. To combat this, the Keypom contract will automatically measure the storage used up for storing each token ID in the `nft_on_transfer` function and that $NEAR will be taken from the funder's balance.

### Additional Costs for FT Drops

Since accounts claiming FTs may or may not be registered on the Fungible Token contract, Keypom will automatically try to register **all** accounts. This means that the drop creators must front the cost of registering users depending on the `storage_balance_bounds` returned from the FT contract. This applies to every use for every key.

In addition, Keypom must be registered on the FT contract. If you create a FT drop and are the first person to ever do so for a specific FT contract on Keypom, Keypom will be automatically registered when the drop is created. This is a one time cost and once it is done, no other account will need to register Keypom for that specific FT contract.

### Additional Costs for FC Drops

Drop creators have a ton of customization available to them when creation Function Call drops. A cost that they might incur is the attached deposit being sent alongside the function call. Keypom will charge creators for all the attached deposits they specify.

> **NOTE:** The storage costs are dynamically calculated and will vary depending on the information you store on-chain.

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