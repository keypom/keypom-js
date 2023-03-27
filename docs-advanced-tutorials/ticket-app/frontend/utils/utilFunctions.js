const { initKeypom, createDrop, createNFTSeries, addToBalance, getEnv, claim, getKeyInformation, hashPassword, formatLinkdropUrl, getPubFromSecret } = require("keypom-js");
const { KeyPair, keyStores, connect } = require("near-api-js");
const { parseNearAmount } = require("near-api-js/lib/utils/format");
const path = require("path");
const homedir = require("os").homedir();
var assert = require('assert');

async function hostClaim({privKey, basePassword=""}){
    let claimError = true;
    try{
        // Check 1: Key existence
        var publicKey = await getPubFromSecret(privKey)
        var resKeyInfo = await getKeyInformation({publicKey: publicKey})
        if(resKeyInfo == null){
          // Key does not exist
          throw new Error(`Key does not exist`)
        }
        var resCurUse = resKeyInfo.cur_key_use 

        // Check 2: Only claim if it has never been scanned
        if(resCurUse == 1){
          // Create password using base + pubkey + key use as string
          let passwordForClaim = await hashPassword(basePassword + publicKey + resCurUse.toString())
          // Claim with created password
          await claim(
            {
              secretKey: privKey,
              accountId: "minqi.testnet",
              password: passwordForClaim
            }
          )
        }
        else{
          // Ticket was already scanned
          throw new Error(`The Key has already been scanned`)
        }

        // Check 3: Check if claim was successful by validating that curUse incremented
        var newKeyInfo = await getKeyInformation({publicKey: publicKey})
        if(newKeyInfo.cur_key_use - resCurUse === 1){
          claimError = false;
        }
        else if(newKeyInfo.cur_key_use === resCurUse ){
          // Claim Failed
          throw new Error(`Claim has failed, check password`)
        }
        else{
            throw new Error(`Unknown error. Key use before claim: ${resCurUse}, Key use after ${newKeyInfo.cur_key_use}`)
        }
    }
    catch(err){
        console.log(`Claim Failed: ${err}`)
    }

    return claimError
}

module.exports = {
    hostClaim
}