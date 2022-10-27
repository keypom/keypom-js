const nearAPI =  require("near-api-js");
const {
	KeyPair,
	utils,
	transactions,
	utils: {
		format: { parseNearAmount },
	},
} = nearAPI;

const { BN } = require("bn.js");
const { generateSeedPhrase } = require("near-seed-phrase");
const crypto = require("crypto");

/// How much Gas each each cross contract call with cost to be converted to a receipt
const GAS_PER_CCC = 5000000000000; // 5 TGas
const RECEIPT_GAS_COST = 2500000000000; // 2.5 TGas
const YOCTO_PER_GAS = 100000000; // 100 million
export const ATTACHED_GAS_FROM_WALLET = 100000000000000; // 100 TGas

/// How much yoctoNEAR it costs to store 1 access key
const ACCESS_KEY_STORAGE = new BN("1000000000000000000000");

export const key2str = (v) => typeof v === 'string' ? v : v.pk

const hashBuf = (str) => crypto.subtle.digest('SHA-256', new TextEncoder().encode(str))
export const genKey = async (rootKey, meta, nonce) => {
	const hash = await hashBuf(`${rootKey}_${meta}_${nonce}`)
	const { secretKey } = generateSeedPhrase(hash)
	return KeyPair.fromString(secretKey)
}

export const execute = async ({
	transactions,
	account,
	wallet,
    fundingAccount,
}) => {
	/// instance of walletSelector.wallet()
	if (wallet) {
		return await wallet.signAndSendTransactions({ transactions })
	}

	/// instance of NEAR Account (backend usage)
	const nearAccount = account || fundingAccount
	if (!nearAccount) {
		throw new Error(`Call with either a NEAR Account argument 'account' or initialize Keypom with a 'fundingAccount'`)
	}

	return await signAndSendTransactions(nearAccount, transformTransactions(transactions))
}
/// sequentially execute all transactions
const signAndSendTransactions = async (account, txs) => {
	const responses = []
    for (let i = 0; i < txs.length; i++) {
		responses.push(await account.signAndSendTransaction(txs[i]))
	}
    return responses
}

export const transformTransactions = (transactions) => transactions.map(({ receiverId, actions: _actions }) => {
    const actions = _actions.map((action) =>
        createAction(action)
    );
    return ({
        receiverId,
        actions
    });
});

const createAction = (action) => {
	switch (action.type) {
		case "CreateAccount":
			return transactions.createAccount();
		case "DeployContract": {
			const { code } = action.params;

			return transactions.deployContract(code);
		}
		case "FunctionCall": {
			const { methodName, args, gas, deposit } = action.params;

			return transactions.functionCall(
				methodName,
				args,
				new BN(gas),
				new BN(deposit)
			);
		}
		case "Transfer": {
			const { deposit } = action.params;

			return transactions.transfer(new BN(deposit));
		}
		case "Stake": {
			const { stake, publicKey } = action.params;

			return transactions.stake(new BN(stake), utils.PublicKey.from(publicKey));
		}
		case "AddKey": {
			const { publicKey, accessKey } = action.params;

			// return transactions.addKey(
			// 	utils.PublicKey.from(publicKey),
			// 	// TODO: Use accessKey.nonce? near-api-js seems to think 0 is fine?
			// 	getAccessKey(accessKey.permission)
			// );
		}
		case "DeleteKey": {
			const { publicKey } = action.params;

			return transactions.deleteKey(utils.PublicKey.from(publicKey));
		}
		case "DeleteAccount": {
			const { beneficiaryId } = action.params;

			return transactions.deleteAccount(beneficiaryId);
		}
		default:
			throw new Error("Invalid action type");
	}
};

// Initiate the connection to the NEAR blockchain.
export const estimateRequiredDeposit = async ({
    near,
    depositPerUse,
    numKeys,
    usesPerKey,
    attachedGas,
    storage = parseNearAmount("0.034"),
    keyStorage = parseNearAmount("0.0065"),
    fcData = null,
    ftData = null,
}) => {
    const numKeysBN = new BN(numKeys)
    
    let totalRequiredStorage = new BN(storage).add(new BN(keyStorage).mul(numKeysBN));
    // console.log('totalRequiredStorage: ', totalRequiredStorage.toString())

    let actualAllowance = estimatePessimisticAllowance(attachedGas);
    // console.log('actualAllowance: ', actualAllowance.toString())

    let totalAllowance = actualAllowance.mul(numKeysBN);
    // console.log('totalAllowance: ', totalAllowance.toString())

    let totalAccessKeyStorage = ACCESS_KEY_STORAGE.mul(numKeysBN);
    // console.log('totalAccessKeyStorage: ', totalAccessKeyStorage.toString())

    let {numNoneFcs, depositRequiredForFcDrops} = getNoneFcsAndDepositRequired(fcData, usesPerKey);
    let totalDeposits = new BN(depositPerUse).mul(new BN(usesPerKey - numNoneFcs)).mul(numKeysBN);
    // console.log('totalDeposits: ', totalDeposits.toString())

    let totalDepositsForFc = depositRequiredForFcDrops.mul(numKeysBN);
    // console.log('totalDepositsForFc: ', totalDepositsForFc.toString())

    let requiredDeposit = totalRequiredStorage
        .add(totalAllowance)
        .add(totalAccessKeyStorage)
        .add(totalDeposits)
        .add(totalDepositsForFc);
    
    // console.log('requiredDeposit B4 FT costs: ', requiredDeposit.toString())
    
    if (ftData != null) {
        let extraFtCosts = await getFtCosts(near, numKeys, usesPerKey, ftData.contract_id);
        requiredDeposit = requiredDeposit.add(new BN(extraFtCosts));

        // console.log('requiredDeposit AFTER FT costs: ', requiredDeposit.toString())
    }

    return requiredDeposit.toString();
};

// Estimate the amount of allowance required for a given attached gas.
const estimatePessimisticAllowance = (attachedGas) => {
    // Get the number of CCCs you can make with the attached GAS
    let numCCCs = Math.floor(attachedGas / GAS_PER_CCC);
    // console.log('numCCCs: ', numCCCs)
    // Get the constant used to pessimistically calculate the required allowance
    let powOutcome = Math.pow(1.03, numCCCs);
    // console.log('powOutcome: ', powOutcome)

    let requiredGas = (attachedGas + RECEIPT_GAS_COST) * powOutcome + RECEIPT_GAS_COST;
    // console.log('requiredGas: ', requiredGas)
    let requiredAllowance = new BN(requiredGas).mul(new BN(YOCTO_PER_GAS));
    // console.log('requiredAllowance: ', requiredAllowance.toString())
    return requiredAllowance;
};

// Estimate the amount of allowance required for a given attached gas.
const getNoneFcsAndDepositRequired = (fcData, usesPerKey) => {
    let depositRequiredForFcDrops = new BN(0);
    let numNoneFcs = 0;
    if (fcData == null) {
        return {numNoneFcs, depositRequiredForFcDrops};
    }

    let numMethodData = fcData.methods.length;

    // If there's one method data specified and more than 1 claim per key, that data is to be used
    // For all the claims. In this case, we need to tally all the deposits for each method in all method data.
    if (usesPerKey > 1 && numMethodData == 1) {
        let methodData = fcData.methods[0];

        // Keep track of the total attached deposit across all methods in the method data
        let attachedDeposit = new BN(0);
        for (let i = 0; i < methodData.length; i++) {
            attachedDeposit = attachedDeposit.add(new BN(methodData[i].attachedDeposit));
        }

        depositRequiredForFcDrops = depositRequiredForFcDrops.add(attachedDeposit).mul(usesPerKey);

        return {
            numNoneFcs,
            depositRequiredForFcDrops,
        }
    }
    // In the case where either there's 1 claim per key or the number of FCs is not 1,
    // We can simply loop through and manually get this data
    for (let i = 0; i < numMethodData; i++) {
        let methodData = fcData.methods[i];
        let isNoneFc = methodData == null;
        numNoneFcs += isNoneFc;

        if (!isNoneFc) {
            // Keep track of the total attached deposit across all methods in the method data
            let attachedDeposit = new BN(0);
            for (let j = 0; j < methodData.length; j++) {
                attachedDeposit = attachedDeposit.add(new BN(methodData[j].attachedDeposit));
            }

            depositRequiredForFcDrops = depositRequiredForFcDrops.add(attachedDeposit);
        }
    }

    return {
        numNoneFcs,
        depositRequiredForFcDrops,
    } 
};

// Estimate the amount of allowance required for a given attached gas.
const getFtCosts = async (near, numKeys, usesPerKey, ftContract) => {
    const viewAccount = await near.account("foo");
    const storageBalanceBounds = await viewAccount.viewFunction(ftContract, "storage_balance_bounds", {}); 
    console.log('storageBalanceBounds: ', storageBalanceBounds)
    let costs = new BN(storageBalanceBounds.min).mul(new BN(numKeys)).mul(new BN(usesPerKey)).add(new BN(storageBalanceBounds.min));
    console.log('costs: ', costs.toString());
    return costs.toString();
};