"use strict";
// helpers for keypom account contract args
var RECEIVER_HEADER = '|kR|';
var ACTION_HEADER = '|kA|';
var PARAM_START = '|kP|';
var PARAM_STOP = '|kS|';
var wrapParams = function (params, newParams) {
    if (newParams === void 0) { newParams = {}; }
    Object.entries(params).forEach(function (_a) {
        var k = _a[0], v = _a[1];
        if (k === 'args' && typeof v !== 'string') {
            v = JSON.stringify(v);
        }
        if (Array.isArray(v))
            v = v.join();
        newParams[PARAM_START + k] = v + PARAM_STOP;
    });
    return newParams;
};
var genArgs = function (json) {
    console.log('json: ', json);
    var newJson = {
        transactions: []
    };
    var toValidate = [];
    json.transactions.forEach(function (tx) {
        var newTx = {};
        newTx[RECEIVER_HEADER] = tx.contractId || tx.receiverId;
        newTx.actions = [];
        console.log('newTx: ', newTx);
        tx.actions.forEach(function (action) {
            console.log('action: ', action);
            toValidate.push({
                receiverId: tx.contractId || tx.receiverId,
                methodName: action.params.methodName,
                deposit: action.params.deposit
            });
            var newAction = {};
            console.log('newAction 1: ', newAction);
            newAction[ACTION_HEADER] = action.type;
            console.log('newAction 2: ', newAction);
            newAction.params = wrapParams(action.params);
            console.log('newAction 3: ', newAction);
            newTx.actions.push(newAction);
        });
        newJson.transactions.push(newTx);
    });
    return {
        wrapped: newJson,
        toValidate: toValidate
    };
};
module.exports = {
    genArgs: genArgs,
    wrapParams: wrapParams
};
