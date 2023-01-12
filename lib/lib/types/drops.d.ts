export interface DropConfig {
    usesPerKey?: number;
    time?: TimeConfig;
    usage?: UsageConfig;
    dropRoot?: string;
}
export interface TimeConfig {
    start?: number;
    end?: number;
    throttle?: number;
    interval?: number;
}
export interface UsageConfig {
    permissions?: string;
    refundDeposit?: boolean;
    autoDeleteDrop?: boolean;
    autoWithdraw?: boolean;
}
