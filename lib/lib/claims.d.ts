/**
 * Allows a specific Keypom drop to be claimed via the secret key.
 *
 * @param {string} secretKey The private key associated with the Keypom link. This can either contain the `ed25519:` prefix or not.
 * @param {string=} accountId (OPTIONAL) The account ID of an existing account that will be used to claim the drop.
 * @param {string=} newAccountId (OPTIONAL) If passed in, a new account ID will be created and the drop will be claimed to that account. This must be an account that does not exist yet.
 * @param {string=} newPublicKey (OPTIONAL) If creating a new account, a public key must be passed in to be used as the full access key for the newly created account.
 *
 * @example <caption>Creating a simple $NEAR drop and claiming to an existing account</caption>
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
 * @example <caption>Creating a simple $NEAR drop and using it to create a brand new NEAR account</caption>
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
*/
export declare const claim: ({ secretKey, accountId, newAccountId, newPublicKey, password, }: {
    secretKey: any;
    accountId: any;
    newAccountId: any;
    newPublicKey: any;
    password: any;
}) => Promise<any>;
