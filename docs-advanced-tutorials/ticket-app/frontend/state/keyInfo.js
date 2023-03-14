import { initKeypom, getPubFromSecret, getKeyInformation, getDropInformation } from "keypom-js";
import React from 'react'
import * as nearAPI from "near-api-js";
import { NETWORK_ID, ACCOUNT_ID } from "../utils/configurations";
import { useState, useEffect } from "react";
const { keyStores, connect } = nearAPI;


const KeyInfo = ({ contractId, privKey, curUse, setCurUse, pubKey, setPubkey }) => {

    // These functions will run anytime the component is re-rendered 
    useEffect(() => {
        async function getPubkey(privKey){
            const publicKey = await getPubFromSecret(privKey)
            setPubkey(publicKey)
        }

        async function getUsesRemaining(pubKey){
            const resKeyInfo = await getKeyInformation({publicKey: pubKey})
            setCurUse(resKeyInfo.cur_key_use)

        }
        getPubkey(privKey)
        getUsesRemaining(pubKey)
    });

    if(curUse==1){
        return (
            <div>
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

