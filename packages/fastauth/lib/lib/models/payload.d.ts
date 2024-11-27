export interface NearPayload {
    action: NearAction;
    nonce: string;
}
type NearAction = {
    FunctionCall: {
        contract_id: string;
        method_name: string;
        args: number[];
        gas: string;
        deposit: string;
    };
} | {
    Transfer: {
        receiver_id: string;
        amount: string;
    };
};
export {};
