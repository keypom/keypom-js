const { initKeypom, createDrop, createNFTSeries, addToBalance, getEnv, claim, getKeyInformation, hashPassword, formatLinkdropUrl, getPubFromSecret } = require("keypom-js");
const { KeyPair, keyStores, connect } = require("near-api-js");
const { parseNearAmount } = require("near-api-js/lib/utils/format");
const path = require("path");
const homedir = require("os").homedir();
var assert = require('assert');

async function allowEntry({privKey, basePassword}){
  try {
      // Check 1: Key existence
      var publicKey = await getPubFromSecret(privKey)
      var keyInfo = await getKeyInformation({publicKey})
      // If key does not exist, the user should not be admitted
      if(keyInfo == null) {
          console.log(`Key does not exist. Admission denied`);
          return false;
      }

      var curUse = keyInfo.cur_key_use 

      // Ticket was already scanned
      if (curUse !== 1) {
          console.log(`Key has already been scanned. Admission denied`);
          return false;
      }
       
      // Create password using base + pubkey + key use as string
      let passwordForClaim = await hashPassword(basePassword + publicKey + curUse.toString())
      // Claim with created password
      await claim({
          secretKey: privKey,
          accountId: "minqi.testnet",
          password: passwordForClaim
      })

      // Check 3: Check if claim was successful by validating that curUse incremented
      keyInfo = await getKeyInformation({publicKey})

      if (keyInfo.cur_key_use !== 2) {
          console.log(`Claim has failed, check password`)
          return false;
      }
  } catch(err) {
      console.log(`Unknown Error: ${err}. Admission denied`)
      return false;
  }

  return true
}

module.exports = {
    allowEntry
}