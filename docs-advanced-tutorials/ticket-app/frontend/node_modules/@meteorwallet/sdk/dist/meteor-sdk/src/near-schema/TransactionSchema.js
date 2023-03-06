"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SCHEMA = void 0;
// import { Enum, Assignable } from "./utils/enums";
// import {
//   AccessKey,
//   AccessKeyPermission,
//   Action,
//   AddKey,
//   CreateAccount,
//   DeleteAccount,
//   DeleteKey,
//   DeployContract,
//   FullAccessPermission,
//   FunctionCall,
//   FunctionCallPermission,
//   Signature,
//   SignedTransaction,
//   Stake,
//   Transaction,
//   Transfer,
// } from "near-api-js/lib/transaction";
const near_api_js_1 = require("near-api-js");
// import { PublicKey } from "near-api-js/lib/utils";
// export class IAction extends Assignable {}
exports.SCHEMA = new Map([
    [
        near_api_js_1.transactions.Signature,
        {
            kind: "struct",
            fields: [
                ["keyType", "u8"],
                ["data", [64]],
            ],
        },
    ],
    [
        near_api_js_1.transactions.SignedTransaction,
        {
            kind: "struct",
            fields: [
                ["transaction", near_api_js_1.transactions.Transaction],
                ["signature", near_api_js_1.transactions.Signature],
            ],
        },
    ],
    [
        near_api_js_1.transactions.Transaction,
        {
            kind: "struct",
            fields: [
                ["signerId", "string"],
                ["publicKey", near_api_js_1.utils.PublicKey],
                ["nonce", "u64"],
                ["receiverId", "string"],
                ["blockHash", [32]],
                ["actions", [near_api_js_1.transactions.Action]],
            ],
        },
    ],
    [
        near_api_js_1.utils.PublicKey,
        {
            kind: "struct",
            fields: [
                ["keyType", "u8"],
                ["data", [32]],
            ],
        },
    ],
    [
        near_api_js_1.transactions.AccessKey,
        {
            kind: "struct",
            fields: [
                ["nonce", "u64"],
                ["permission", near_api_js_1.transactions.AccessKeyPermission],
            ],
        },
    ],
    [
        near_api_js_1.transactions.AccessKeyPermission,
        {
            kind: "enum",
            field: "enum",
            values: [
                ["functionCall", near_api_js_1.transactions.FunctionCallPermission],
                ["fullAccess", near_api_js_1.transactions.FullAccessPermission],
            ],
        },
    ],
    [
        near_api_js_1.transactions.FunctionCallPermission,
        {
            kind: "struct",
            fields: [
                ["allowance", { kind: "option", type: "u128" }],
                ["receiverId", "string"],
                ["methodNames", ["string"]],
            ],
        },
    ],
    [near_api_js_1.transactions.FullAccessPermission, { kind: "struct", fields: [] }],
    [
        near_api_js_1.transactions.Action,
        {
            kind: "enum",
            field: "enum",
            values: [
                ["createAccount", near_api_js_1.transactions.CreateAccount],
                ["deployContract", near_api_js_1.transactions.DeployContract],
                ["functionCall", near_api_js_1.transactions.FunctionCall],
                ["transfer", near_api_js_1.transactions.Transfer],
                ["stake", near_api_js_1.transactions.Stake],
                ["addKey", near_api_js_1.transactions.AddKey],
                ["deleteKey", near_api_js_1.transactions.DeleteKey],
                ["deleteAccount", near_api_js_1.transactions.DeleteAccount],
            ],
        },
    ],
    [near_api_js_1.transactions.CreateAccount, { kind: "struct", fields: [] }],
    [
        near_api_js_1.transactions.DeployContract,
        {
            kind: "struct",
            fields: [["code", ["u8"]]],
        },
    ],
    [
        near_api_js_1.transactions.FunctionCall,
        {
            kind: "struct",
            fields: [
                ["methodName", "string"],
                ["args", ["u8"]],
                ["gas", "u64"],
                ["deposit", "u128"],
            ],
        },
    ],
    [
        near_api_js_1.transactions.Transfer,
        {
            kind: "struct",
            fields: [["deposit", "u128"]],
        },
    ],
    [
        near_api_js_1.transactions.Stake,
        {
            kind: "struct",
            fields: [
                ["stake", "u128"],
                ["publicKey", near_api_js_1.utils.PublicKey],
            ],
        },
    ],
    [
        near_api_js_1.transactions.AddKey,
        {
            kind: "struct",
            fields: [
                ["publicKey", near_api_js_1.utils.PublicKey],
                ["accessKey", near_api_js_1.transactions.AccessKey],
            ],
        },
    ],
    [
        near_api_js_1.transactions.DeleteKey,
        {
            kind: "struct",
            fields: [["publicKey", near_api_js_1.utils.PublicKey]],
        },
    ],
    [
        near_api_js_1.transactions.DeleteAccount,
        {
            kind: "struct",
            fields: [["beneficiaryId", "string"]],
        },
    ],
]);
//# sourceMappingURL=TransactionSchema.js.map