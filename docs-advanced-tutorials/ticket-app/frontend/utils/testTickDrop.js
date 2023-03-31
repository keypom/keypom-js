var assert = require('assert');
const { createTickDrop } = require("./createTickDrop");
const { allowEntry } = require("./allowEntry");

async function wrongPasswordCheck() {
    let responses = [null, null]
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
    responses[0] = shouldAdmit

    // Correct password
    console.log("claiming with correct password...")
    shouldAdmit = await allowEntry({
        privKey,
        basePassword: "event-password"
    })
    assert(shouldAdmit === true, `Expected admittance with correct password.`)
    responses[1] = shouldAdmit

    return responses;
}

async function doubleClaimCheck() {
    let responses = [null, null];
    // Create Drop
    let keys = await createTickDrop();
    let privKey = keys.secretKeys[0];

    // Correct Password (first claim)
    console.log("Claiming with correct password...")
    let shouldAdmit = await allowEntry({
        privKey, 
        basePassword: "event-password"
    })
    assert(shouldAdmit === true, `Expected admittance with correct password.`)
    responses[0] = shouldAdmit

    // Correct password (duplicate claim)
    console.log("claiming the same key twice...")
    shouldAdmit = await allowEntry({
        privKey,
        basePassword: "event-password"
    })
    assert(shouldAdmit === false, `Expected no admittance due to duplicate claim.`)
    responses[1] = shouldAdmit

    return responses;
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

