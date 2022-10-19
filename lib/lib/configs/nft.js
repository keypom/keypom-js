"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nftDrop = exports.NFT_METADATA = exports.NFT_CONTRACT_ID = void 0;
var parseNearAmount = require("near-api-js/lib/utils/format").parseNearAmount;
var KEYPOM_CONTRACT = "v1.keypom.testnet";
var FUNDING_ACCOUNT_ID = "benjiman.testnet";
var NETWORK_ID = "testnet";
var DEPOSIT_PER_USE = parseNearAmount("1");
var NUM_KEYS = 1;
exports.NFT_CONTRACT_ID = "nft.examples.testnet";
var STORAGE_REQUIRED = parseNearAmount('0.01');
exports.NFT_METADATA = {
    title: "Keypom FTW!",
    description: "Keypom is lit fam!",
    media: "https://bafkreidsht2pxoytl3d4zdnpsjmxedtk7dhuef2vmr3muz7si3vlthbcr4.ipfs.nftstorage.link",
};
var NFT_DATA = {
    // NFT Contract Id that the tokens will come from
    contract_id: exports.NFT_CONTRACT_ID,
    // Who will be sending the NFTs to the Keypom contract
    sender_id: FUNDING_ACCOUNT_ID,
};
var DROP_CONFIG = {
    // How many claims can each key have.
    uses_per_key: 1,
    // Should the drop be automatically deleted when all the keys are used? This is defaulted to false and
    // Must be overwritten
    delete_on_empty: true,
    // When this drop is deleted and it is the owner's *last* drop, automatically withdraw their balance.
    auto_withdraw: true,
    // Minimum block timestamp that keys can be used. If None, keys can be used immediately
    // Measured in number of non-leap-nanoseconds since January 1, 1970 0:00:00 UTC.
    start_timestamp: null,
    // How often can a key be used
    // Measured in number of non-leap-nanoseconds since January 1, 1970 0:00:00 UTC.
    throttle_timestamp: null,
    // If claim is called, refund the deposit to the owner's balance. If None, default to false.
    on_claim_refund_deposit: null,
    // Can the access key only call the claim method_name? Default to both method_name callable
    claim_permission: null,
    // Root account that all sub-accounts will default to. If None, default to the global drop root.
    drop_root: null,
};
var DROP_METADATA = "";
exports.nftDrop = {
    FUNDING_ACCOUNT_ID: FUNDING_ACCOUNT_ID,
    NETWORK_ID: NETWORK_ID,
    DEPOSIT_PER_USE: DEPOSIT_PER_USE,
    NUM_KEYS: NUM_KEYS,
    DROP_CONFIG: DROP_CONFIG,
    DROP_METADATA: DROP_METADATA,
    KEYPOM_CONTRACT: KEYPOM_CONTRACT,
    NFT_DATA: NFT_DATA,
    NFT_METADATA: exports.NFT_METADATA,
    STORAGE_REQUIRED: STORAGE_REQUIRED,
};
