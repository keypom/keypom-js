import { SerializableParam, SerializableToken } from "./types/EVMTypes";
/**
 * Converts method name and arguments into SerializableParam[] and SerializableToken[].
 * @param methodName - The name of the method.
 * @param args - The arguments to the method.
 * @param abi - The ABI of the contract.
 * @returns An object containing methodParams and args in the required formats.
 */
export declare function encodeMethodParams(methodName: string, args: any[] | Record<string, any>, abi: any[]): {
    methodParams: SerializableParam[];
    args: SerializableToken[];
};
