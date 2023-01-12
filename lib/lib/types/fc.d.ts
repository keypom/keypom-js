import { Maybe } from "../keypom";
export interface Method {
    receiverId: string;
    methodName: string;
    args: string;
    attachedDeposit: string;
    accountIdField: string;
    dropIdField: string;
}
export interface FCConfig {
    attachedGas?: string;
}
export interface FCData {
    methods: Array<Maybe<Array<Method>>>;
    config?: FCConfig;
}
