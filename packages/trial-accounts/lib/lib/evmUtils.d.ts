import { JsonRpcProvider, VoidSigner } from "ethers";
import { ActionToPerform } from "./types";
import { SerializableParam, SerializableToken } from "./types/EVMTypes";
export declare function esimateGasParams(provider: JsonRpcProvider, signer: VoidSigner, actionToPerform: ActionToPerform): Promise<{
    nonce: number;
    gasLimit: bigint;
    maxFeePerGas: bigint;
    maxPriorityFeePerGas: bigint;
}>;
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
