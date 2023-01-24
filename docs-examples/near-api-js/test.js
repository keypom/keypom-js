const path = require("path");
const homedir = require("os").homedir();
const network = "testnet"
const myAccountId = "keypom-docs-demo.testnet"
const credentialsPath =  path.join(homedir, `.near-credentials/${network}/${myAccountId}.json`);


const data2 = require(credentialsPath)
console.log(data2.public_key)