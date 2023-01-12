export type NearKeyPair = KeyPair

export interface GeneratedKeyPairs {
	keyPairs: NearKeyPair[];
	publicKeys: string[];
	secretKeys: string[];
}

export interface NearAccount {
	accountId: string;
	signAndSendTransaction: () => {};
}

export interface Network {
	networkId: string;
	nodeUrl: string;
	helperUrl: string;
	explorerUrl: string;
}

export interface Funder {
	accountId: string;
	secretKey: string;
	seedPhrase?: string;
	rootEntropy?: string;
	fundingKeyPair?: NearKeyPair;
}

export interface EnvVars {
	near?: Near,
	connection?: Connection,
	keyStore?: KeyStore,
	logger?:  any,
	networkId?: string,
	fundingAccount?: Account,
	fundingAccountDetails?: Funder,
	contractAccount?: Account,
	viewAccount?: any,
	gas: string,
	gas300: string,
	attachedGas: string,
	contractId: string,
	receiverId: string,
	getAccount: any
	execute: any
}