"use strict";
// import BN from "bn.js";
// import { KeyPair, KeyPairEd25519, PublicKey } from "@near-js/crypto";
// import { Account } from "@near-js/accounts";
// import {decode } from "bs58"
// import {
//     actionCreators,
//     Action, 
//     CreateAccount,
//     Transaction,
//     stringifyJsonOrBytes,
//     createTransaction,
// } from "@near-js/transactions"
// import { Transaction as wsTransaction } from "@near-wallet-selector/core";
// import { Action as wsAction } from "@near-wallet-selector/core";
// import * as najTransactions from "near-api-js/lib/transaction";
// import { AddKeyPermission } from "@near-wallet-selector/core";
// let sha256Hash;
// // @ts-ignore
// if (typeof crypto === "undefined") {
//     const nodeCrypto = require("crypto");
//     sha256Hash = (ab) => nodeCrypto.createHash("sha256").update(ab).digest();
// } else {
//     // @ts-ignore
//     sha256Hash = (ab) => crypto.subtle.digest("SHA-256", ab);
// }
// /// How much Gas each each cross contract call with cost to be converted to a receipt
// const GAS_PER_CCC = 5000000000000; // 5 TGas
// const RECEIPT_GAS_COST = 2500000000000; // 2.5 TGas
// const YOCTO_PER_GAS = 100000000; // 100 million
// export const ATTACHED_GAS_FROM_WALLET = 100000000000000; // 100 TGas
// /// How much yoctoNEAR it costs to store 1 access key
// const ACCESS_KEY_STORAGE: BN = new BN("1000000000000000000000");
// export const key2str = (v) => (typeof v === "string" ? v : v.pk);
// const hashBuf = (str: string, fromHex = false): Promise<ArrayBuffer> =>
//     sha256Hash(Buffer.from(str, fromHex ? "hex" : "utf8"));
//     export const baseDecode = (
//         value: string
//     ) => {
//         return new Uint8Array(decode(value));
//     }
//     export const transformTransactions = async (
//         transactions: wsTransaction[],
//         account: Account
//       ) => {
//         const { networkId, signer, provider } = account.connection;
//         console.log("utils signer: ", signer)
//         return Promise.all(
//           transactions.map(async (transaction, index) => {
//             const actions = transaction.actions.map((action) =>
//               createAction(action)
//             );
//             const accessKey = await account.findAccessKey(
//               transaction.receiverId,
//               actions,
//             );    
//             if (!accessKey) {
//               throw new Error(
//                 `Failed to find matching key for transaction sent to ${transaction.receiverId}`
//               );
//             }
//             const block = await provider.block({ finality: "final" });
//             return createTransaction(
//               account.accountId,
//               PublicKey.from(accessKey.publicKey),
//               transaction.receiverId,
//               accessKey.accessKey.nonce + BigInt(index) + BigInt(1),
//               actions,
//               baseDecode(block.header.hash)
//             );
//           })
//         );
//       };
//       export const createAction = (action: wsAction) => {
//         switch (action.type) {
//           case "CreateAccount" :
//             return najTransactions.createAccount();
//           case "DeployContract": {
//             const { code } = action.params;
//             return najTransactions.deployContract(code);
//           }
//           case "FunctionCall": {
//             const { methodName, args, gas, deposit } = action.params;
//             return najTransactions.functionCall(
//               methodName,
//               args,
//               new BN(gas),
//               new BN(deposit)
//             );
//           }
//           case "Transfer": {
//             const { deposit } = action.params;
//             return najTransactions.transfer(new BN(deposit));
//           }
//           case "Stake": {
//             const { stake, publicKey } = action.params;
//             return najTransactions.stake(new BN(stake), PublicKey.from(publicKey));
//           }
//           case "AddKey": {
//             const { publicKey, accessKey } = action.params;
//             return najTransactions.addKey(
//               PublicKey.from(publicKey),
//               // TODO: Use accessKey.nonce? near-api-js seems to think 0 is fine?
//               getAccessKey(accessKey.permission)
//             );
//           }
//           case "DeleteKey": {
//             const { publicKey } = action.params;
//             return najTransactions.deleteKey(PublicKey.from(publicKey));
//           }
//           case "DeleteAccount": {
//             const { beneficiaryId } = action.params
//             return najTransactions.deleteAccount(beneficiaryId);
//           }
//           default:
//             throw new Error("Invalid action type");
//         }
//       };
//       const getAccessKey = (permission: AddKeyPermission) => {
//         if (permission === "FullAccess") {
//           return najTransactions.fullAccessKey();
//         }
//         const { receiverId, methodNames = [] } = permission;
//         const allowance = permission.allowance
//           ? new BN(permission.allowance)
//           : undefined;
//         return najTransactions.functionCallAccessKey(receiverId, methodNames, allowance);
//       };
// // export const createPooAction = (action: wsAction): Action => {
// //     if (action.createAccount) {
// //         return actionCreators.createAccount();
// //     }
// //     if (action.deployContract) {
// //         const { code } = action.deployContract;
// //         return actionCreators.deployContract(code);
// //     }
// //     if (action.functionCall) {
// //         const { methodName, args, gas, deposit } = action.functionCall;
// //         return actionCreators.functionCall(
// //             methodName,
// //             args,
// //             new BN(gas),
// //             new BN(deposit)
// //         );
// //     }
// //     if (action.transfer) {
// //         const { deposit } = action.transfer;
// //         return actionCreators.transfer(new BN(deposit));
// //     }
// //     if (action.stake) {
// //         const { stake, publicKey } = action.stake;
// //         return actionCreators.stake(new BN(stake), PublicKey.from(publicKey));
// //     }
// //     if (action.deleteKey) {
// //         const { publicKey } = action.deleteKey;
// //         return actionCreators.deleteKey(PublicKey.from(publicKey));
// //     }
// //     if (action.deleteAccount) {
// //         const { beneficiaryId } = action.deleteAccount;
// //         return actionCreators.deleteAccount(beneficiaryId);
// //     }
// //     throw new Error("Unknown action");
// // };
