import { initKeypom, getPubFromSecret, getKeyInformation, getDropInformation } from "@keypom/core";
import React from 'react'
import { useState, useEffect } from "react";


const KeyInfo = ({ contractId, privKey, curUse, setCurUse, pubKey, setPubKey }) => {
    
    // These functions will run anytime the component is re-rendered 
    useEffect(() => {
        async function getUsesRemaining(privKey){
            let tempKey = await getPubFromSecret(privKey)
            setPubKey(tempKey)
            const resKeyInfo = await getKeyInformation({publicKey: tempKey})
            if(resKeyInfo){
                setCurUse(resKeyInfo.cur_key_use)
            }
            else{
                setCurUse(0)
            }
        }
        async function main(privKey){
            await getUsesRemaining(privKey)
        }
        main(privKey)
        
    });

    if(curUse==1){
        console.log(pubKey)
        return (
            <div>
              <div>Public Key: {pubKey}</div>
              <div>Current Key Use: {curUse}</div>
            </div>
          )
    }
    else{
        console.log(curUse)
        return
    }
   
}

export default KeyInfo

