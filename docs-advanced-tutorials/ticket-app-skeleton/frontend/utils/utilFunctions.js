const { initKeypom, createDrop, createNFTSeries, addToBalance, getEnv, claim, getKeyInformation, hashPassword, formatLinkdropUrl, getPubFromSecret } = require("keypom-js");
const { KeyPair, keyStores, connect } = require("near-api-js");
const { parseNearAmount } = require("near-api-js/lib/utils/format");
const path = require("path");
const homedir = require("os").homedir();
var assert = require('assert');

async function hostClaim({privKey, basePassword=""}){
  
}

module.exports = {
    hostClaim
}