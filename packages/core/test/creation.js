import { 
  LARGE_GAS,
  generateKeyPairs,
  callFunctionRetrieveGas,
  getGasMarginsForClaims,
  createKeypomDrop,
  mintAndTransferNfts,
  mintAndTransferFts,
  beforeAll,
  LARGE_METHOD_DATA,
  receipt_data,
 } from './utils.js';
import { parseNearAmount } from "@near-js/utils";

import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';
import { writeFile, writeFileSync } from 'fs';
import { Account } from '@near-js/accounts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const NETWORK_ID = 'testnet';
const funderAccountId = 'keypom.testnet';
const keypomContractId = `v3-${Date.now()}.${funderAccountId}`;
const pathToWasm = join(__dirname, '../../../../keypom/', 'out', 'keypom.wasm');
const pathToTrialWasm = join(__dirname, '../../selector/test/', 'ext-wasm', 'trial-accounts.wasm');
const nftContractId = "nft.examples.testnet";

async function parseReceiptData() {
  let txnResult = receipt_data.result;

  //console.log('txnResult: ', txnResult)
  let success = true;
  let totalBurntGas = txnResult.transaction_outcome.outcome.gas_burnt;
  for (var receipt of txnResult.receipts_outcome) {
    
    totalBurntGas += receipt.outcome.gas_burnt
    let successValue = receipt.outcome.status["SuccessValue"] || receipt.outcome.status["SuccessReceiptId"];
    console.log('successValue: ', successValue)
    if (successValue === undefined && typeof receipt.outcome.status["SuccessValue"] !== 'string') {
      console.log('receipt: ', receipt)
      success = false;
    }

    //console.log('receipt: ', receipt.outcome)
  }

  console.log(`Gas Burnt: ${totalBurntGas} | TGas: ${totalBurntGas / 1e12}`)
}

/// all tests
async function main() {
  let near = await beforeAll({
    funderAccountId,
    keypomContractId,
    pathToWasm,
    NETWORK_ID
  });

  const keypomContractAccount = new Account(near.connection, keypomContractId);
  let fundingAccounts = [];
  for (var i = 1; i <= 12; i++) {
    let funderAccountId = `funder${i}.keypom.testnet`;
    fundingAccounts.push(new Account(near.connection, funderAccountId));
  }

  let promises = {
    // "null": [
    //   nullTests(1, false, fundingAccounts[0], keypomContractAccount),
    //   nullTests(50, false, fundingAccounts[1], keypomContractAccount),
    //   nullTests(100, false, fundingAccounts[2], keypomContractAccount),
    //   nullTests(1, true, fundingAccounts[0], keypomContractAccount),
    //   nullTests(50, true, fundingAccounts[1], keypomContractAccount),
    //   nullTests(100, true, fundingAccounts[2], keypomContractAccount)
    // ],
    // "near": [
    //   nearTests(1, false, fundingAccounts[3], keypomContractAccount),
    //   nearTests(10, false, fundingAccounts[4], keypomContractAccount),
    //   nearTests(25, false, fundingAccounts[5], keypomContractAccount),
    //   nearTests(1, true, fundingAccounts[3], keypomContractAccount),
    //   nearTests(10, true, fundingAccounts[4], keypomContractAccount),
    //   nearTests(25, true, fundingAccounts[5], keypomContractAccount),
    // ],
    // "nfts": [
    //   nftTests(1, 0, false, fundingAccounts[6], keypomContractAccount),
    //   nftTests(5, 0, false, fundingAccounts[7], keypomContractAccount),
    //   nftTests(10, 0, false, fundingAccounts[8], keypomContractAccount),
    //   nftTests(1, 0, true, fundingAccounts[6], keypomContractAccount),
    //   nftTests(5, 0, true, fundingAccounts[7], keypomContractAccount),
    //   nftTests(10, 0, true, fundingAccounts[8], keypomContractAccount),
    // ],
    // "fts": [
    //   ftTests(1, false, fundingAccounts[9], keypomContractAccount),
    //   ftTests(5, false, fundingAccounts[10], keypomContractAccount),
    //   ftTests(9, false, fundingAccounts[11], keypomContractAccount),
    //   ftTests(1, true, fundingAccounts[9], keypomContractAccount),
    //   ftTests(5, true, fundingAccounts[10], keypomContractAccount),
    //   ftTests(9, true, fundingAccounts[11], keypomContractAccount),
    // ],
    // "fcs1": [
    //   fcTests(1, 1, 1, false, fundingAccounts[0], keypomContractAccount),
    //   fcTests(10, 1, 1, false, fundingAccounts[1], keypomContractAccount),
    //   fcTests(50, 1, 1, false, fundingAccounts[2], keypomContractAccount),
    //   fcTests(100, 1, 1, false, fundingAccounts[3], keypomContractAccount),
    //   fcTests(1, 1, 1, true, fundingAccounts[0], keypomContractAccount),
    //   fcTests(10, 1, 1, true, fundingAccounts[1], keypomContractAccount),
    //   fcTests(50, 1, 1, true, fundingAccounts[2], keypomContractAccount),
    //   fcTests(100, 1, 1, true, fundingAccounts[3], keypomContractAccount),
    // ],
    "fcs2": [
      fcTests(1, 1, 1, false, fundingAccounts[0], keypomContractAccount),
      fcTests(1, 3, 1, false, fundingAccounts[1], keypomContractAccount),
      fcTests(1, 5, 1, false, fundingAccounts[2], keypomContractAccount),
      fcTests(1, 10, 1, false, fundingAccounts[3], keypomContractAccount),
      fcTests(1, 1, 1, true, fundingAccounts[0], keypomContractAccount),
      fcTests(1, 3, 1, true, fundingAccounts[1], keypomContractAccount),
      fcTests(1, 5, 1, true, fundingAccounts[2], keypomContractAccount),
      fcTests(1, 10, 1, true, fundingAccounts[3], keypomContractAccount),
    ],
    "fcs3": [
      fcTests(1, 1, 1, false, fundingAccounts[0], keypomContractAccount),
      fcTests(1, 1, 3, false, fundingAccounts[1], keypomContractAccount),
      fcTests(1, 1, 5, false, fundingAccounts[2], keypomContractAccount),
      fcTests(1, 1, 10, false, fundingAccounts[3], keypomContractAccount),
      fcTests(1, 1, 1, true, fundingAccounts[0], keypomContractAccount),
      fcTests(1, 1, 3, true, fundingAccounts[1], keypomContractAccount),
      fcTests(1, 1, 5, true, fundingAccounts[2], keypomContractAccount),
      fcTests(1, 1, 10, true, fundingAccounts[3], keypomContractAccount),
    ],
    "fcs4": [
      fcTests(1, 1, 1, false, fundingAccounts[0], keypomContractAccount),
      fcTests(1, 2, 2, false, fundingAccounts[1], keypomContractAccount),
      fcTests(1, 3, 3, false, fundingAccounts[2], keypomContractAccount),
      fcTests(1, 1, 1, true, fundingAccounts[0], keypomContractAccount),
      fcTests(1, 2, 2, true, fundingAccounts[1], keypomContractAccount),
      fcTests(1, 3, 3, true, fundingAccounts[2], keypomContractAccount),
    ],
    "fcs5": [
      fcTests(1, 1, 1, false, fundingAccounts[0], keypomContractAccount),
      fcTests(2, 2, 2, false, fundingAccounts[1], keypomContractAccount),
      fcTests(3, 3, 3, false, fundingAccounts[2], keypomContractAccount),
      fcTests(1, 1, 1, true, fundingAccounts[0], keypomContractAccount),
      fcTests(2, 2, 2, true, fundingAccounts[1], keypomContractAccount),
      fcTests(3, 3, 3, true, fundingAccounts[2], keypomContractAccount),
    ],
    // "largeFcs": [
    //   // largeFcTests(1, 1, 1, false, fundingAccounts[0], keypomContractAccount),
    //   // largeFcTests(5, 1, 1, false, fundingAccounts[1], keypomContractAccount),
    //   // largeFcTests(10, 1, 1, false, fundingAccounts[2], keypomContractAccount),
    //   // largeFcTests(25, 1, 1, false, fundingAccounts[3], keypomContractAccount),
    //   // largeFcTests(1, 1, 1, true, fundingAccounts[0], keypomContractAccount),
    //   // largeFcTests(5, 1, 1, true, fundingAccounts[1], keypomContractAccount),
    //   // largeFcTests(10, 1, 1, true, fundingAccounts[2], keypomContractAccount),
    //   // largeFcTests(25, 1, 1, true, fundingAccounts[3], keypomContractAccount),
    // ]
  }

  // Execute all promises in parallel
  let results = {};
  for (let [key, promise] of Object.entries(promises)) {
    let res = await Promise.all(promise);
    results[key] = res;
  }
  console.log('results: ', results)
  await writeFileSync(resolve(__dirname, 'gas-estimations.json'), JSON.stringify(results));
}

/// all tests
async function nullTests(numNullAssets, createAccount, fundingAccount, keypomContractAccount) {
  let config = createAccount == false ? {permissions: "claim"} : null;
  
  let assetData = [
    {uses: 1, assets: new Array(numNullAssets).fill(null), config}
  ];

  let dropId = Date.now().toString();
  console.log('assetData: ', assetData)
  let keysForClaim = await createKeypomDrop({
      funder: fundingAccount,
      keypom: keypomContractAccount,
      dropId,
      assetData
  })

  let {requiredGas, txnResult} = await getGasMarginsForClaims({
    keypom: keypomContractAccount,
    claimKeyPair: keysForClaim[0],
    //fcArgs: "trial",
    createAccount,
    shouldLogReceiptGas: true
  })
  let txnHash = txnResult.transaction.hash;

  //console.log('txnResult: ', txnResult)
  let totalBurntGas = txnResult.transaction_outcome.outcome.gas_burnt;
  for (var receipt of txnResult.receipts_outcome) {
    totalBurntGas += receipt.outcome.gas_burnt
    //console.log('receipt: ', receipt.outcome)
  }

  console.log(`Gas Burnt: ${totalBurntGas} | TGas: ${totalBurntGas / 1e12}`)
  console.log(`https://explorer.testnet.near.org/transactions/${txnHash}`);

  return {
    attachedGas: requiredGas,
    burntGas: totalBurntGas
  }
}

async function nearTests(numNearAssets, createAccount, fundingAccount, keypomContractAccount) {
  let config = createAccount == false ? {permissions: "claim"} : null;
  
  let assetData = [
    {uses: 1, assets: new Array(numNearAssets).fill({
      yoctonear: parseNearAmount("0.1")
    }), config}
  ];

  let dropId = Date.now().toString();
  console.log('assetData: ', assetData)
  let keysForClaim = await createKeypomDrop({
      funder: fundingAccount,
      keypom: keypomContractAccount,
      dropId,
      assetData
  })

  let {requiredGas, txnResult} = await getGasMarginsForClaims({
    keypom: keypomContractAccount,
    claimKeyPair: keysForClaim[0],
    //fcArgs: "trial",
    createAccount,
    shouldLogReceiptGas: true
  })
  let txnHash = txnResult.transaction.hash;

  //console.log('txnResult: ', txnResult)
  let totalBurntGas = txnResult.transaction_outcome.outcome.gas_burnt;
  for (var receipt of txnResult.receipts_outcome) {
    totalBurntGas += receipt.outcome.gas_burnt
    //console.log('receipt: ', receipt.outcome)
  }

  console.log(`Gas Burnt: ${totalBurntGas} | TGas: ${totalBurntGas / 1e12}`)
  console.log(`https://explorer.testnet.near.org/transactions/${txnHash}`);

  return {
    attachedGas: requiredGas,
    burntGas: totalBurntGas
  }
}

async function nftTests(numNftsPerClaim, numExtraNftContracts, createAccount, fundingAccount, keypomContractAccount) {
    let config = createAccount == false ? {permissions: "claim"} : null;

    let nftAsset = {
      nft_contract_id: nftContractId
    }
    
    let assetArray = new Array(numNftsPerClaim).fill(nftAsset);
    let assetData = [
      {uses: 1, assets: assetArray, config}
    ];

    for (let i = 0; i < numExtraNftContracts; i++) {
      let nftAsset = {
        nft_contract_id: `random-nft-contract${i}.testnet`
      }

      assetData.push({uses: 1, assets: new Array(numNftsPerClaim).fill(nftAsset), config});
    }

    let dropId = Date.now().toString();
    console.log('assetData: ', assetData)
    let keysForClaim = await createKeypomDrop({
        funder: fundingAccount,
        keypom: keypomContractAccount,
        dropId,
        assetData
    })

    await mintAndTransferNfts({
      funder: fundingAccount, 
      keypomContractId,
      nftContractId,
      dropId,
      numNfts: numNftsPerClaim
    });

    let {requiredGas, txnResult} = await getGasMarginsForClaims({
    keypom: keypomContractAccount,
    claimKeyPair: keysForClaim[0],
    //fcArgs: "trial",
    createAccount,
    shouldLogReceiptGas: true
  })
  let txnHash = txnResult.transaction.hash;

  //console.log('txnResult: ', txnResult)
  let totalBurntGas = txnResult.transaction_outcome.outcome.gas_burnt;
  for (var receipt of txnResult.receipts_outcome) {
    totalBurntGas += receipt.outcome.gas_burnt
    //console.log('receipt: ', receipt.outcome)
  }
  
  console.log(`Gas Burnt: ${totalBurntGas} | TGas: ${totalBurntGas / 1e12}`)
  console.log(`https://explorer.testnet.near.org/transactions/${txnHash}`);

  return {
    attachedGas: requiredGas,
    burntGas: totalBurntGas
  }
}

async function ftTests(numFtTransfers, createAccount, fundingAccount, keypomContractAccount) {
  let config = createAccount == false ? {permissions: "claim"} : null;

  let ftsPerTransfer = parseNearAmount("0.00001").toString();
  console.log('ftsPerTransfer: ', ftsPerTransfer)
  let ftAsset = {
    ft_contract_id: "ft.predeployed.examples.testnet",
    registration_cost: parseNearAmount("0.0125"),
    ft_amount: ftsPerTransfer
  }
  let assetArray = new Array(numFtTransfers).fill(ftAsset);
  
  let assetData = [
    {uses: 1, assets: assetArray, config}
  ];

  let dropId = Date.now().toString();
  console.log('assetData: ', assetData)
  let keysForClaim = await createKeypomDrop({
      funder: fundingAccount,
      keypom: keypomContractAccount,
      dropId,
      assetData
  })

  let numFTsToMint = ftsPerTransfer * numFtTransfers;
    console.log('numFTsToMint: ', numFTsToMint)
    await mintAndTransferFts({
      funder: fundingAccount, 
      keypomContractId,
      dropId,
      numFts: numFTsToMint.toString()
    });

    let {requiredGas, txnResult} = await getGasMarginsForClaims({
    keypom: keypomContractAccount,
    claimKeyPair: keysForClaim[0],
    //fcArgs: "trial",
    createAccount,
    shouldLogReceiptGas: true
  })
  let txnHash = txnResult.transaction.hash;

  //console.log('txnResult: ', txnResult)
  let totalBurntGas = txnResult.transaction_outcome.outcome.gas_burnt;
  for (var receipt of txnResult.receipts_outcome) {
    totalBurntGas += receipt.outcome.gas_burnt
    //console.log('receipt: ', receipt.outcome)
  }

  console.log(`Gas Burnt: ${totalBurntGas} | TGas: ${totalBurntGas / 1e12}`)
  console.log(`https://explorer.testnet.near.org/transactions/${txnHash}`);

  return {
    attachedGas: requiredGas,
    burntGas: totalBurntGas
  }
}

/// all tests
async function fcTests(numUses, fcsPerUse, methodsPerAsset, createAccount, fundingAccount, keypomContractAccount) {
  let config = createAccount == false ? {permissions: "claim"} : null;

  let assetData = [];
  for (let i = 0; i < numUses; i++) {
    
    let assetsPerUse = [];
    for (let j = 0; j < fcsPerUse; j++) {

      let methodData = [];
      for (let k = 0; k < methodsPerAsset; k++) {
        methodData.push({
          receiver_id: nftContractId,
          method_name: "nft_mint",
          args: JSON.stringify({
            token_id: `${Date.now()}-${i}-${j}-${k}`,
            metadata: {
              title: `Random NFT ${i}-${j}-${k}`,
              description: `Random NFT ${i}-${j}-${k}`,
              media: "https://media.giphy.com/media/3o7aDcz3u24RLHwvIc/giphy.gif",
              copies: 1
            }
          }),
          attached_deposit: parseNearAmount("0.01"),
          attached_gas: "10000000000000",
          keypom_args: {
            account_id_field: "receiver_id"
          }
          // pub receiver_to_claimer: Option<bool>,
          // pub user_args_rule: Option<UserArgsRule>,
        })
      } 

      assetsPerUse.push(methodData)
    }

    assetData.push({uses: 1, assets: assetsPerUse, config})
  }

  let dropId = Date.now().toString();
  console.log('assetData: ', assetData)
  let keysForClaim = await createKeypomDrop({
      funder: fundingAccount,
      keypom: keypomContractAccount,
      dropId,
      assetData
  })

  let {requiredGas, txnResult} = await getGasMarginsForClaims({
    keypom: keypomContractAccount,
    claimKeyPair: keysForClaim[0],
    //fcArgs: "trial",
    createAccount,
    shouldLogReceiptGas: true
  })
  let txnHash = txnResult.transaction.hash;

  //console.log('txnResult: ', txnResult)
  let totalBurntGas = txnResult.transaction_outcome.outcome.gas_burnt;
  for (var receipt of txnResult.receipts_outcome) {
    totalBurntGas += receipt.outcome.gas_burnt
    //console.log('receipt: ', receipt.outcome)
  }

  console.log(`Gas Burnt: ${totalBurntGas} | TGas: ${totalBurntGas / 1e12}`)
  console.log(`https://explorer.testnet.near.org/transactions/${txnHash}`);

  return {
    attachedGas: requiredGas,
    burntGas: totalBurntGas
  }
}

/// all tests
async function largeFcTests(numUses, fcsPerUse, methodsPerAsset, createAccount, fundingAccount, keypomContractAccount) {
  let config = createAccount == false ? {permissions: "claim"} : null;

  let assetData = [];
  for (let i = 0; i < numUses; i++) {
    
    let assetsPerUse = [];
    for (let j = 0; j < fcsPerUse; j++) {

      let methodData = [];
      for (let k = 0; k < methodsPerAsset; k++) {
        let newAccountId = `${Date.now()}-${i}-${j}-${k}.testnet`;
        let {keys, publicKeys} = await generateKeyPairs(1);
        methodData.push(LARGE_METHOD_DATA(pathToTrialWasm, newAccountId, publicKeys[0]))
      } 

      assetsPerUse.push(methodData)
    }

    assetData.push({uses: 1, assets: assetsPerUse, config})
  }

  let dropId = Date.now().toString();
  console.log('assetData: ', assetData)
  let keysForClaim = await createKeypomDrop({
      funder: fundingAccount,
      keypom: keypomContractAccount,
      dropId,
      assetData,
      attachedDeposit: parseNearAmount("15").toString()
  })

  let {requiredGas, txnResult} = await getGasMarginsForClaims({
    keypom: keypomContractAccount,
    claimKeyPair: keysForClaim[0],
    //fcArgs: "trial",
    createAccount,
    shouldLogReceiptGas: true
  })
  let txnHash = txnResult.transaction.hash;

  //console.log('txnResult: ', txnResult)
  let success = true;
  let totalBurntGas = txnResult.transaction_outcome.outcome.gas_burnt;
  for (var receipt of txnResult.receipts_outcome) {
    
    totalBurntGas += receipt.outcome.gas_burnt
    let successValue = receipt.outcome.status["SuccessValue"] || receipt.outcome.status["SuccessReceiptId"];
    console.log('successValue: ', successValue)
    if (successValue === undefined && typeof receipt.outcome.status["SuccessValue"] !== 'string') {
      console.log('receipt: ', receipt)
      success = false;
    }

    //console.log('receipt: ', receipt.outcome)
  }

  console.log(`Gas Burnt: ${totalBurntGas} | TGas: ${totalBurntGas / 1e12}`)
  console.log(`https://explorer.testnet.near.org/transactions/${txnHash}`);

  return {
    attachedGas: requiredGas,
    burntGas: totalBurntGas,
    success
  }
}

//parseReceiptData();
main();