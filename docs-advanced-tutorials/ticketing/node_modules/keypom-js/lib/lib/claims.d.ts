import { Maybe } from "./keypom";
/**
 * Allows a specific Keypom drop to be claimed via the secret key.
 *
 * @example
 * Creating a simple $NEAR drop and claiming to an existing account:
 * ```js
 * // Initialize the SDK for the given network and NEAR connection
 * await initKeypom({
 * 	network: "testnet",
 * 	funder: {
 * 		accountId: "benji_demo.testnet",
 * 		secretKey: "ed25519:5yARProkcALbxaSQ66aYZMSBPWL9uPBmkoQGjV3oi2ddQDMh1teMAbz7jqNV9oVyMy7kZNREjYvWPqjcA6LW9Jb1"
 * 	}
 * });
 *
 * // create 1 keys with no entropy (random key)
 * const {publicKeys, secretKeys} = await generateKeys({
 * 	numKeys: 1
 * });
 *
 * // Create a simple drop with 1 $NEAR
 * await createDrop({
 * 	publicKeys,
 * 	depositPerUseNEAR: 1,
 * });
 *
 * // Claim the drop to the passed in account ID
 * await claim({
 * 	secretKey: secretKeys[0],
 * 	accountId: "benjiman.testnet"
 * })
 * ```
 *
 * @example
 * Creating a simple $NEAR drop and using it to create a brand new NEAR account:
 * ```js
 * // Initialize the SDK for the given network and NEAR connection
 * await initKeypom({
 * 	network: "testnet",
 * 	funder: {
 * 		accountId: "benji_demo.testnet",
 * 		secretKey: "ed25519:5yARProkcALbxaSQ66aYZMSBPWL9uPBmkoQGjV3oi2ddQDMh1teMAbz7jqNV9oVyMy7kZNREjYvWPqjcA6LW9Jb1"
 * 	}
 * });
 *
 * // create 2 keys with no entropy (all random). The first will be used for the drop and the second
 * // will be used as the full access key for the newly created account
 * const {publicKeys, secretKeys} = await generateKeys({
 * 	numKeys: 2
 * });
 *
 * // Create a simple drop with 1 $NEAR
 * await createDrop({
 * 	publicKeys: [publicKeys[0]],
 * 	depositPerUseNEAR: 1,
 * });
 *
 * // Claim the drop and create a new account
 * await claim({
 * 	secretKey: secretKeys[0],
 * 	newAccountId: "my-newly-creating-account.testnet",
 * 	newPublicKey: publicKeys[1]
 * })
 * ```
 *
 * @example
 * Creating a drop and adding a password to it. Generate the password using the hash function and pass it into claim the drop:
 * ```js
 * // Initialize the SDK for the given network and NEAR connection
 * await initKeypom({
 * 	network: "testnet",
 * 	funder: {
 * 		accountId: "benji_demo.testnet",
 * 		secretKey: "ed25519:5yARProkcALbxaSQ66aYZMSBPWL9uPBmkoQGjV3oi2ddQDMh1teMAbz7jqNV9oVyMy7kZNREjYvWPqjcA6LW9Jb1"
 * 	}
 * });
 *
 *
 * const basePassword = "my-cool-password123";
 * // Create a simple drop with 1 $NEAR and pass in a base password to create a unique password for each use of each key
 * const {keys} = await createDrop({
 * 	numKeys: 1,
 * 	depositPerUseNEAR: 1,
 * 	basePassword
 * });
 *
 * // Create the password to pass into claim which is a hash of the basePassword, public key and whichever use we are on
 * let currentUse = 1;
 * let passwordForClaim = await hashPassword(basePassword + keys.publicKeys[0] + currentUse.toString());
 *
 * // Claim the drop to the passed in account ID and use the password we generated above.
 * await claim({
 * 	secretKey: keys.secretKeys[0],
 * 	accountId: "benjiman.testnet",
 * 	password: passwordForClaim
 * })
 * ```
 * @group Creating, And Claiming Drops
*/
export declare const claim: ({ secretKey, accountId, newAccountId, newPublicKey, password, fcArgs }: {
    /** The private key associated with the Keypom link. This can either contain the `ed25519:` prefix or not. */
    secretKey: string;
    /** The account ID of an existing account that will be used to claim the drop. */
    accountId?: string | undefined;
    /** If passed in, a new account ID will be created and the drop will be claimed to that account. This must be an account that does not exist yet. */
    newAccountId?: string | undefined;
    /** If creating a new account, a public key must be passed in to be used as the full access key for the newly created account. */
    newPublicKey?: string | undefined;
    /** If a password is required to use the key, it can be passed in */
    password?: string | undefined;
    /** For FC drops, if `user_args_rule` is set by the funder, when claiming, custom arguments can be passed into the function. The number of args in the array need to match the number of methods being executed. */
    fcArgs?: Maybe<string>[] | undefined;
}) => Promise<any>;
