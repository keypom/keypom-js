import { initKeypom, getPubFromSecret, getKeyInformation, getDropInformation } from "keypom-js";
import React from 'react'
import * as nearAPI from "near-api-js";
import { NETWORK_ID, ACCOUNT_ID } from "../utils/configurations";
import { useState, useEffect } from "react";
const { keyStores, connect } = nearAPI;


const KeyInfo = ({ contractId, privKey }) => {
    const [pubKey, setPubkey] = useState("");
    const [curUse, setCurUse] = useState("");

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
        connectNear()
        getPubkey(privKey)
        getUsesRemaining(pubKey)
    }, [privKey, pubKey]);


    return (
      <div>
        <div>Contract ID: {contractId}</div>
        <div>Private Key: {privKey}</div>
        <div>Public Key: {pubKey}</div>
        <div>Current Key Use: {curUse}</div>
      </div>
    )
}

export default KeyInfo

