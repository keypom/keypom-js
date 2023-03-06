interface IEnvConfig {
    wallet_base_url: string;
}
export declare const envConfig: IEnvConfig;
export declare function setEnvConfig(config: Partial<IEnvConfig>): void;
export {};
