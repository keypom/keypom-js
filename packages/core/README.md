<p align="center">
  <a href="https://nextjs.org">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://bafybeibr5uoixk6ywwlacntniyuepkb4bedwgghtstg3q3vusp6u6z5a6q.ipfs.nftstorage.link/">
      <img src="https://bafybeibdwgbvcn7jtxulbqdram6uf52nypyruacobzb2vja3zlgdlvl3nu.ipfs.nftstorage.link/" height="128">
    </picture>
    <h1 align="center">Keypom Core SDK</h1>
  </a>
</p>

<p align="center">
  <a aria-label="Made by Ben Kurrek" href="https://github.com/BenKurrek">
    <img src="https://img.shields.io/badge/made%20by-BenKurrek-ff1414.svg?style=flat-square">
  </a>
  <a aria-label="Made by Matt Lockyer" href="https://github.com/mattlockyer">
    <img src="https://img.shields.io/badge/made%20by-MattLockyer-ff1414.svg?style=flat-square">
  </a>
  <a aria-label="License" href="https://github.com/vercel/next.js/blob/canary/license.md">
    <img alt="" src="https://img.shields.io/npm/l/next.svg?style=for-the-badge&labelColor=000000">
  </a>
  <a aria-label="Join the community on GitHub" href="https://github.com/vercel/next.js/discussions">
    <img alt="" src="https://img.shields.io/badge/Join%20the%20community-blueviolet.svg?style=for-the-badge&logo=Next.js&labelColor=000000&logoWidth=20">
  </a>
</p>

The core package serves as a way to interact with Keypom through a set of easy to use methods that abstract away the complexities of the protocol. The package includes ways to:
- Create drops of all kinds
- Claim drops
- Create and use trial accounts
- View information about drops and keys
- Delete drops and refund assets
- Manage user balances

<details open="open">
<summary>Table of Contents</summary>

- [Installation](#installation)
- [Getting Started](#getting-started)
  - [Initializing the SDK](#initializing-the-sdk)
  - [View Functions](#view-functions)
  - [Creating Drops](#creating-drops)
  - [Claiming Linkdrops](#claiming-linkdrops)
  - [Deleting Keys and Drops](#Deleting-Keys-and-Drops)
  - [Account Balances for Smooth UX](#Account-Balances-for-Smooth-UX)
  - [Utility Functions](#Utility-Functions)
- [Contributing](#contributing)

</details>

---

# Installation

To install the Keypom Core SDK, run the following command:

```bash
npm install @keypom/core
# or
yarn add @keypom/core
# or
pnpm add @keypom/core
```

# Getting Started

The first thing you must *always* do when using the SDK is to call `initKeypom`. This will initialize the package state and establish a connection to the NEAR blockchain. 

By default, the SDK will create a new [InMemoryKeyStore](https://github.com/near/near-api-js/blob/master/packages/keystores/src/in_memory_key_store.ts) to sign transactions with. Thus, if you don't pass in a `funder` object, you won't be able to sign transactions and can only invoke utility and view methods. Alternatively, if you'd like to use a different keystore, you can pass in a customized `near` object to the initialization function.

With the SDK, every function that requires transactions to be signed can be carried through in 1 of two ways:
1. Passing in an [Account](https://github.com/near/near-api-js/blob/master/packages/accounts/src/account.ts) object into the function whose keys are kept in the SDK's keystore.
2. Passing in a `funder` object once during initialization whose keys will be kept in the SDK's [InMemoryKeyStore](https://github.com/near/near-api-js/blob/master/packages/keystores/src/in_memory_key_store.ts).

## View Methods & Utility Functions Only

If your only purpose is to query information from the chain or use Keypom's utility functions such as `generateKeys`, you don't need to pass in a `near` or `funder` object to `initKeypom`:

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