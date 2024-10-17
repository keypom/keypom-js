"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeMethodParams = void 0;
const ethers_1 = require("ethers");
/**
 * Converts method name and arguments into SerializableParam[] and SerializableToken[].
 * @param methodName - The name of the method.
 * @param args - The arguments to the method.
 * @param abi - The ABI of the contract.
 * @returns An object containing methodParams and args in the required formats.
 */
function encodeMethodParams(methodName, args, abi) {
    // Find the ABI entry for the method
    const iface = new ethers_1.Interface(abi);
    const fragment = iface.getFunction(methodName);
    if (!fragment) {
        throw new Error(`Method ${methodName} not found in ABI`);
    }
    // Get the inputs from the ABI
    const inputs = fragment.inputs;
    // Convert inputs to SerializableParam[]
    const methodParams = inputs.map((input) => {
        return {
            name: input.name,
            kind: convertParamTypeToSerializableParamType(input.type),
        };
    });
    // Prepare the arguments
    let argValues;
    if (Array.isArray(args)) {
        argValues = args;
    }
    else {
        // If args is an object, convert it to an array in the order of inputs
        argValues = inputs.map((input) => {
            if (!(input.name in args)) {
                throw new Error(`Argument ${input.name} is missing`);
            }
            return args[input.name];
        });
    }
    // Convert argValues to SerializableToken[]
    const argsTokens = argValues.map((arg, index) => {
        const input = inputs[index];
        return convertValueToSerializableToken(input.type, arg);
    });
    return { methodParams, args: argsTokens };
}
exports.encodeMethodParams = encodeMethodParams;
/**
 * Converts a Solidity type string to a SerializableParamType.
 * @param type - The Solidity type string (e.g., 'uint256', 'address[]').
 * @returns The corresponding SerializableParamType.
 */
function convertParamTypeToSerializableParamType(type) {
    if (type === "address") {
        return { type: "Address" };
    }
    else if (type === "bytes") {
        return { type: "Bytes" };
    }
    else if (type.startsWith("uint")) {
        const value = parseInt(type.slice(4)) || 256;
        return { type: "Uint", value };
    }
    else if (type.startsWith("int")) {
        const value = parseInt(type.slice(3)) || 256;
        return { type: "Int", value };
    }
    else if (type === "bool") {
        return { type: "Bool" };
    }
    else if (type === "string") {
        return { type: "String" };
    }
    else if (type.endsWith("[]")) {
        const innerType = type.slice(0, -2);
        return {
            type: "Array",
            value: convertParamTypeToSerializableParamType(innerType),
        };
    }
    else if (type.startsWith("bytes") && type.length > 5) {
        const value = parseInt(type.slice(5));
        return { type: "FixedBytes", value };
    }
    else {
        throw new Error(`Unsupported type: ${type}`);
    }
}
/**
 * Converts a value to a SerializableToken based on the Solidity type.
 * @param type - The Solidity type string.
 * @param value - The value to convert.
 * @returns The corresponding SerializableToken.
 */
function convertValueToSerializableToken(type, value) {
    if (type === "address") {
        return { type: "Address", value: value };
    }
    else if (type === "bytes") {
        return { type: "Bytes", value: value };
    }
    else if (type.startsWith("uint")) {
        return { type: "Uint", value: value.toString() };
    }
    else if (type.startsWith("int")) {
        return { type: "Int", value: value.toString() };
    }
    else if (type === "bool") {
        return { type: "Bool", value: value };
    }
    else if (type === "string") {
        return { type: "String", value: value };
    }
    else if (type.endsWith("[]")) {
        const innerType = type.slice(0, -2);
        if (!Array.isArray(value)) {
            throw new Error(`Expected array for type ${type}`);
        }
        const items = value.map((item) => convertValueToSerializableToken(innerType, item));
        return { type: "Array", value: items };
    }
    else if (type.startsWith("bytes") && type.length > 5) {
        return { type: "FixedBytes", value: value };
    }
    else {
        throw new Error(`Unsupported type: ${type}`);
    }
}
