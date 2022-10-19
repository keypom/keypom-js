export namespace simpleDrop {
    export { FUNDING_ACCOUNT_ID };
    export { NETWORK_ID };
    export { DEPOSIT_PER_USE };
    export { NUM_KEYS };
    export { DROP_CONFIG };
    export { DROP_METADATA };
    export { KEYPOM_CONTRACT };
    export { STORAGE_REQUIRED };
}
declare const FUNDING_ACCOUNT_ID: "benjiman.testnet";
declare const NETWORK_ID: "testnet";
declare const DEPOSIT_PER_USE: string | null;
declare const NUM_KEYS: 1;
declare namespace DROP_CONFIG {
    const uses_per_key: number;
    const delete_on_empty: boolean;
    const auto_withdraw: boolean;
    const start_timestamp: null;
    const throttle_timestamp: null;
    const on_claim_refund_deposit: null;
    const claim_permission: null;
    const drop_root: null;
}
declare const DROP_METADATA: "";
declare const KEYPOM_CONTRACT: "v1.keypom.testnet";
declare const STORAGE_REQUIRED: string | null;
export {};
