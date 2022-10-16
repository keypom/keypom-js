export function autoSignIn(): Promise<void>;
export function initConnection(network: any, logFn: any): void;
export function getAccount(): Promise<{
    accountId: any;
}>;
export function signIn(): Promise<any>;
export function signOut(): void;
export function signAndSendTransactions({ transactions }: {
    transactions: any;
}): Promise<any>;
