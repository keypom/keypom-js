const { BN } = require("bn.js");
const { parseNearAmount, formatNearAmount } = require("near-api-js/lib/utils/format");
const { connect, KeyPair, keyStores, utils } = require("near-api-js");
const path = require("path");
const homedir = require("os").homedir();

/// How much Gas each each cross contract call with cost to be converted to a receipt
const GAS_PER_CCC = 5000000000000; // 5 TGas
const RECEIPT_GAS_COST = 2500000000000; // 2.5 TGas
const YOCTO_PER_GAS = 100000000; // 100 million
const ATTACHED_GAS_FROM_WALLET = 100000000000000; // 100 TGas

/// How much yoctoNEAR it costs to store 1 access key
const ACCESS_KEY_STORAGE = new BN("1000000000000000000000");

// Estimate the amount of allowance required for a given attached gas.
const getRecentDropId = async (fundingAccountObject, accountId, keypomContract) => {
    let dropSupplyForOwner = await fundingAccountObject.viewFunction(keypomContract, 'get_drop_supply_for_owner', {account_id: accountId});
	console.log('dropSupplyForOwner: ', dropSupplyForOwner)
	let dropsForOwner = await fundingAccountObject.viewFunction(keypomContract, 'get_drops_for_owner', { account_id: accountId, from_index: (dropSupplyForOwner - 1).toString() });
	console.log('dropsForOwner: ', dropsForOwner)

    return dropsForOwner[dropsForOwner.length - 1].drop_id;
};

module.exports = {
    getRecentDropId,
};