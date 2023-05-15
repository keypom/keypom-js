const keypom = require("@keypom/core");
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