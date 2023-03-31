var assert = require('assert');
const { createTickDrop } = require("./createTickDrop");
const { allowEntry } = require("./allowEntry");

async function wrongPasswordCheck() {
}

async function doubleClaimCheck() {
}

async function tests() {
    let pwResponses = await wrongPasswordCheck();
    let dcResponses = await doubleClaimCheck();

    console.log(`
        Password Test Responses:
        Expected false, got: ${pwResponses[0]}
        Expected true, got: ${pwResponses[1]}

        Double Claim Test Responses:
        Expected true, got: ${dcResponses[0]}
        Expected false, got: ${dcResponses[1]}
    `);
}

tests()

