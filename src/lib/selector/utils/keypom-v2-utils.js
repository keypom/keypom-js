const { logger } = require("@near-wallet-selector/core/lib/services")

// helpers for keypom account contract args
const RECEIVER_HEADER = '|kR|'
const ACTION_HEADER = '|kA|'
const PARAM_START = '|kP|'
const PARAM_STOP = '|kS|'

const wrapParams = (params, newParams = {}) => {
	Object.entries(params).forEach(([k, v]) => {
		if (k === 'args' && typeof v !== 'string') {
			v = JSON.stringify(v)
		}
		if (Array.isArray(v)) v = v.join()
		newParams[PARAM_START+k] = v + PARAM_STOP
	})
	return newParams
}

const genArgs = (json) => {
	logger.log('json: ', json)
	const newJson = {
		transactions: []
	}

	const toValidate = []

	json.transactions.forEach((tx) => {
		const newTx = {}
		newTx[RECEIVER_HEADER] = tx.contractId || tx.receiverId
		newTx.actions = []
		logger.log('newTx: ', newTx)

		tx.actions.forEach((action) => {
			logger.log('action: ', action)
			toValidate.push({
				receiverId: tx.contractId || tx.receiverId,
				methodName: action.params.methodName,
				deposit: action.params.deposit
			})

			const newAction = {}
			logger.log('newAction 1: ', newAction)
			newAction[ACTION_HEADER] = action.type
			logger.log('newAction 2: ', newAction)
			newAction.params = wrapParams(action.params)
			logger.log('newAction 3: ', newAction)
			newTx.actions.push(newAction)
		})
		newJson.transactions.push(newTx)
	})
	return {
		wrapped: newJson,
		toValidate
	}
}

module.exports = {
	genArgs, wrapParams
}