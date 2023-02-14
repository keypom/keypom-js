import React from "react";
import { useZxing } from "react-zxing";
import { initKeypom, claim } from "keypom-js";
import * as nearAPI from "near-api-js";
import { NETWORK_ID, ACCOUNT_ID } from "../utils/configurations";
import { useState, useEffect } from "react";
const { keyStores, connect } = nearAPI;



export const Scanner = () => {
  const [result, setResult] = useState("");
  const [splitRes, setSplitRes] = useState([]);
  const [resPrivKey, setResPrivkey] = useState("")
  const [click, setClick] = useState(false);
  const [password, setPassword] = useState("NULL")

  const { ref } = useZxing({
    onResult(result) {
      setResult(result.getText());
      setSplitRes([...result.getText().split("/")]);
      setResPrivkey(result.getText().split("/")[5])
    },
  });

  // Functions that only run when scanner is mounted; only need to connect to NEAR and initKeypom once
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
      var PASSWORD = "NULL"
      PASSWORD = prompt("enter password for drop")
      setPassword(PASSWORD)
  }, [])

  useEffect(() => {
    if(click){
        async function scannerClaim(){
            await claim({
                secretKey: resPrivKey,
                accountId: "minqi.testnet",
                password: password
            })
            setClick(false)
        }
        scannerClaim()
    }
  }, [click])

  //return a button under the scanner to claim; that button updates state var click
  // whne click updated, run useEffect script to claim

  return (
    <>
      <video ref={ref} />
      <p>
        {/* <span>Last result: </span>
        <span>{result}</span>
        <br></br> */}
        <span>Contract to Claim On: </span>
        <span>{splitRes[4]}</span>
        <br></br>
        <span>Private Key to Claim: </span>
        <span>{splitRes[5]}</span>
        <br></br>
        <span>Drop Password: </span>
        <span>{password}</span>
      </p>
      <button onClick={()=>setClick(true)}>Click here to claim</button>
    </>
  );
};
