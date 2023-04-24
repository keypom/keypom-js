const { initKeypom, createDrop, createNFTSeries, addToBalance, getEnv, claim, getKeyInformation, hashPassword, formatLinkdropUrl } = require("keypom-js");
const { KeyPair, keyStores, connect } = require("near-api-js");
const { parseNearAmount } = require("near-api-js/lib/utils/format");
const path = require("path");
const homedir = require("os").homedir();
var assert = require('assert');
const { createTickDrop } = require("./createTickDrop");
const { allowEntry } = require("./allowEntry");

async function wrongPasswordCheck() {
}

async function doubleClaimCheck() {
}

async function tests() {
    await wrongPasswordCheck();
    await doubleClaimCheck();
}

tests()

