
// Estimate the amount of allowance required for a given attached gas.
const getRecentDropId = async (fundingAccountObject, accountId, keypomContract) => {
    let dropSupplyForOwner = await fundingAccountObject.viewFunction({
        contractId: keypomContract, 
        methodName: 'get_drop_supply_for_owner', 
        args: {account_id: accountId}
    });
	console.log('dropSupplyForOwner: ', dropSupplyForOwner)
	let dropsForOwner = await fundingAccountObject.viewFunction({
        contractId: keypomContract, 
        methodName: 'get_drops_for_owner', 
        args: { account_id: accountId, from_index: (dropSupplyForOwner - 1).toString() }
    });
	console.log('dropsForOwner: ', dropsForOwner)

    return dropsForOwner[dropsForOwner.length - 1].drop_id;
};

module.exports = {
    getRecentDropId,
};