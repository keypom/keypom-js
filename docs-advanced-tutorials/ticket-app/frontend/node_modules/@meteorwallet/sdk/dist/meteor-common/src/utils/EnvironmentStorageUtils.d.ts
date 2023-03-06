interface IStateAdapter {
    getString: (key: string) => Promise<string | null | undefined>;
    setString: (key: string, value: string) => Promise<void>;
}
export interface IStorageKeyGetterAndSetter<T> {
    get: () => Promise<T | undefined>;
    set: (value: T) => Promise<void>;
}
export declare class EnvironmentStateAdapter {
    private implementation;
    constructor(implementation: IStateAdapter);
    setJson(key: string, value: any): Promise<void>;
    getJson<T>(key: string): Promise<T | undefined>;
    setString(key: string, value: string): Promise<void>;
    getString(key: string): Promise<string | undefined>;
    createJsonGetterSetter<T>(key: string): IStorageKeyGetterAndSetter<T>;
    createStringGetterSetter(key: string): IStorageKeyGetterAndSetter<string>;
}
interface IStateAdapter_Sync {
    getString: (key: string) => string | null | undefined;
    setString: (key: string, value: string) => void;
    clear: (key: string) => void;
}
export interface IStorageKeyGetterAndSetter_Sync<T> {
    get: () => T | undefined;
    set: (value: T) => void;
}
export declare class EnvironmentStateAdapter_Sync {
    private implementation;
    constructor(implementation: IStateAdapter_Sync);
    setJson(key: string, value: any): void;
    getJson<T>(key: string): T | undefined;
    setString(key: string, value: string): void;
    getString(key: string): string | undefined;
    clear(key: string): void;
    createJsonGetterSetter<T>(key: string): IStorageKeyGetterAndSetter_Sync<T>;
    createStringGetterSetter(key: string): IStorageKeyGetterAndSetter_Sync<string>;
}
export {};
