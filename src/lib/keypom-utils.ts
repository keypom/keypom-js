import type { Action } from "@near-wallet-selector/core";
import { FinalExecutionOutcome } from "@near-wallet-selector/core";
import { Transaction } from "@near-wallet-selector/core/lib/wallet";
import { BrowserWalletBehaviour, Wallet } from '@near-wallet-selector/core/lib/wallet/wallet.types';
import BN from 'bn.js';
import * as nearAPI from 'near-api-js';
import { Account, Near, transactions } from "near-api-js";
import { SignAndSendTransactionOptions } from "near-api-js/lib/account";
import { generateSeedPhrase } from 'near-seed-phrase';
import { assert, isValidAccountObj } from "./checks";
import { getEnv, supportedLinkdropClaimPages } from "./keypom";
import { PasswordPerUse } from "./types/drops";
import { FCData } from "./types/fc";
import { FTData, FungibleTokenMetadata } from "./types/ft";
import { GeneratedKeyPairs, NearKeyPair } from "./types/general";
import { NonFungibleTokenMetadata, ProtocolReturnedNonFungibleTokenMetadata, ProtocolReturnedNonFungibleTokenObject } from "./types/nft";
import { CreateDropProtocolArgs } from "./types/params";

type AnyWallet = BrowserWalletBehaviour | Wallet;

const {
    KeyPair,
	utils,
	utils: {
		format: { parseNearAmount },
	},
} = nearAPI;

export const exportedNearAPI = nearAPI;

let sha256Hash
if (typeof crypto === 'undefined') {
    const nodeCrypto = require('crypto');
    sha256Hash = (ab) => nodeCrypto.createHash('sha256').update(ab).digest();
} else {
    sha256Hash = (ab) => crypto.subtle.digest('SHA-256', ab)
}

/// How much Gas each each cross contract call with cost to be converted to a receipt
const GAS_PER_CCC: number = 5000000000000; // 5 TGas
const RECEIPT_GAS_COST: number = 2500000000000; // 2.5 TGas
const YOCTO_PER_GAS: number = 100000000; // 100 million
export const ATTACHED_GAS_FROM_WALLET: number = 100000000000000; // 100 TGas

/// How much yoctoNEAR it costs to store 1 access key
const ACCESS_KEY_STORAGE: BN = new BN("1000000000000000000000");

export const key2str = (v) => typeof v === 'string' ? v : v.pk

const hashBuf = (str: string, fromHex = false): Promise<ArrayBuffer> => sha256Hash(Buffer.from(str, fromHex ? 'hex' : 'utf8'));

/**
 * Get the public key from a given secret key.
 * 
 * @param {string} secretKey - The secret key you wish to get the public key from
 * 
 * @returns {Promise<string>} - The public key
 * 
 * @example
 * ```js
 * const pubKey = await getPubFromSecret("ed25519:5yARProkcALbxaSQ66aYZMSBPWL9uPBmkoQGjV3oi2ddQDMh1teMAbz7jqNV9oVyMy7kZNREjYvWPqjcA6LW9Jb1");
 * console.log(pubKey);
 * ```
 * @group Utility
 */
export const getPubFromSecret = async (secretKey: string): Promise<string> => {
    var keyPair = KeyPair.fromString(secretKey);
    return keyPair.getPublicKey().toString()
};

/**
 * Check whether or not a given account ID exists on the network.
 * 
 * @param {string} accountId - The account ID you wish to check
 * 
 * @returns {Promise<boolean>} - A boolean indicating whether or not the account exists
 * 
 * @example
 * ```js
 * const accountExists = await accountExists("benji.near");
 * console.log(accountExists); // true
 * ```
 * @group Utility
 */
export const accountExists = async (accountId): Promise<boolean> => {
    const {connection} = getEnv();

    try {
        const account = new nearAPI.Account(connection!, accountId);
        await account.state();
        return true;
    } catch(e) {
        if (!/no such file|does not exist/.test((e as any).toString())) {
            throw e;
        }
        return false;
    }
};

/**
 * Get the NFT Object (metadata, owner, approval IDs etc.) for a given token ID on a given contract.
 * 
 * @param {string} contractId - The contract ID of the NFT contract
 * @param {string} tokenId - The token ID of the NFT you wish to get the metadata for
 * 
 * @returns {Promise<ProtocolReturnedNonFungibleTokenObject>} - The NFT Object
 * 
 * @example
 * ```js
 * const nft = await getNFTMetadata({
 *     contractId: "nft.keypom.testnet",
 *     tokenId: "1"
 * });
 * console.log(nft);
 * ```
 * @group Utility
 */
export const getNFTMetadata = async ({contractId, tokenId}: {contractId: string, tokenId: string}): Promise<ProtocolReturnedNonFungibleTokenObject> => {
    const { near, viewCall } = getEnv();

    const res: ProtocolReturnedNonFungibleTokenObject = await viewCall({
        contractId,
        methodName: 'nft_token',
        args: {
            token_id: tokenId
        }
    })

    return res;
};

/**
 * Get the FT Metadata for a given fungible token contract. This is used to display important information such as the icon for the token, decimal format etc.
 * 
 * @param {string} contractId - The contract ID of the FT contract
 * 
 * @returns {Promise<FungibleTokenMetadata>} - The FT Metadata
 * 
 * @example
 * ```js
 * const ft = await getFTMetadata({
 *    contractId: "ft.keypom.testnet"
 * });
 * console.log(ft);
 * ```
 * @group Utility
 */
export const getFTMetadata = async ({contractId}: {contractId: string}): Promise<FungibleTokenMetadata> => {
    const { near, viewCall } = getEnv();

    const res: FungibleTokenMetadata = await viewCall({
        contractId,
        methodName: 'ft_metadata',
        args: {}
    })

    return res;
};

/**
 * Creates a new NFT series on the official Keypom Series contracts. This is for lazy minting NFTs as part of an FC drop.
 * 
 * @example
 * Send 3 NFTs using the funder account (not passing in any accounts into the call):
 * ```js
 *	await initKeypom({
 *		// near,
 *		network: 'testnet',
 *		funder: {
 *			accountId,
 *			secretKey,
 *		}
 *	})
 *
 *	const {keys, dropId} = await createDrop({
 *		numKeys: 1,
 *		config: {
 *			usesPerKey: 100
 *		},
 *		metadata: "My Cool Drop Title!",
 *		depositPerUseNEAR: 0.5,
 *		fcData: {
 *			methods: [[
 *				{
 *					receiverId: `nft-v2.keypom.testnet`,
 *					methodName: "nft_mint",
 *					args: "",
 *					dropIdField: "mint_id",
 *					accountIdField: "receiver_id",
 *					attachedDeposit: parseNearAmount("0.1")
 *				}
 *			]]
 *		}
 *	})
 *
 *	const res = await createNFTSeries({
 *		dropId,
 *		metadata: {
 *			title: "Moon NFT!",
 *			description: "A cool NFT for the best dog in the world.",
 *			media: "bafybeibwhlfvlytmttpcofahkukuzh24ckcamklia3vimzd4vkgnydy7nq",
 *			copies: 500
 *		}
 *	});
 *	console.log('res: ', res)
 *
 *	const URLs = formatLinkdropUrl({
 *		baseUrl: "localhost:3000/claim",
 *		secretKeys: keys.secretKeys
 *	})
 *	console.log('URLs: ', URLs)
 * ```
 * @group Utility
*/
export const createNFTSeries = async ({
    account,
    wallet,
    dropId,
    metadata,
    royalty
}: {
	/** Account object that if passed in, will be used to sign the txn instead of the funder account. */
	account?: Account,
	/** If using a browser wallet through wallet selector and that wallet should sign the transaction, pass in the object. */
	wallet?: AnyWallet,
	/** The drop ID for the drop that should have a series associated with it. */
    dropId: string,
	/** The metadata that all minted NFTs will have. */
    metadata: NonFungibleTokenMetadata,
	/** Any royalties associated with the series (as per official NEP-199 standard: https://github.com/near/NEPs/blob/master/neps/nep-0199.md) */
    royalty?: Map<string, number>,
}): Promise<void | FinalExecutionOutcome[]> => {
    const { getAccount, networkId } = getEnv();
	assert(isValidAccountObj(account), 'Passed in account is not a valid account object.')
	account = await getAccount({ account, wallet })

    const actualMetadata: ProtocolReturnedNonFungibleTokenMetadata = {
        title: metadata.title,
        description: metadata.description,
        media: metadata.media,
        media_hash: metadata.mediaHash,
        copies: metadata.copies,
        issued_at: metadata.issuedAt,
        expires_at: metadata.expiresAt,
        starts_at: metadata.startsAt,
        updated_at: metadata.updatedAt,
        extra: metadata.extra,
        reference: metadata.reference,
        reference_hash: metadata.referenceHash,
    }

    const nftSeriesAccount = networkId == "testnet" ? "nft-v2.keypom.testnet" : "nft-v2.keypom.near"

    const tx: Transaction = {
        receiverId: nftSeriesAccount,
        signerId: account!.accountId,
        actions: [{
            type: 'FunctionCall',
            params: {
                methodName: 'create_series',
                args: {
                    mint_id: parseInt(dropId),
                    metadata: actualMetadata,
                    royalty
                },
                gas: '50000000000000',
                deposit: parseNearAmount("0.25")!,
            }
        }]
    }

    return execute({ account: account!, transactions: [tx]}) as Promise<void | FinalExecutionOutcome[]>
}

/**
 * Constructs a valid linkdrop URL for a given claim page or custom URL. To view the list of supported claim pages, see the exported `supportedLinkdropClaimPages` variable.
 * 
 * @param {string | string[]} secretKeys - Either a single secret key or an array of secret keys that should be embedded in the linkdrop URLs.
 * @param {string=} claimPage - A valid reference to the claim page. See the exported `supportedLinkdropClaimPages` variable for a list of supported claim pages. If not provided, a custom base URL must be provided.
 * @param {string=} networkId - The network ID you wish to linkdrop on. If not provided, the current network that the SDK is connected to will be used. 
 * @param {string=} contractId - The contract ID where the secret key belongs to. If not provided, the current contract ID that the SDK is connected to will be used. 
 * @param {string=} customURL - A custom URL containing a `SECRET_KEY` string and `CONTRACT_ID` string for where to insert the secret key and contract ID. For example, a base URL of `foo.com/CONTRACT_ID#SECRET_KEY` with a contract `v2.keypom.near` and secret key `5CBLiJK21EQoB...` would result in `foo.com/v2.keypom.near#5CBLiJK21EQoB...`.
 * 
 * @returns {string[]} - An array of the linkdrop URLs
 * 
 * @example
 * Use the keypom claim page:
 * ```js
 * await initKeypom({
 *     network: 'testnet',
 *     funder: {
 *         accountId,
 *         secretKey,
 *     }
 * })
 * 
 * const {keys} = await createDrop({
 *     numKeys: 1,
 *     depositPerUseNEAR: 1
 * });
 * 
 * const linkdropUrl = formatLinkdropUrl({
 *     claimPage: "keypom", 
 *     contractId: "v2.keypom.testnet",
 *     secretKeys: keys.secretKeys[0] // Can be either the array or individual secret key string
 * })
 * 
 * console.log('linkdropUrl: ', linkdropUrl)
 * ```
 * @example
 * Use a custom claim page with ONLY the secret key
 * ```js
 * await initKeypom({
 *     network: 'testnet',
 *     funder: {
 *         accountId,
 *         secretKey,
 *     }
 * })
 * 
 * const {keys} = await createDrop({
 *     numKeys: 1,
 *     depositPerUseNEAR: 1
 * });
 * 
 * const linkdropUrl = formatLinkdropUrl({
 *     customURL: "foobar/SECRET_KEY/barfoo", 
 *     contractId: "v2.keypom.testnet",
 *     secretKeys: keys.secretKeys[0] // Can be either the array or individual secret key string
 * })
 * 
 * console.log('linkdropUrl: ', linkdropUrl)
 * ```
 * @example
 * Use a custom claim page with both the secret key and contract ID
 * ```js
 * await initKeypom({
 *     network: 'testnet',
 *     funder: {
 *         accountId,
 *         secretKey,
 *     }
 * })
 * 
 * const {keys} = await createDrop({
 *     numKeys: 1,
 *     depositPerUseNEAR: 1
 * });
 * 
 * const linkdropUrl = formatLinkdropUrl({
 *     customURL: "foobar/SECRET_KEY/barfoo/CONTRACT_ID", 
 *     contractId: "v2.keypom.testnet",
 *     secretKeys: keys.secretKeys[0] // Can be either the array or individual secret key string
 * })
 * 
 * console.log('linkdropUrl: ', linkdropUrl)
 * ```
 * @group Utility
 */
export const formatLinkdropUrl = ({
    claimPage, 
    networkId, 
    contractId, 
    secretKeys, 
    customURL
}: {
    claimPage?: string, 
    networkId?: string,
    contractId?: string,
    secretKeys: string[] | string,
    customURL?: string
}): string[] => {
    const { networkId: envNetworkId, contractId: envContractId } = getEnv();
    networkId = networkId || envNetworkId;
    contractId = contractId || envContractId;
    
    assert(secretKeys, "Secret keys must be passed in as either an array or a single string");
    assert(customURL || supportedLinkdropClaimPages[networkId!].hasOwnProperty(claimPage), `Either a custom base URL or a supported claim page must be passed in.`);
    customURL = customURL || supportedLinkdropClaimPages[networkId!][claimPage!];

    // If the secret key is a single string, convert it to an array
    if (typeof secretKeys === 'string') {
        secretKeys = [secretKeys];
    }

    // insert the contractId and secret key into the base URL based on the CONTRACT_ID and SECRET_KEY field
    let returnedURLs: Array<string> = [];
    // loop through all secret keys
    secretKeys.forEach((secretKey) => {
        // insert the secret key into the base URL
        let url = customURL!.replace('SECRET_KEY', secretKey);
        // insert the contract ID into the base URL
        url = url.replace('CONTRACT_ID', contractId!);
        // add the URL to the array of URLs
        returnedURLs.push(url);
    });

    return returnedURLs;
}

/**
 * Generate a sha256 hash of a passed in string. If the string is hex encoded, set the fromHex flag to true.
 * 
 * @param {string} str - the string you wish to hash. By default, this should be utf8 encoded. If the string is hex encoded, set the fromHex flag to true.
 * @param {boolean} fromHex (OPTIONAL) - A flag that should be set if the string is hex encoded. Defaults to false.
 * 
 * @returns {Promise<string>} - The resulting hash
 * 
 * @example
 * Generating the required password to pass into `claim` given a base password:
 * ```js
 * 	// Create the password to pass into claim which is a hash of the basePassword, public key and whichever use we are on
 * let currentUse = 1;
 * let passwordForClaim = await hashPassword(basePassword + publicKey + currentUse.toString());
 * ```
 * @group Utility
 */
export const hashPassword = async (str: string, fromHex = false): Promise<string> => {
    let buf = await hashBuf(str, fromHex);
    return Buffer.from(buf).toString('hex');
}

/**
 * Generate ed25519 KeyPairs that can be used for Keypom linkdrops, or full access keys to claimed accounts. These keys can optionally be derived from some entropy such as a root password and metadata pertaining to each key (user provided password etc.). 
 * Entropy is useful for creating an onboarding experience where in order to recover a keypair, the client simply needs to provide the meta entropy (could be a user's password) and the secret root key like a UUID).
 * 
 * @param {number} numKeys - The number of keys to generate
 * @param {string=} rootEntropy (OPTIONAL) - A root string that will be used as a baseline for all keys in conjunction with different metaEntropies (if provided) to deterministically generate a keypair. If not provided, the keypair will be completely random.
 * @param {string=} metaEntropy (OPTIONAL) - An array of entropies to use in conjunction with a base rootEntropy to deterministically generate the private keys. For single key generation, you can either pass in a string array with a single element, or simply 
 pass in the string itself directly (not within an array).
 * @param {number=} autoMetaNonceStart (OPTIONAL) - Specify a starting index whereby the meta entropy will automatically increment by 1 for each key generated. This is to avoid having to pass in an array of meta entropy that simply increments by 1 each time.
 * This is very useful as auto key generation uses the drop ID, base password and key nonce. The drop ID and base password would be a constant and make up the root entropy and then the key nonce increments by 1 for each key generated.
 * @returns {Promise<GeneratedKeyPairs>} - An object containing an array of KeyPairs, Public Keys and Secret Keys.
 * 
 * @example
 * Generating 10 unique random keypairs with no entropy:
 * ```js
 * // Generate 10 keys with no entropy (all random)
 * let keys = await generateKeys({
 *     numKeys: 10,
 * })
 * 
 * let pubKey1 = keys.publicKeys[0];
 * let secretKey1 = keys.secretKeys[0];
 * 
 * console.log('1st Public Key: ', pubKey1);
 * console.log('1st Secret Key: ', secretKey1)
 * ```
 * 
 * @example
 * Generating 1 keypair based on entropy:
 * ```js
 * // Generate 1 key with the given entropy
 * let {publicKeys, secretKeys} = await generateKeys({
 *     numKeys: 1,
 *     rootEntropy: "my-global-password",
 *     metaEntropy: "user-password-123" // In this case, since there is only 1 key, the entropy can be an array of size 1 as well.
 * })
 * 
 * let pubKey = publicKeys[0];
 * let secretKey = secretKeys[0];
 * 
 * console.log('Public Key: ', pubKey);
 * console.log('Secret Key: ', secretKey)
 * ```
 * 
 * @example 
 * Generating 2 keypairs each with their own entropy:
 * ```js
 * // Generate 2 keys each with their own unique entropy
 * let keys = await generateKeys({
 *     numKeys: 2,
 *     rootEntropy: "my-global-password",
 *     metaEntropy: [
 *        `first-password:0`,
 *        `second-password:1`
 *    ]
 * })
 * 
 * console.log('Pub Keys ', keys.publicKeys);
 * console.log('Secret Keys ', keys.secretKeys);
 * ```
 *  * @example 
 * Generate 50 keys exactly how the auto key generation would in createDrop and addKeys:
 * ```js
 * const dropId = '1676913490360';
 * const basePassword = "my-password";
 * // Generate 50 keys each with their own unique entropy
 * let keys = await generateKeys({
 *     numKeys: 50,
 *     rootEntropy: `${basePassword}-${dropId}`,
 *     autoMetaNonceStart: 0
 * })
 * 
 * console.log('Pub Keys ', keys.publicKeys);
 * console.log('Secret Keys ', keys.secretKeys);
 * ```
 * @group Utility
 */
export const generateKeys = async ({numKeys, rootEntropy, metaEntropy, autoMetaNonceStart}: {
	/** The number of keys to generate. */
	numKeys: number;
	/** A root string that will be used as a baseline for all keys in conjunction with different metaEntropies (if provided) to deterministically generate a keypair. If not provided, the keypair will be completely random. */
	rootEntropy?: string;
	/** An array of entropies to use in conjunction with a base rootEntropy to deterministically generate the private keys. For single key generation, you can either pass in a string array with a single element, or simply 
 pass in the string itself directly (not within an array). */
	metaEntropy?: string[] | string;
    autoMetaNonceStart?: number;
}): Promise<GeneratedKeyPairs> => {
    // If the metaEntropy provided is not an array (simply the string for 1 key), we convert it to an array of size 1 so that we can use the same logic for both cases
    if (metaEntropy && !Array.isArray(metaEntropy)) {
        metaEntropy = [metaEntropy]
    }

    // Ensure that if metaEntropy is provided, it should be the same length as the number of keys
    const numEntropy = metaEntropy?.length || numKeys;
    assert(numEntropy == numKeys, `You must provide the same number of meta entropy values as the number of keys`)
    
    var keyPairs: NearKeyPair[] = []
    var publicKeys: string[] = []
    var secretKeys: string[] = []

    if (metaEntropy === undefined && autoMetaNonceStart !== undefined) {
        metaEntropy = Array(numKeys).fill(0).map((_, i) => (autoMetaNonceStart + i).toString())
    }

    for (let i = 0; i < numKeys; i++) {
        if (rootEntropy) {
            const stringToHash = metaEntropy ? `${rootEntropy}_${metaEntropy[i]}` : rootEntropy;
            const hash: ArrayBuffer = await hashBuf(stringToHash);

            const { secretKey, publicKey } = generateSeedPhrase(hash)
            var keyPair = KeyPair.fromString(secretKey);
            keyPairs.push(keyPair);
            publicKeys.push(publicKey)
            secretKeys.push(secretKey)
        } else {
            var keyPair = KeyPair.fromRandom('ed25519');
            keyPairs.push(keyPair);
            publicKeys.push(keyPair.getPublicKey().toString())
            // @ts-ignore - not sure why it's saying secret key isn't property of keypair
            secretKeys.push(keyPair.secretKey)
        }
    }

    return {
        keyPairs,
        publicKeys,
        secretKeys
    }
}

export const keypomView = async ({ methodName, args }) => {
    const {
		viewCall, contractId,
	} = getEnv()

    return viewCall({
		contractId,
		methodName,
		args
	})
}

/// TODO WIP: helper to remove the deposit if the user already has enough balance to cover the drop,add_keys
// export const hasDeposit = ({
//     accountId,
//     transactions,
// }) => {
//     const { contractId, viewAccount } = getEnv()

//     const totalDeposit = transactions.reduce((a, c) =>
//         a.add(c.actions.reduce((a, c) => a.add(new BN(c.deposit || '0')), new BN('0')))
//     , new BN('0'))

// 	const userBalance = viewAccount.viewFunction2({ contractId, methodName: 'get_user_balance', args: { account_id: accountId }})

//     if (new BN(userBalance.gt(totalDeposit))) {
//         transactions
//             .filter(({ receiverId }) => contractId === receiverId)
//             .forEach((tx) => tx.actions.forEach((a) => {
//                 if (/create_drop|add_keys/gi.test(a.methodName)) delete a.deposit
//             }))
//     }
// }

/** @group Utility */
export const execute = async ({
	transactions,
	account,
	wallet,
    fundingAccount,
    successUrl,
}: {
	transactions: Transaction[],
	account: Account,
	wallet?: Wallet,
    fundingAccount?: Account,
    successUrl?: string,
}): Promise<void | FinalExecutionOutcome[] | Array<void | FinalExecutionOutcome>> => {
	const {
        contractId,
	} = getEnv()
    
	// instance of walletSelector.wallet()
	if (wallet) {
        // wallet might be Promise<Wallet> or value, either way doesn't matter
        wallet = await wallet;
        // might be able to sign transactions with app key
        let needsRedirect = false;
        transactions.forEach((tx) => {
            if (tx.receiverId !== contractId) needsRedirect = true
            tx.actions.forEach((a) => {
                const { deposit } = (a as any)?.params
                if (deposit && deposit !== '0') needsRedirect = true
            })
        })
        
        if (needsRedirect) return await wallet.signAndSendTransactions({ transactions, callbackUrl: successUrl })
        // sign txs in serial without redirect
        const responses: Array<void | FinalExecutionOutcome> = []
        for (const tx of transactions) {
            responses.push(await wallet.signAndSendTransaction({
                actions: tx.actions,
            }))
        }
        return responses
    }

	/// instance of NEAR Account (backend usage)
	const nearAccount = account || fundingAccount
    assert(nearAccount,`Call with either a NEAR Account argument 'account' or initialize Keypom with a 'fundingAccount'`)

	return await signAndSendTransactions(nearAccount, transformTransactions(<Transaction[]> transactions))
}

/**
 * For FT Drops, keys need to be registered before they can be used. This is done via the `ft_transfer_call` method on the FT contract.
 * This is a convenience method to make that process easier.
 * 
 * @example
 * Send FTs using the funder account (not passing in any accounts into the call):
 * ```js
 * // Initialize the SDK on testnet
 * await initKeypom({
 * 	network: "testnet",
 * 	funder: {
 * 		accountId: "benji_demo.testnet",
 * 		secretKey: "ed25519:5yARProkcALbxaSQ66aYZMSBPWL9uPBmkoQGjV3oi2ddQDMh1teMAbz7jqNV9oVyMy7kZNREjYvWPqjcA6LW9Jb1"
 * 	}
 * });
 * 
 * await ftTransferCall({
 *     contractId: "ft.keypom.testnet",
 *     amount: "1",
 *     dropId: "1231231",
 * )};
 * ```
 * @group Registering Key Uses
*/
export const ftTransferCall = async ({
    account,
    wallet,
    contractId,
    absoluteAmount,
    amount,
    dropId,
    returnTransaction = false,
}: {
    /** Account object that if passed in, will be used to sign the txn instead of the funder account. */
	account?: Account,
	/** If using a browser wallet through wallet selector and that wallet should sign the transaction, pass in the object. */
	wallet?: AnyWallet,
	/** The fungible token contract ID. */
    contractId: string,
	/** Amount of tokens to transfer but considering the decimal amount (non human-readable).
	 *  Example: transferring one wNEAR should be passed in as "1000000000000000000000000" and NOT "1" 
    */
	absoluteAmount?: string
	/**
	 * Human readable format for the amount of tokens to transfer.
     * Example: transferring one wNEAR should be passed in as "1" and NOT "1000000000000000000000000"
	 */
    amount?: string,
	/** The drop ID to register the keys for. */
	dropId: string,
	/** If true, the transaction will be returned instead of being signed and sent. */
    returnTransaction?: boolean,
}): Promise<Promise<void | FinalExecutionOutcome[]> | Transaction> => {
    const { getAccount, near, receiverId: keypomContractId, viewCall } = getEnv();
	assert(isValidAccountObj(account), 'Passed in account is not a valid account object.')
	account = await getAccount({ account, wallet })

    if (amount) {
        const metadata = await viewCall({
            contractId,
            methodName: 'ft_metadata',
        })

        absoluteAmount = parseFTAmount(amount, metadata.decimals);
    }

    const tx: Transaction = {
        receiverId: contractId,
        signerId: account!.accountId,
        actions: [{
            type: 'FunctionCall',
            params: {
                methodName: 'ft_transfer_call',
                args: {
                    receiver_id: keypomContractId,
                    amount: absoluteAmount,
                    msg: dropId.toString()
                },
                gas: '50000000000000',
                deposit: '1',
            }
        }]
    }

    if (returnTransaction) return tx
    return execute({ account: account!, transactions: [tx]}) as Promise<void | FinalExecutionOutcome[]>
}

/**
 * For NFT Drops, keys need to be registered before they can be used. This is done via the `nft_transfer_call` method on the NFT contract.
 * This is a convenience method to make that process easier.
 * 
 * @param {Account=} account (OPTIONAL) If specified, the passed in account will be used to sign the txn instead of the funder account.
 * @param {BrowserWalletBehaviour=} wallet (OPTIONAL) If using a browser wallet through wallet selector and that wallet should sign the transaction, pass it in.
 * @param {string} contractId The non-fungible token contract ID.
 * @param {string[]} tokenIds A set of token IDs that should be sent to the Keypom contract in order to register keys.
 * @param {string} dropId The drop ID to register the keys for.
 * @param {boolean=} returnTransaction (OPTIONAL) If true, the transaction will be returned instead of being signed and sent.
 * 
 * @example
 * Send 3 NFTs using the funder account (not passing in any accounts into the call):
 * ```js
 * // Initialize the SDK on testnet
 * await initKeypom({
 * 	network: "testnet",
 * 	funder: {
 * 		accountId: "benji_demo.testnet",
 * 		secretKey: "ed25519:5yARProkcALbxaSQ66aYZMSBPWL9uPBmkoQGjV3oi2ddQDMh1teMAbz7jqNV9oVyMy7kZNREjYvWPqjcA6LW9Jb1"
 * 	}
 * });
 * 
 * await nftTransferCall({
 *     contractId: "nft.keypom.testnet",
 *     tokenIds: ["1", "2", "3],
 *     dropId: "1231231",
 * )};
 * ```
 * @group Registering Key Uses
*/
export const nftTransferCall = async ({
    account,
    wallet,
    contractId,
    tokenIds,
    dropId,
    returnTransactions = false,
}: {
	/** Account object that if passed in, will be used to sign the txn instead of the funder account. */
	account?: Account,
	/** If using a browser wallet through wallet selector and that wallet should sign the transaction, pass in the object. */
	wallet?: AnyWallet,
	/** The non-fungible token contract ID. */
    contractId: string,
	/** A set of token IDs that should be sent to the Keypom contract in order to register keys. */
    tokenIds: string[],
	/** The drop ID to register the keys for. */
    dropId: string,
	/** If true, the transaction will be returned instead of being signed and sent. */
	returnTransactions?: boolean,
}): Promise<Array<void | FinalExecutionOutcome[]> | Transaction[]> => {
    const { getAccount, near, receiverId } = getEnv();
	assert(isValidAccountObj(account), 'Passed in account is not a valid account object.')
	account = await getAccount({ account, wallet })

    assert(tokenIds.length < 6, `This method can only transfer 6 NFTs in 1 batch transaction.`)

    const responses: Array<FinalExecutionOutcome[]> = []

    const transactions: Transaction[] = []

    /// TODO batch calls in parallel where it makes sense
    for (let i = 0; i < tokenIds.length; i++) {
        const tx: Transaction = {
            receiverId: contractId,
            signerId: account!.accountId,
            actions: [{
                type: 'FunctionCall',
                params: {
                    methodName: 'nft_transfer_call',
                    args: {
                        receiver_id: receiverId,
                        token_id: tokenIds[i],
                        msg: dropId.toString()
                    },
                    gas: '50000000000000',
                    deposit: '1',
                }
            }]
        }
        transactions.push(tx)
        if (returnTransactions) continue

        responses.push(<FinalExecutionOutcome[]> await execute({
            account: account!,
            transactions,
        }))
    }
    return returnTransactions ? transactions : responses
}

/// https://github.com/near/near-api-js/blob/7f16b10ece3c900aebcedf6ebc660cc9e604a242/packages/near-api-js/src/utils/format.ts#L53
export const parseFTAmount = (amt: string, decimals: number): string => {
    amt = amt.replace(/,/g, '').trim();
    const split = amt.split('.');
    const wholePart = split[0];
    const fracPart = split[1] || '';
    if (split.length > 2 || fracPart.length > decimals) {
        throw new Error(`Cannot parse '${amt}' as NEAR amount`);
    }
    return trimLeadingZeroes(wholePart + fracPart.padEnd(decimals, '0'));
}

const trimLeadingZeroes = (value: string): string => {
    value = value.replace(/^0+/, '');
    if (value === '') {
        return '0';
    }
    return value;
}


/// sequentially execute all transactions
const signAndSendTransactions = async (account: Account, txs: SignAndSendTransactionOptions[]): Promise<FinalExecutionOutcome[]> => {
	const responses: FinalExecutionOutcome[] = []
    for (let i = 0; i < txs.length; i++) {
        // @ts-ignore
        // near-api-js marks this method as protected.
        // Reference: https://github.com/near/wallet-selector/blob/7f9f8598459cffb80583c2a83c387c3d5c2f4d5d/packages/my-near-wallet/src/lib/my-near-wallet.spec.ts#L31
		responses.push(await account.signAndSendTransaction(txs[i]));
	}
    return responses
}

export const transformTransactions = (transactions: Transaction[]): SignAndSendTransactionOptions[] => transactions.map(({ receiverId, actions: _actions }) => {
    const actions = _actions.map((action) =>
    createAction(action)
    );
    let txnOption: SignAndSendTransactionOptions = {
        receiverId: receiverId as string,
        actions
    };
    return (txnOption);
});

// reference: https://github.com/near/wallet-selector/blob/d09f69e50df05c8e5f972beab4f336d7cfa08c65/packages/wallet-utils/src/lib/create-action.ts
const createAction = (action: Action): transactions.Action => {
	switch (action.type) {
		case "CreateAccount":
			return transactions.createAccount();
		case "DeployContract": {
			const { code } = action.params;

			return transactions.deployContract(code);
		}
		case "FunctionCall": {
			const { methodName, args, gas, deposit } = action.params;

			return transactions.functionCall(
				methodName,
				args,
				new BN(gas),
				new BN(deposit)
			);
		}
		case "Transfer": {
			const { deposit } = action.params;

			return transactions.transfer(new BN(deposit));
		}
		case "Stake": {
			const { stake, publicKey } = action.params;

			return transactions.stake(new BN(stake), utils.PublicKey.from(publicKey));
		}
		case "AddKey": {
			const { publicKey, accessKey } = action.params;

			// return transactions.addKey(
			// 	utils.PublicKey.from(publicKey),
			// 	// TODO: Use accessKey.nonce? near-api-js seems to think 0 is fine?
			// 	getAccessKey(accessKey.permission)
			// );
		}
		case "DeleteKey": {
			const { publicKey } = action.params;

			return transactions.deleteKey(utils.PublicKey.from(publicKey));
		}
		case "DeleteAccount": {
			const { beneficiaryId } = action.params;

			return transactions.deleteAccount(beneficiaryId);
		}
		default:
			throw new Error("Invalid action type");
	}
};

/** @group Utility */
export const getStorageBase = ({
    public_keys, 
    deposit_per_use, 
    drop_id, 
    config, 
    metadata, 
    simple, 
    ft, 
    nft, 
    fc, 
    passwords_per_use
}: CreateDropProtocolArgs) => {
    const storageCostNEARPerByte = 0.00001;
    let totalBytes = 0;

    // Get the bytes per public key, multiply it by number of keys, and add it to the total
    let bytesPerKey = Buffer.from("ed25519:88FHvWTp21tahAobQGjD8YweXGRgA7jE8TSQM6yg4Cim").length;
    let totalBytesForKeys = bytesPerKey * (public_keys?.length || 0);
    // console.log('totalBytesForKeys: ', totalBytesForKeys)
    // Bytes for the deposit per use
    let bytesForDeposit = Buffer.from(deposit_per_use.toString()).length + 40;
    // console.log('bytesForDeposit: ', bytesForDeposit)
    // Bytes for the drop ID
    let bytesForDropId = Buffer.from(drop_id || "").length + 40;
    // console.log('bytesForDropId: ', bytesForDropId)
    // Bytes for the config
    let bytesForConfig = Buffer.from(JSON.stringify(config || "")).length + 40;
    // console.log('bytesForConfig: ', bytesForConfig)
    // Bytes for the metadata. 66 comes from collection initialization
    let bytesForMetadata = Buffer.from(metadata || "").length + 66;
    // console.log('bytesForMetadata: ', bytesForMetadata)
    // Bytes for the simple data
    let bytesForSimple = Buffer.from(JSON.stringify(simple || "")).length + 40;
    // console.log('bytesForSimple: ', bytesForSimple)
    // Bytes for the FT data
    let bytesForFT = Buffer.from(JSON.stringify(ft || "")).length + 40;
    // console.log('bytesForFT: ', bytesForFT)
    // Bytes for the NFT data
    let bytesForNFT = Buffer.from(JSON.stringify(nft || "")).length + 40;
    // console.log('bytesForNFT: ', bytesForNFT)
    // Bytes for the FC data
    let bytesForFC = Buffer.from(JSON.stringify(fc || "")).length + 40;
    // console.log('bytesForFC: ', bytesForFC)

    // Bytes for the passwords per use
    // Magic numbers come from plotting SDK data against protocol data and finding the best fit
    let bytesForPasswords = Buffer.from(JSON.stringify(passwords_per_use || "")).length * 4;
    
    // console.log('bytesForPasswords: ', bytesForPasswords)
    totalBytes += totalBytesForKeys + bytesForDeposit + bytesForDropId + bytesForConfig + bytesForMetadata + bytesForSimple + bytesForFT + bytesForNFT + bytesForFC + bytesForPasswords;
    
    // console.log('totalBytes: ', totalBytes)

    // Add a 30% buffer to the total bytes
    totalBytes = Math.round(totalBytes * 1.3);
    // console.log('totalBytes Rounded: ', totalBytes)
    

    let totalNEARAmount = (totalBytes * storageCostNEARPerByte)
    // console.log('totalNEARAmount BEFORE: ', totalNEARAmount)
    // Accounting for protocol storage for access keys
    // Magic numbers come from plotting SDK data against protocol data and finding the best fit 
    totalNEARAmount += (public_keys?.length || 0) * 0.005373134328 + 0.00376;
    // console.log('totalNEARAmount AFTER pk: ', totalNEARAmount.toString())

    // Multi use passwords need a little extra storage
    if (passwords_per_use) {
        totalNEARAmount += -0.00155 * ((config?.uses_per_key || 1) - 1) + 0.00285687;
        // console.log('totalNEARAmount AFTER pw per use conversion: ', totalNEARAmount.toString())
    }

    // Turns it into yocto
    return parseNearAmount(totalNEARAmount.toString());
}

/** Initiate the connection to the NEAR blockchain. @group Utility */
export const estimateRequiredDeposit = async ({
    near,
    depositPerUse,
    numKeys,
    usesPerKey,
    attachedGas,
    storage = parseNearAmount("0.034"),
    keyStorage = parseNearAmount("0.0065"),
    fcData,
    ftData,
}: {
	/** The NEAR connection instance used to interact with the chain. This can either the connection that the SDK uses from `getEnv` or a separate connection. */
    near: Near,
	/** How much yoctoNEAR each key will transfer upon use. */
    depositPerUse: string,
	/** How many keys are being added to the drop. */
    numKeys: number,
	/** How many uses each key has. */
    usesPerKey: number,
	/** How much Gas will be attached to each key's use. */
    attachedGas: number,
	/** The estimated storage costs (can be retrieved through `getStorageBase`). */
    storage?: string | null,
	/** How much storage an individual key uses. */
    keyStorage?: string | null,
	/** The FC data for the drop that is being created. */
    fcData?: FCData,
	/** The FT data for the drop that is being created. */
    ftData?: FTData,
}): Promise<string>  => {
    const numKeysBN: BN = new BN(numKeys.toString())
    const usesPerKeyBN: BN = new BN(usesPerKey.toString())
    
    let totalRequiredStorage = new BN(storage).add(new BN(keyStorage).mul(numKeysBN));
    // console.log('totalRequiredStorage: ', totalRequiredStorage.toString())            

    let actualAllowance = estimatePessimisticAllowance(attachedGas).mul(usesPerKeyBN);
    // console.log('actualAllowance: ', actualAllowance.toString())

    let totalAllowance: BN  = actualAllowance.mul(numKeysBN);
    // console.log('totalAllowance: ', totalAllowance.toString())

    let totalAccessKeyStorage: BN  = ACCESS_KEY_STORAGE.mul(numKeysBN);
    // console.log('totalAccessKeyStorage: ', totalAccessKeyStorage.toString())

    let {numNoneFcs, depositRequiredForFcDrops} = getNoneFcsAndDepositRequired(fcData, usesPerKey);

    let totalDeposits = new BN(depositPerUse).mul(new BN(usesPerKey - numNoneFcs)).mul(numKeysBN);
    // console.log('totalDeposits: ', totalDeposits.toString())

    let totalDepositsForFc = depositRequiredForFcDrops.mul(numKeysBN);

    // console.log('totalDepositsForFc: ', totalDepositsForFc.toString())

    let requiredDeposit: BN  = totalRequiredStorage
        .add(totalAllowance)
        .add(totalAccessKeyStorage)
        .add(totalDeposits)
        .add(totalDepositsForFc);
    
    // console.log('requiredDeposit B4 FT costs: ', requiredDeposit.toString())
    
    if (ftData?.contractId) {
        let extraFtCosts = await getFtCosts(near, numKeys, usesPerKey, ftData?.contractId);
        requiredDeposit = requiredDeposit.add(new BN(extraFtCosts));

        // console.log('requiredDeposit AFTER FT costs: ', requiredDeposit.toString())
    }


    return requiredDeposit.toString() || "0";
};

// Estimate the amount of allowance required for a given attached gas.
const estimatePessimisticAllowance = (attachedGas: number): BN => {
    if (typeof attachedGas !== 'number') attachedGas = parseInt(attachedGas)
    // Get the number of CCCs you can make with the attached GAS
    let numCCCs = Math.floor(attachedGas / GAS_PER_CCC);
    // console.log('numCCCs: ', numCCCs)
    // Get the constant used to pessimistically calculate the required allowance
    let powOutcome = Math.pow(1.03, numCCCs);
    // console.log('powOutcome: ', powOutcome)

    let requiredGas = (attachedGas + RECEIPT_GAS_COST) * powOutcome + RECEIPT_GAS_COST;
    // console.log('requiredGas: ', requiredGas)
    let requiredAllowance: BN = new BN(requiredGas).mul(new BN(YOCTO_PER_GAS));
    // console.log('requiredAllowance: ', requiredAllowance.toString())
    return requiredAllowance;
};

// Estimate the amount of allowance required for a given attached gas.
const getNoneFcsAndDepositRequired = (fcData: FCData | undefined, usesPerKey: number) => {
    let depositRequiredForFcDrops = new BN(0);
    let numNoneFcs = 0;
    if (!fcData || Object.keys(fcData).length === 0) {
        return {numNoneFcs, depositRequiredForFcDrops};
    }

    let numMethodData = fcData.methods.length;

    // If there's one method data specified and more than 1 claim per key, that data is to be used
    // For all the claims. In this case, we need to tally all the deposits for each method in all method data.
    if (usesPerKey > 1 && numMethodData == 1) {
        let methodData = fcData.methods[0];

        // Keep track of the total attached deposit across all methods in the method data
        let attachedDeposit = new BN(0);
        for (let i = 0; i < (methodData?.length || 0); i++) {
            attachedDeposit = attachedDeposit.add(new BN(methodData![i].attachedDeposit));
        }

        depositRequiredForFcDrops = depositRequiredForFcDrops.add(new BN(attachedDeposit)).mul(new BN(usesPerKey));

        return {
            numNoneFcs,
            depositRequiredForFcDrops,
        }
    }
    // In the case where either there's 1 claim per key or the number of FCs is not 1,
    // We can simply loop through and manually get this data
    for (let i = 0; i < numMethodData; i++) {
        let methodData = fcData.methods[i];
        let isNoneFc = methodData == null;
        numNoneFcs += isNoneFc ? 1 : 0;

        if (!isNoneFc) {
            // Keep track of the total attached deposit across all methods in the method data
            let attachedDeposit = new BN(0);
            for (let j = 0; j < (methodData?.length || 0); j++) {
                attachedDeposit = attachedDeposit.add(new BN(methodData![j].attachedDeposit));
            }

            depositRequiredForFcDrops = depositRequiredForFcDrops.add(attachedDeposit);
        }
    }

    return {
        numNoneFcs,
        depositRequiredForFcDrops,
    } 
};

// Estimate the amount of allowance required for a given attached gas.
const getFtCosts = async (near: Near, numKeys: number, usesPerKey: number, ftContract: string): Promise<string> => {
    const viewAccount = await near.account("foo");
    const {min} = await viewAccount.viewFunction(ftContract, "storage_balance_bounds", {}); 
    // console.log('storageBalanceBounds: ', storageBalanceBounds)
    let costs: BN = new BN(min).mul(new BN(numKeys)).mul(new BN(usesPerKey)).add(new BN(min));
    // console.log('costs: ', costs.toString());
    return costs.toString() || "0";
};

/**
 * Generate passwords for a set of public keys. A unique password will be created for each specified use of a public key where the use is NOT zero indexed (i.e 1st use = 1).
 * The passwords will be generated via a double hash of the base password + public key + specific use
 * 
 * @param {string[]} publicKeys The public keys that will be used to generate the set of passwords
 * @param {string[]} uses An array of numbers that dictate which uses should be password protected. The 1st use of a key is 1 (NOT zero indexed).
 * @param {string=} basePassword All the passwords will be generated from this base password. It will be double hashed with the public key.
 * 
 * @returns {Promise<Array<Array<PasswordPerUse>>>} An array of objects for each key where each object has a password and maps it to its specific key use.
 * @group Utility
 */
export async function generatePerUsePasswords({
    publicKeys,
    uses,
    basePassword
}: {publicKeys: string[], uses: number[], basePassword: string}): Promise<Array<Array<PasswordPerUse>>> {
    let passwords: Array<Array<PasswordPerUse>> = [];
    
    // Loop through each pubKey to generate either the passwords
    for (var i = 0; i < publicKeys.length; i++) {
        
        // For each public key, we need to generate a password for each use
        let passwordsPerUse: Array<{ pw: string; key_use: number }> = [];
        for (var j = 0; j < uses.length; j++) {
            // First inner hash takes in utf8 and returns hash
            let innerHashBuff = await hashBuf(basePassword + publicKeys[i] + uses[j].toString());
            let innerHash = Buffer.from(innerHashBuff).toString('hex');

            // Outer hash takes in hex and returns hex
            let outerHashBuff = await hashBuf(innerHash, true);
            let outerHash = Buffer.from(outerHashBuff).toString('hex');

            let jsonPw = {
                pw: outerHash,
                key_use: uses[j]
            }
            passwordsPerUse.push(jsonPw);
        }
        passwords.push(passwordsPerUse);
    }

    return passwords;
}

// Taken from https://stackoverflow.com/a/61375162/16441367
export const snakeToCamel = str =>
  str.toLowerCase().replace(/([-_][a-z])/g, group =>
    group
      .toUpperCase()
      .replace('-', '')
      .replace('_', '')
  );
  

// Taken from https://stackoverflow.com/a/26215431/16441367
export const toCamel = o => {
	var newO, origKey, newKey, value
	if (o instanceof Array) {
	  return o.map(function(value) {
		  if (typeof value === "object") {
			value = toCamel(value)
		  }
		  return value
	  })
	} else {
	  newO = {}
	  for (origKey in o) {
		if (o.hasOwnProperty(origKey)) {
		  newKey = snakeToCamel(origKey);
		  value = o[origKey]
		  if (value instanceof Array || (value !== null && value.constructor === Object)) {
			value = toCamel(value)
		  }
		  newO[newKey] = value
		}
	  }
	}
	return newO
}