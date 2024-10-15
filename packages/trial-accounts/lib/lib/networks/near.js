"use strict";
// networks/utils.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTransaction = void 0;
const transactions_1 = require("@near-js/transactions");
const utils_1 = require("@near-js/utils");
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
