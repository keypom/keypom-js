"use strict";
// utils.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAccount = exports.sendTransaction = exports.toSnakeCase = exports.initNear = void 0;
const wallet_account_1 = require("@near-js/wallet-account");
const transactions_1 = require("@near-js/transactions");
const utils_1 = require("@near-js/utils");
const crypto_1 = require("@near-js/crypto");
/**
 * Initializes a NEAR connection using the provided configuration.
 *
 * @param config - The configuration object containing network ID, key store, etc.
 * @returns A Promise that resolves to a Near instance.
 */
async function initNear(config) {
    const nearConfig = {
        networkId: config.networkId,
        nodeUrl: `https://rpc.${config.networkId}.near.org`,
        keyStore: config.keyStore,
    };
    const near = new wallet_account_1.Near(nearConfig);
    return near;
}
exports.initNear = initNear;
/**
 * Converts an object's keys from camelCase to snake_case recursively.
 *
 * @param obj - The object to be converted.
 * @returns The new object with snake_case keys.
 */
function toSnakeCase(obj) {
    if (Array.isArray(obj)) {
        return obj.map((item) => toSnakeCase(item));
    }
    else if (obj && typeof obj === "object" && obj.constructor === Object) {
        return Object.keys(obj).reduce((acc, key) => {
            const snakeKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
            acc[snakeKey] = toSnakeCase(obj[key]);
            return acc;
        }, {});
    }
    return obj;
}
exports.toSnakeCase = toSnakeCase;
async function sendTransaction({ signerAccount, receiverId, methodName, args, deposit, gas, }) {
    const serializedArgsBuffer = Buffer.from(JSON.stringify(args));
    const serializedArgs = new Uint8Array(serializedArgsBuffer);
    let actions = [];
    actions.push(transactions_1.actionCreators.functionCall(methodName, serializedArgs, BigInt(gas), BigInt((0, utils_1.parseNearAmount)(deposit))));
    const result = await signerAccount.signAndSendTransaction({
        receiverId: receiverId,
        actions,
    });
    return result;
}
exports.sendTransaction = sendTransaction;
async function createAccount({ signerAccount, newAccountId, amount, config, }) {
    const keyPair = crypto_1.KeyPair.fromRandom("ed25519");
    const publicKey = keyPair.getPublicKey().toString();
    await config.keyStore.setKey(config.networkId, newAccountId, keyPair);
    await signerAccount.functionCall({
        contractId: config.networkId === "testnet" ? "testnet" : "near",
        methodName: "create_account",
        args: {
            new_account_id: newAccountId,
            new_public_key: publicKey,
        },
        gas: BigInt("300000000000000"),
        attachedDeposit: BigInt((0, utils_1.parseNearAmount)(amount)),
    });
    return keyPair.toString();
}
exports.createAccount = createAccount;
