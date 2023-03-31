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

