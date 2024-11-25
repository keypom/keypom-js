export interface NearPayload {
    contract_id: string;
    method_name: string;
    args: number[];
    gas: string;
    deposit: string;
    nonce: string;
}
