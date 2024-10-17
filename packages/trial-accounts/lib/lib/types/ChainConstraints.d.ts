export type ExtChainConstraints = {
    NEAR: NEARConstraints;
} | {
    EVM: ExtEVMConstraints;
};
export interface NEARConstraints {
    allowedMethods: string[];
    allowedContracts: string[];
    maxGas: string | null;
    maxDeposit: string | null;
}
export interface ExtEVMConstraints {
    chainId: number;
    allowedMethods: string[];
    allowedContracts: string[];
    maxGas: number | null;
    maxValue: string | null;
}
