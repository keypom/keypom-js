const { initKeypom, createDrop, createNFTSeries, addToBalance, getEnv, claim, getKeyInformation, hashPassword, formatLinkdropUrl } = require("keypom-js");
const { KeyPair, keyStores, connect } = require("near-api-js");
const { parseNearAmount } = require("near-api-js/lib/utils/format");
const path = require("path");
const homedir = require("os").homedir();
var assert = require('assert');
const { createTickDrop } = require("./createTickDrop");
const { allowEntry } = require("./allowEntry");

async function wrongPasswordCheck() {
    // Create Drop
    let keys = await createTickDrop();
    let privKey = keys.secretKeys[0];

    // Incorrect Password
    console.log("Claiming with wrong password...")
    let shouldAdmit = await allowEntry({
        privKey, 
        basePassword: "wrong-password"
    })
    assert(shouldAdmit === false, `Expected no admittance with incorrect password.`)

    // Correct password
    console.log("claiming with correct password...")
    shouldAdmit = await allowEntry({
        privKey,
        basePassword: "event-password"
    })
    assert(shouldAdmit === true, `Expected admittance with correct password.`)
}

async function doubleClaimCheck() {
    // Create Drop
    let keys = await createTickDrop();
    let privKey = keys.secretKeys[0];

    // Incorrect Password
    console.log("Claiming with wrong password...")
    let shouldAdmit = await allowEntry({
        privKey, 
        basePassword: "wrong-password"
    })
    assert(shouldAdmit === false, `Expected no admittance with incorrect password.`)

    // Correct password
    console.log("claiming with correct password...")
    shouldAdmit = await allowEntry({
        privKey,
        basePassword: "event-password"
    })
    assert(shouldAdmit === true, `Expected admittance with correct password.`)
}

async function tests() {
    await wrongPasswordCheck();
    await doubleClaimCheck();
}


tests()

