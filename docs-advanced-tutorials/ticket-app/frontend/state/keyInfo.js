import { initKeypom, getPubFromSecret, getKeyInformation, getDropInformation } from "keypom-js";
import React from 'react'
import * as nearAPI from "near-api-js";
import { NETWORK_ID, ACCOUNT_ID } from "../utils/configurations";
import { useState, useEffect } from "react";
const { keyStores, connect } = nearAPI;


const KeyInfo = ({ contractId, privKey, curUse, setCurUse, pubKey, setPubkey }) => {
    
    // Functions that only run when KeyInfo is mounted; only need to connect to NEAR and initKeypom once
    useEffect(() => {
        async function connectNear(){
            const myKeyStore = new keyStores.BrowserLocalStorageKeyStore();
            const connectionConfig = {
               networkId: NETWORK_ID,
	           keyStore: myKeyStore,
	           nodeUrl: `https://rpc.${NETWORK_ID}.near.org`,
	            walletUrl: `https://wallet.${NETWORK_ID}.near.org`,
	            helperUrl: `https://helper.${NETWORK_ID}.near.org`,
	            explorerUrl: `https://explorer.${NETWORK_ID}.near.org`,
            };
            const nearConnection = await connect(connectionConfig);

            await initKeypom({
                near: nearConnection,
                network: NETWORK_ID
            });
        }
        connectNear()
    }, [])

    // These functions will run anytime the component is re-rendered 
    // Need to find a way to get component to re-render periodically
    useEffect(() => {
        async function getPubkey(privKey){
            console.log(privKey)
            const publicKey = await getPubFromSecret(privKey)
            setPubkey(publicKey)
            console.log(pubKey)
        }

        async function getUsesRemaining(pubKey){
            console.log(pubKey)
            console.log(typeof pubKey)

            const resKeyInfo = await getKeyInformation({publicKey: pubKey})
            console.log(resKeyInfo)
            
            const resDropInfo = await getDropInformation({secretKey: privKey})
            console.log(resDropInfo)
            setCurUse(resKeyInfo.cur_key_use)

        }
        console.log("aaa")
        getPubkey(privKey)
        getUsesRemaining(pubKey)
    });

    if(curUse==1){
        return (
            <div>
              {/* <div>Contract ID: {contractId}</div> */}
              {/* <div>Private Key: {privKey}</div> */}
              <div>Public Key: {pubKey}</div>
              <div>Current Key Use: {curUse}</div>
            </div>
          )
    }
    else{
        return
    }
   
}

export default KeyInfo

