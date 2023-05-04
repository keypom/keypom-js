const keypom = require("keypom-js");
const {
	getPubFromSecret,
	getKeyInformation,
	hashPassword,
    claim
} = keypom

async function allowEntry({privKey, basePassword}) {
}

module.exports = {
    allowEntry
}