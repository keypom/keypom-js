<div align="center">
  <h1>
  Keypom JavaScript SDK
  </h1>
  Interacting with the Keypom Protocol made seamless.
</div>

<div align="center">
<br />

Check out our official Keypom [Documentation](https://docs.keypom.xyz/) for tutorials, concepts and more!.

[![made by BenKurrek](https://img.shields.io/badge/made%20by-BenKurrek-ff1414.svg?style=flat-square)](https://github.com/BenKurrek)
[![made by mattlockyer](https://img.shields.io/badge/made%20by-MattLockyer-ff1414.svg?style=flat-square)](https://github.com/mattlockyer)


</div>

<details open="open">
<summary>Table of Contents</summary>

- [About](#about)
- [Installation](#installation)
- [Getting Started](#getting-started)
  - [Initializing the SDK](#initializing-the-sdk)
  - [View Functions](#view-functions)
  - [Creating Drops](#creating-drops)
    - [Simple Drop With 10 Random Keys](#creating-a-simple-drop-with-10-random-keys)
    - [Simple Drop With Deterministic Keys](#creating-a-simple-drop-with-5-deterministically-generated-keys)
    - [Simple Drop With Pre-Created Keys](#creating-a-simple-drop-with-pre-created-keys)
    - [Password Protected Keys](#creating-a-simple-drop-with-a-password-protected-key)
  - [Claiming Linkdrops](#claiming-linkdrops)
    - [Claiming To Existing Account](#claiming-a-linkdrop-to-an-Existing-Account)
    - [Claiming To a New Account](#Claiming-a-Linkdrop-and-Onboarding-a-New-User)
    - [Claiming Password Protected Drops](#Claiming-a-Password-Protected-Linkdrop)
  - [Deleting Keys and Drops](#Deleting-Keys-and-Drops)
    - [Deleting Keys](#Delete-Keys)
    - [Deleting Drops](#Delete-Drops)
  - [Account Balances for Smooth UX](#Account-Balances-for-Smooth-UX)
  - [Utility Functions](#Utility-Functions)
- [Tests](#tests)
  - [Running the Tests](#Running-the-Tests)
- [Costs](#costs)
  - [Per Drop](#per-drop)
  - [Per Key](#per-key)
- [How Linkdrops Work](#how-linkdrops-work)
- [Contributing](#contributing)

</details>

---

# About

> To view our debut talk at NEARCON 2022, click [here](https://www.youtube.com/watch?v=J-BOnfhHV50).
> To read more about the Keypom Protocol, refer to the [official GitHub repository](https://github.com/keypom/keypom#about)

The Keypom JavaScript SDK is a library that allows developers to easily interact with the Keypom Protocol. The SDK abstracts away all the complex interactions that come with interacting with the protocol. It allows developers to tap into the power of Keypom with as little barrier to entry as possible by providing easy to use plug-and-play functions.

Developers should be able to focus on building without needing to understand exactly how interactions with the Keypom protocol work.

The Keypom SDK was built with flexibility in mind. We want to support integrating Keypom whether you're creating a dApp built with the with the [wallet-selector](https://github.com/near/wallet-selector), creating a backend, or if you're simply using a local node script.

To build the complete TypeDocs locally, run the following command:

```ts
yarn build-docs && cd doc && python -m http.server 4200
```

Alternatively, you can visit the official Keypom docs which host the type docs found [here](https://docs.keypom.xyz/).

# Installation

To install the Keypom SDK, simply run the following command:

```bash
npm install keypom-js
# or
yarn add keypom-js
# or
pnpm add keypom-js
```

This should add the following dependency to your `package.json` where the version number will be the latest SDK release.

```js
"dependencies": {
    "keypom-js": "*.*.*"
},
```


# Getting Started

The first thing to do when getting started with the SDK is to call the `initKeypom` function. This will initialize the state and establish a connection to the NEAR blockchain. This *must* be done before using any other function that interacts with the chain. The exception is if you're only using utility functions such as `generateKeys` which does not interact with the blockchain. 

## Initializing the SDK

When calling `initKeypom`, there are several arguments that can be passed in as outlined below.

- `near?` ([NEAR](https://github.com/near/near-api-js/blob/master/packages/near-api-js/src/near.ts)): A pre-existing NEAR connection object to use. By default, the SDK will create a new connection based on the `network` passed in.
- `network` (string): The network to connect to, either `mainnet` or `testnet`.
- `funder?` ([Funder](https://github.com/keypom/keypom-js/blob/main/src/lib/types/general.ts#L20-L42)): Object containing important information about the funder's account. If specified, the SDK will use this account to sign all transactions unless otherwise overridden by passing in a `wallet` or `account` argument in the SDK methods.
- `keypomContractId?` (string): Instead of using the most up-to-date, default Keypom contract, you can specify a specific account ID to use. If an older version is specified, some features of the SDK might not be usable. It is important to note that the SDK only works for official Keypom contracts.

There are several different scenarios that will determine what should be passed into `initKeypom`:
- If you only wish to invoke `view` methods and retrieve information from the Protocol without signing any transactions, no `funder` object is required.
- If the funder changes a lot, you may wish to pass in a custom `near` object that has a `keyStore` containing the keys for each funder. When you then call SDK methods, you can pass in different `account` objects.
- If you're using the SDK on a frontend with wallet-selector, don't pass in a `funder` object and instead pass in a `wallet` object when calling SDK methods.

## View Functions

Once the SDK has been initialized, you can start calling methods. The simplest functions to call are those that require no signature and are used to retrieve information from the protocol. A list of view functions available and what they do can be found below.

- `getKeyBalance` - Returns the balance associated with given key. This is used by the NEAR wallet to display the amount of the linkdrop.
- `getKeyTotalSupply` - Query for the total supply of keys currently on the Keypom contract.
- `getKeys` - Paginate through all active keys on the contract and return a vector of key info.
- `getKeyInformation` - Returns the KeyInfo corresponding to a specific public key.
- `getKeyInformationBatch` - Returns a vector of KeyInfo corresponding to a set of public keys passed in.
- `getDropInformation` - Get information about a specific drop by passing in either a drop ID, public key, or secret key.
- `getKeySupplyForDrop` - Returns the total supply of active keys for a given drop.
- `getKeysForDrop` - Paginate through all keys in a specific drop, returning an array of KeyInfo.
- `getDropSupplyForOwner` - Returns the total supply of active drops for a given account ID
- `getDrops` - Paginate through drops owned by an account. If specified, information for the first 50 keys in each drop can be returned as well.
- `getNftSupplyForDrop` - Return the total supply of token IDs for a given NFT drop.
- `getNftTokenIDsForDrop` - Paginate through token IDs in an NFT drop to return a vector of token IDs.
- `getUserBalance` - Query for a user's current balance on the Keypom contract
- `getContractSourceMetadata` - Returns the source metadata for the Keypom contract that the SDK has been initialized on. This includes valuable information such as which specific version the contract is on and link to exactly which GitHub commit is deployed.

A quick example of showing how to initialize the SDK and call a view function is shown below:

```typescript
// Initialize the SDK on testnet. No funder is passed in since we're only doing view calls.
await initKeypom({
   network: "testnet",
});

// Query for the Keypom contract's source metadata
const metadata = await getContractSourceMetadata();

console.log('metadata: ', metadata)
```

## Creating Drops

The core of Keypom revolves around creating drops. This is where the true power of the protocol comes in. With the SDK, the complex logic and data structures have been simplified and abstracted away from the developer. With this in mind, to create a drop, you need to call the `createDrop` function. It has a suite of arguments depending on what the desired outcome should be:

- `account?` ([Account](https://github.com/near/near-api-js/blob/master/packages/near-api-js/src/account.ts)) - Valid NEAR account object that if passed in, will be used to sign the txn instead of the funder account.
- `wallet?` ([BrowserWalletBehaviour | Wallet](https://github.com/near/wallet-selector/blob/main/packages/core/src/lib/wallet/wallet.types.ts)) - If using a browser wallet through wallet selector and that wallet should sign the transaction, pass in the object.
- `numKeys` (number) - Specify how many keys should be generated for the drop. If `publicKeys` is not passed in, `numKeys` number of keys are automatically created. The behaviour of this automatic creation depends on if the funder has rootEntropy set OR rootEntropy is passed in. In this case, the keys will be deterministically generated using the drop ID, key nonce, and entropy. Otherwise, each key will be generated randomly.
- `publicKeys?` (string[]) - Pass in a custom set of publicKeys to add to the drop. If this is not passed in, keys will be generated based on the `numKeys` parameter.
- `depositPerUseNEAR?` (number) - Specify how much $NEAR should be contained in each link. Unit in $NEAR (i.e `1` = 1 $NEAR)
- `depositPerUseYocto?` (string) - Specify how much $yoctoNEAR should be contained in each link. Unit in yoctoNEAR (1 yoctoNEAR = 1e-24 $NEAR)
- `dropId?` (string) - Specify a custom drop ID rather than using one from the SDK. If no drop ID is passed in, an ID equal to `Date.now()` will be used.
- `config?` ([DropConfig](https://github.com/keypom/keypom-js/blob/ben/readme/src/lib/types/drops.ts#L61-L99)) - Allows specific drop behaviors to be configured such as the number of uses each key / link will have.
- `metadata?` (string) - Specify a string of metadata to attach to the drop. This can be whatever you would like and is optional. Often this is stringified JSON.
- `simpleData?` ([SimpleData](https://github.com/keypom/keypom-js/blob/main/src/lib/types/drops.ts#L61-L99)) - For creating a simple drop, this contains necessary configurable information about the drop.
- `ftData?` ([FTData](https://github.com/keypom/keypom-js/blob/main/src/lib/types/ft.ts#L1-L23)) - For creating a fungible token drop, this contains necessary configurable information about the drop.
- `nftData?` ([NFTData](https://github.com/keypom/keypom-js/blob/main/src/lib/types/nft.ts#L1-L15)) - For creating a non-fungible token drop, this contains necessary configurable information about the drop.
- `fcData?` ([FCData](https://github.com/keypom/keypom-js/blob/main/src/lib/types/fc.ts#L57-L70)) - For creating a function call drop, this contains necessary configurable information about the drop.
- `rootEntropy?` (string) - Specify a custom entropy to use for generating keys (will overload the funder's rootEntropy if applicable). This parameter only matters if the publicKeys variable is not passed in.
- `basePassword?` (string) - For doing password protected drops, this is the base string that will be used to generate all the passwords. It will be double hashed with the public key and specific key use to generate the password for each key.
- `passwordProtectedUses?` (number[]) - For doing password protected drops, specifies exactly which uses will be password protected. The uses are NOT zero indexed (i.e 1st use = 1). Each use will have a different, unique password generated via double hashing the base password + public key + key use.
- `useBalance?` (boolean) - If the account has a balance within the Keypom contract, set this to true to avoid the need to attach a deposit. If the account doesn't have enough balance, an error will throw.
- `returnTransactions?` (boolean) - If true, the transaction will be returned instead of being signed and sent. This is useful for getting the requiredDeposit from the return value without actually signing the transaction.
- `successUrl?` (string) - When signing with a wallet, a success URl can be included that the user will be redirected to once the transaction has been successfully signed.

While there are many fields and it may be overwhelming, seeing examples will help clear things up.

The last thing to note is the return value of `createDrop` since it contains important information that can be used to interact with the drop. The return value is an object with the following fields:
```ts
/**
 * Information returned when creating a drop or adding keys via `createDrop` and `addKeys` respectively.
 */
export interface CreateOrAddReturn {
	/** The responses to any transactions that were signed and sent to the network. */
	responses?: any,
	/** Information about the transactions if `returnTransactions` is specified in the arguments. This will result in the information being returned instead of signed and sent.  */
	transactions?: Transaction[],
	/** The required deposit that should be attached to the transaction. */
	requiredDeposit?: string,
	/** Any keys that were automatically generated. */
	keys?: {
        /** Actual KeyPair objects that can be used to sign messages, verify signatures, and get the public and private keys */
        keyPairs: NearKeyPair[];
        /** Set of public keys that were generated */
        publicKeys: string[];
        /** Set of private keys that were generated */
        secretKeys: string[];
    },
	/** The drop ID for the drop that is being interacted with. */
	dropId: string
}
```

### Creating a simple drop with 10 random keys

In this example, a simple $NEAR drop with 10 keys will be created. To start, the Keypom SDK is initialized with a funder object (since a transaction will be signed). This funder object contains no `rootEntropy` field since all the keys should be random.

The next step is to create the drop with 10 keys. `numKeys` is passed in as well as `depositPerUseNEAR` to indicate that each key should contain 1 $NEAR.

```js
// Initialize the SDK for the given network and NEAR connection. No entropy passed in so any auto-generated keys will be completely random unless otherwise overwritten.
await initKeypom({
    network: "testnet",
    funder: {
        accountId: "benji_demo.testnet",
        secretKey: "ed25519:5yARProkcALbxaSQ66aYZMSBPWL9uPBmkoQGjV3oi2ddQDMh1teMAbz7jqNV9oVyMy7kZNREjYvWPqjcA6LW9Jb1"
    }
});

// Create a drop with 10 completely random keys. The return value `keys` contains information about the generated keys
const {keys} = await createDrop({
    numKeys: 10,
    depositPerUseNEAR: 1,
});

console.log('public keys: ', keys.publicKeys);
console.log('private keys: ', keys.secretKeys);
```

### Creating a simple drop with 5 deterministically generated keys

In this example, a simple $NEAR drop will be created whereby all the keys are deterministically generated based off the funder's `rootEntropy` (think a password). This allows the funder to be able to recover the keys easily assuming they know the password.

To start, `initKeypom` is called and the funder object is passed in and contains a root entropy set to `my-global-secret-password`. This means that any keys that are *auto-generated* will be based off this entropy rather than being random.

Once the SDK is initialized, the drop is created with 5 keys and 1 $NEAR per key. To double check if everything worked, the `generateKeys` method can be leveraged where each key can be generated from the `rootEntropy`, the `dropId`, and the corresponding key nonce (starting at 0). This second piece of entropy that is unique to each key is known as `metaEntropy`. We can generated it by setting an array equal to: `["1_0", "1_1", "1_2", "1_3", "1_4"]` where `1` is the drop ID and the second number is the key nonce (separated by an underscore since that's how the SDK does things). What happens behind the scenes is that the root entropy is combined with the meta entropy for each key and hashed to generate the key.

Using `generateKeys`, the resulting keys can be compared with the ones generated by the SDK and they turn out to be the same.

```js
// Initialize the SDK for the given network and NEAR connection. Root entropy is passed into the funder account so any generated keys will be based off that entropy.
await initKeypom({
	network: "testnet",
	funder: {
		accountId: "benji_demo.testnet",
		secretKey:"d25519:5yARProkcALbxaSQ66aYZMSBPWL9uPBmkoQGjV3oi2ddQDMh1teMAbz7jqNV9oVyMy7kZNREjYvWPqjcA6LW9Jb1",
		rootEntropy: "my-global-secret-password"
	}
});

// Create a simple drop with 5 keys. Each key will be derived based on the rootEntropy of the funder, drop ID, and key nonce.
const { keys: keysFromDrop, dropId } = await createDrop({
	numKeys: 5,
	depositPerUseNEAR: 1,
});

// Deterministically Generate the Private Keys:
const nonceDropIdMeta = Array.from({length: 5}, (_, i) => `${dropId}_${i}`);
const manualKeys = await generateKeys({
	numKeys: 5,
	rootEntropy: "my-global-secret-password",
	metaEntropy: nonceDropIdMeta
})

// Get the public and private keys from the keys generated by the drop
const {publicKeys, secretKeys} = keysFromDrop;
// Get the public and private keys from the keys that were manually generated
const {publicKeys: pubKeysGenerated, secretKeys: secretKeysGenerated} = manualKeys;
// These should match!
console.log('secretKeys: ', secretKeys)
console.log('secretKeysGenerated: ', secretKeysGenerated)

// These should match!
console.log('publicKeys: ', publicKeys)
console.log('pubKeysGenerated: ', pubKeysGenerated)
```

### Creating a simple drop with pre-created keys

This example showcases how you can create a simple drop and pass in keys that are generated ahead of time rather than having them be auto-generated. The first step is always to call `initKeypom`. Once that's finished, the keypairs can be generated by calling `generateKeys` and passing in the number of keys to create. Those public keys can then be passed into `createDrop`.

```js
// Initialize the SDK for the given network and NEAR connection. No entropy passed in so any auto generated keys will be completely random unless otherwise overwritten.
await initKeypom({
network: "testnet",
funder: {
    accountId: "benji_demo.testnet",
    secretKey: "ed25519:5yARProkcALbxaSQ66aYZMSBPWL9uPBmkoQGjV3oi2ddQDMh1teMAbz7jqNV9oVyMy7kZNREjYvWPqjcA6LW9Jb1"
}
});

// Generate 10 random keys
const {publicKeys} = await generateKeys({
    numKeys: 10
});

// Create a drop using the keys that were generated. Since keys are passed in, the return value won't contain information about the keys.
await createDrop({
    publicKeys,
    depositPerUseNEAR: 1,
});
```

### Creating a simple drop with a password protected key

This example shows how you can create a password-protected key. This means that only the person with both the private key *and* the password can claim the $NEAR. The first step is always to call `initKeypom`. After that, a `basePassword` can be passed into `createDrop`. By passing in that parameter, the SDK will enable password protection whereby the password is equal to a hash of `'basePassword + publicKey + keyUse'`.

```js
// Initialize the SDK for the given network and NEAR connection
await initKeypom({
    network: "testnet",
    funder: {
        accountId: "benji_demo.testnet",
        secretKey: "ed25519:5yARProkcALbxaSQ66aYZMSBPWL9uPBmkoQGjV3oi2ddQDMh1teMAbz7jqNV9oVyMy7kZNREjYvWPqjcA6LW9Jb1"
    }
});


const basePassword = "my-cool-password123";
// Create a simple drop with 1 $NEAR and pass in a base password to create a unique password for each use of each key
const {keys} = await createDrop({
    numKeys: 1,
    depositPerUseNEAR: 1,
    basePassword
});

// Create the password to pass into claim which is a hash of the basePassword, public key and whichever use we are on
let currentUse = 1;
let passwordForClaim = await hashPassword(basePassword + keys.publicKeys[0] + currentUse.toString());
```

## Claiming Linkdrops

Once a drop has been created and there are keys available, they can be claimed by calling the SDK's `claim` function. This can be used to either claim the assets to an existing NEAR account or create an entirely new account. The parameters for the function are below.

- `secretKey` (string) - The private key associated with the Keypom link. This can either contain the `ed25519:` prefix or not.
- `accountId?` (string) - The account ID of an existing account that will be used to claim the drop.
- `newAccountId?` (string) - If passed in, a new account ID will be created and the drop will be claimed to that account. This must be an account that does not exist yet. This must be passed in conjunction with `newPublicKey`.
- `newPublicKey?` (string) - If creating a new account, a public key must be passed in to be used as the full access key for the newly created account.
- `password?` (string) - If a password is required to use the key, it can be passed in.

As with creating drops, it helps to look at examples to understand the different scenarios whereby calling `claim` makes sense.

### Claiming a Linkdrop to an Existing Account

In this example, you'll create a simple $NEAR drop with 1 key. The key will be automatically generated and will be completely random since no entropy is used. The first step is to initialize the SDK and call `createDrop`. The return value will contain `keys` since they're being auto-generated.

Once the drop is created, the secret key can be used to claim to an existing account `benjiman.testnet`.

```js
// Initialize the SDK for the given network and NEAR connection
await initKeypom({
    network: "testnet",
    funder: {
        accountId: "benji_demo.testnet",
        secretKey: "ed25519:5yARProkcALbxaSQ66aYZMSBPWL9uPBmkoQGjV3oi2ddQDMh1teMAbz7jqNV9oVyMy7kZNREjYvWPqjcA6LW9Jb1"
    }
});

// Create a simple drop with 1 $NEAR
const {keys} = await createDrop({
    numKeys: 1,
    depositPerUseNEAR: 1,
});

// Claim the drop to the passed in account ID
await claim({
    secretKey: keys.secretKeys[0],
    accountId: "benjiman.testnet"
})
```

### Claiming a Linkdrop and Onboarding a New User

This example will show how to onboard a new user by claiming a simple linkdrop. To start, you'll create a simple $NEAR drop with 1 key. The key will be automatically generated and will be completely random since no entropy is used. 

Once the drop is created, `claim` should be called and the new account ID and public key should be passed in. This public key can either be a completely new keypair or the same keypair that was used to claim the linkdrop. In this tutorial, a new keypair is generated. 

```js
// Initialize the SDK for the given network and NEAR connection
await initKeypom({
    network: "testnet",
    funder: {
        accountId: "benji_demo.testnet",
        secretKey: "ed25519:5yARProkcALbxaSQ66aYZMSBPWL9uPBmkoQGjV3oi2ddQDMh1teMAbz7jqNV9oVyMy7kZNREjYvWPqjcA6LW9Jb1"
    }
});

// Create a simple drop with 1 $NEAR
const {keys} = await createDrop({
    numKeys: 1,
    depositPerUseNEAR: 1,
});

// create a new keypair which will be used for the new account
const {publicKeys, secretKeys} = await generateKeys({
    numKeys: 1
});

// Claim the drop using the secret key from the drop creation step. The newly created account will have a keypair 
// from the generateKeys step.
await claim({
    secretKey: keys.secretKeys[0],
    newAccountId: "my-newly-creating-account.testnet",
    newPublicKey: publicKeys[0]
})
```

### Claiming a Password Protected Linkdrop

This example aims to show how a password protected drop can be created and claimed. The first step is always to initialize the SDK. Once that's finished, a base password for the key can be used and passed into `createDrop`.

When claiming the linkdrop, the password must be passed in otherwise the claim will be unsuccessful. This password is made up of the base password, public key, and current use the key is on (relevant for multi-use keys).
  
```js
// Initialize the SDK for the given network and NEAR connection
await initKeypom({
    network: "testnet",
    funder: {
        accountId: "benji_demo.testnet",
        secretKey: "ed25519:5yARProkcALbxaSQ66aYZMSBPWL9uPBmkoQGjV3oi2ddQDMh1teMAbz7jqNV9oVyMy7kZNREjYvWPqjcA6LW9Jb1"
    }
});

const basePassword = "my-cool-password123";
// Create a simple drop with 1 $NEAR and pass in a base password to create a unique password for each use of each key
const {keys} = await createDrop({
    numKeys: 1,
    depositPerUseNEAR: 1,
    basePassword
});

// Create the password to pass into claim which is a hash of the basePassword, public key and whichever use we are on
let currentUse = 1;
let passwordForClaim = await hashPassword(basePassword + keys.publicKeys[0] + currentUse.toString());

// Claim the drop to the passed in account ID and use the password we generated above.
await claim({
    secretKey: keys.secretKeys[0],
    accountId: "benjiman.testnet",
    password: passwordForClaim
})
```

## Deleting Keys and Drops

Often times, not all the keys in your drop will be used. What happens to the excess keys? Keypom allows you to delete keys from a drop and get fully refunded for any unclaimed assets. This is done by calling the SDK's `deleteKeys` and `deleteDrops` respectively. The difference between the two is outlined below.
- `deleteKeys` allows you to delete a set of specific keys from a drop and get refunded for the assets. This does *not* delete the drop as a whole.
- `deleteDrops` allows you to delete a set of drops and all the keys contained within them. It does this by recursively calling `deleteKeys` for each drop until they're empty and then deleting the drop itself.

The parameters for both functions are outlined below:

### Delete Keys

- `account?` ([Account](https://github.com/near/near-api-js/blob/master/packages/near-api-js/src/account.ts)) - Valid NEAR account object that if passed in, will be used to sign the txn instead of the funder account.
- `wallet?` ([BrowserWalletBehaviour | Wallet](https://github.com/near/wallet-selector/blob/main/packages/core/src/lib/wallet/wallet.types.ts)) - If using a browser wallet through wallet selector and that wallet should sign the transaction, pass in the object.
- `publicKeys` (string[] | string) - Specify a set of public keys to delete. If deleting a single publicKey, the string can be passed in without wrapping it in an array.
- `dropId` (string) - Which drop ID do the keys belong to?
- `withdrawBalance?` (boolean) - Whether or not to withdraw any remaining balance on the Keypom contract.

An example of deleting keys can be seen below where a simple drop with 5 keys is created and one key is deleted.

```js
// Initialize the SDK for the given network and NEAR connection
await initKeypom({
    network: "testnet",
    funder: {
        accountId: "benji_demo.testnet",
        secretKey: "ed25519:5yARProkcALbxaSQ66aYZMSBPWL9uPBmkoQGjV3oi2ddQDMh1teMAbz7jqNV9oVyMy7kZNREjYvWPqjcA6LW9Jb1"
    }
});

// Create the simple drop with 5 random keys
const {keys, dropId} = await createDrop({
    numKeys: 5,
    depositPerUseNEAR: 1,
});

await deleteKeys({
    dropId,
    publicKeys: keys.publicKeys[0] // Can be wrapped in an array as well
})
```

### Delete Drops

- `account?` ([Account](https://github.com/near/near-api-js/blob/master/packages/near-api-js/src/account.ts)) - Valid NEAR account object that if passed in, will be used to sign the txn instead of the funder account.
- `wallet?` ([BrowserWalletBehaviour | Wallet](https://github.com/near/wallet-selector/blob/main/packages/core/src/lib/wallet/wallet.types.ts)) - If using a browser wallet through wallet selector and that wallet should sign the transaction, pass in the object.
- `drops?` ([ProtocolReturnedDrop](https://github.com/keypom/keypom-js/blob/main/src/lib/types/protocol.ts#L29-L60)[]) - If the set of drop information for the drops you want to delete (from `getDropInformation` or `getDrops`) is already known to the client, it can be passed in instead of the drop IDs to reduce computation.
- `dropIds?` (string[]) - Specify a set of drop IDs to delete.
- `withdrawBalance?` (boolean) - Whether or not to withdraw any remaining balance on the Keypom contract.

An example of deleting drops can be seen below where 5 simple drops are created and then they're all deleted in one call to `deleteDrops`.

```js
// Initialize the SDK for the given network and NEAR connection
await initKeypom({
    network: "testnet",
    funder: {
        accountId: "benji_demo.testnet",
        secretKey: "ed25519:5yARProkcALbxaSQ66aYZMSBPWL9uPBmkoQGjV3oi2ddQDMh1teMAbz7jqNV9oVyMy7kZNREjYvWPqjcA6LW9Jb1"
    }
});

// loop to create 5 simple drops each with 5 more keys than the next
for(var i = 0; i < 5; i++) {
    // create 10 keys with no entropy (all random)
    const {publicKeys} = await generateKeys({
        numKeys: 5 * (i+1) // First drop will have 5, then 10, then 15 etc..
    });

    // Create the simple 
    await createDrop({
        publicKeys,
        depositPerUseNEAR: 1,
    });
}

let drops = await getDrops({accountId: "benji_demo.testnet"});

await deleteDrops({
    drops
})

// Get the number of drops the account has after deletion (should be zero)
const numDrops = await getDropSupply({
    accountId: "benjiman.testnet"
});

console.log('numDrops: ', numDrops)
```

## Account Balances for Smooth UX

In order to make the UX of using Keypom seamless, the SDK supports the Protocol's debiting account model. All costs and refunds can go through your account's balance which is stored on the contract. This balance can be topped up or withdrawn at any moment using the SDK's `addToBalance` and `withdrawBalance` functions.

This account balance system is not used by default and must be explicitly enabled by passing in the `useBalance` flag to any corresponding functions. The benefits of using the account balance system is that for browser based wallets, you can skip redirects. 

A very common scenario is creating a drop with many keys at once. To avoid having to redirect the user many times (since only 100 keys can be added to a drop at once), you can call `createDrop` and pass in `returnTransactions` set to true. This will result in the transaction being returned instead of signed and sent. At this point, you can get the required deposit from the returned object and use that in `addToBalance`.

At this point, the user will only be redirected once for the call to `addToBalance`. Once they returned, you can call `createDrop` in conjunction with `addKeys` with `useBalance` set to true.

## Utility Functions

There are several functions and variables that have been exported in order to make developing easier. Below are a few notable functions:
- `nearAPI` (variable) - Contains a suite of functionalities coming from `near-api-js`. This includes, but is not limited to the KeyPair object, formatting functions, different keystores etc.
- `updateFunder()` - Allows you to update the funder account for the SDK. This is useful if you want to use a different account to sign transactions.
- `useKeypom()` - Returns all the environment variables that are used by the SDK. This includes the funder object, Keypom contract, keystore, NEAR connection etc.
- `hashPassword()` - Generate a sha256 hash of a passed in string. This also supports hex encoded strings.
- `formatNearAmount()` - Converts a human readable NEAR amount (i.e 1.5 $NEAR) to yoctoNEAR.
- `parseNearAmount()` - Converts a yoctoNEAR amount to a human readable NEAR amount (i.e 1500000000000000000000000 yoctoNEAR -> 1.5 $NEAR).
- `generateKeys()` - Generate a desired number of keypairs. These can be created with or without entropy.

# Tests

The SDK comes equipped with a number of tests. These can be used as reference for different scenarios that arise with Keypom. To run the tests, you'll need to have a few prerequisites.

## Running the Tests

First, you'll need a valid NEAR account's secret key and account ID. These need to exported as environment variables as the tests will be running on testnet and the transactions need to be signed. Export the following environment variables:

```bash
export TEST_ACCOUNT_ID="YOUR_ACCOUNT_ID"
export TEST_ACCOUNT_PRVKEY="YOUR_SECRET_KEY"
```

Once completed, install the dependencies:

```bash
npm install
```

At this point, everything is in order so that the tests can be run. The following command can be used to begin running the tests:

```bash
npm run test
```

If all went well, the following should be outputted once all the tests have run:

```bash
  ✔ delete 1 key from simple drop (3.7s)
requiredDeposit:  1856805594168075000000050
Receipt: uN5cwkUFXB2gY4LE8vfuCGvA8BcqaTVgoExKQGu2Cct
	Log [v1-3.keypom.testnet]: User balance incremented by 1.8568055. Old: 0 new: 1.8568055
  ✔ Create drop and return requiredDeposit so it can be added to balance (10.5s)
  ✔ invalid args being passed in
  ─

  18 tests passed
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

# How Linkdrops Work

For some background as to how linkdrops works on NEAR: 

*The funder that has an account and some $NEAR:* 
- creates a keypair locally `(pubKey1, privKey1)`. The blockchain doesn't know of this key's existence yet since it's all local for now.
- calls `send` on the contract and passes in the `pubKey1` as an argument as well as the desired `balance` for the linkdrop.
    - The contract will map the `pubKey1` to the desired `balance` for the linkdrop.
    - The contract will then add the `pubKey1` as a **function call access key** with the ability to call `claim` and `create_account_and_claim`. This means that anyone with the `privKey1` that was created locally, can claim this linkdrop. 
- Funder will then create a link to send to someone that contains this `privKey1`. The link follows the following format: 
```
    wallet.testnet.near.org/linkdrop/{fundingContractAccountId}/{linkdropKeyPairSecretKey}?redirectUrl={redirectUrl}
```
* `fundingContractAccountId`: The contract accountId that was used to send the funds.
* `linkdropKeyPairSecretKey`: The corresponding secret key to the public key sent to the contract.
* `redirectUrl`: The url that wallet will redirect to after funds are successfully claimed to an existing account. The URL is sent the accountId used to claim the funds as a query param.

*The receiver of the link that is claiming the linkdrop:* 
- Receives the link which includes `privKey1` and sends them to the NEAR wallet.
- Wallet creates a new keypair `(pubKey2, privKey2)` locally. The blockchain doesn't know of this key's existence yet since it's all local for now.
- Receiver will then choose an account ID such as `new_account.near`. 
- Wallet will then use the `privKey1` which has access to call `claim` and `create_account_and_claim` in order to call `create_account_and_claim` on the contract.
    - It will pass in `pubKey2` which will be used to create a full access key for the new account.
- The contract will create the new account and transfer the funds to it alongside any NFT or fungible tokens pre-loaded.

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