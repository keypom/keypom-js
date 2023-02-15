import React from "react";
import { useZxing } from "react-zxing";
import { initKeypom, claim, hashPassword, getPubFromSecret, getKeyInformation } from "keypom-js";
import * as nearAPI from "near-api-js";
import { NETWORK_ID, ACCOUNT_ID } from "../utils/configurations";
import { useState, useEffect } from "react";
import logo from "../static/img/green-check.png" 
import "../styles.css";
const { keyStores, connect } = nearAPI;



export const Scanner = () => {
  const [result, setResult] = useState("");
  const [splitRes, setSplitRes] = useState([]);
  const [resPrivKey, setResPrivkey] = useState("")
  const [click, setClick] = useState(false);
  const [password, setPassword] = useState("NULL")

  var arr = [1, false, false];
  const [masterState, setMasterState] = useState(arr)
  // [stage, claimed bool, data bool]

  // Scanner and getting results of scan
  const { ref } = useZxing({
    onResult(result) {
      setResult(result.getText());
      setSplitRes([...result.getText().split("/")]);
      setResPrivkey(result.getText().split("/")[5])

      //indicate new data
      var tempState = [...masterState]
      tempState[2] = true
      tempState[0] = 2
      setMasterState([...tempState])
    },
  });

  // Functions that only run when scanner is mounted 
  // connect to NEAR, initKeypom, and get password
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
      let PASSWORD = "NULL"
      PASSWORD = prompt("enter base password for drop")
      setPassword(PASSWORD)
  }, [])

  // Claiming the drop using password
  useEffect(() => {
    if(click){
        function timeout(delay) {
            return new Promise( res => setTimeout(res, delay) );
        }

        async function scannerClaim(){
            // Get current key use
            let publicKey = await getPubFromSecret(resPrivKey)
            let resKeyInfo = await getKeyInformation({publicKey: publicKey})
            let resCurUse = resKeyInfo.cur_key_use 

            // Create password using base + pubkey + key use as string
            let passwordForClaim = await hashPassword(password + publicKey + resCurUse.toString())

            // Claim with created password
            await claim({
                secretKey: resPrivKey,
                accountId: "minqi.testnet",
                password: passwordForClaim
            })

            // check if claim succeeded and then indicate claimed
            var newKeyInfo = await getKeyInformation({publicKey: publicKey})
            if(newKeyInfo.cur_key_use - resCurUse === 1){
              var tempState = [...masterState]
              tempState[1] = true
              tempState[0] = 3
              setMasterState([...tempState])

              // Wait 2s, then flip go back to stage 1
              await timeout(2000)
              var emptyRes = new Array(splitRes.length)
              setSplitRes(emptyRes)
              setResPrivkey("")
              var arr = [1, false, false];
              setMasterState(arr)

            }
            else{
              console.log("claim did not work")
              console.log(`key use before claim: ${resCurUse}`)
              console.log(`key use after claim: ${newKeyInfo.cur_key_use}`)
            }
        }
        scannerClaim()
        setClick(false)
        
        //indicate claimed

    }
  }, [click])
  // Not scanned, just received pw
  if(masterState[0] === 1){
    return (
      <>
        <div class="content">
          <video ref={ref} />
          <h2>Scan a linkdrop QR code to claim</h2>
          {/* <br></br>
          <span>Current State: </span>
          <span>{masterState[0]}</span>     */}
          {/* <img src={logo} alt="green check" width="50" height="60"></img> */}
        </div>
      </>
    );
  }
  // Scanned, waiting to claim on user input
  else if(masterState[0] === 2){
    return (
      <>
        <div class="content">
          <video ref={ref} />
          <h2>Click button to claim</h2>
          <h4>Note this should take a few seconds</h4>
          <br></br>
          <div>Contract to Claim On: </div>
          <div>{splitRes[4]}</div>
          <br></br>
          <div>Private Key to Claim: </div>
          <div>{splitRes[5]}</div>
          {/* <br></br>
          <br></br>
          <span>Current State: </span>
          <span>{masterState[0]}</span>     */}

          <button onClick={()=>setClick(true)} class="button"><span>Click here to claim</span></button>
        </div>
      </>
    );
  }
  // claimed
  else if(masterState[0] === 3){
    return (
      <>
        <div class="content">
          <video ref={ref} />
          <h2>Claimed!</h2>
          <br></br>
          <div>Contract Claimed On: </div>
          <div>{splitRes[4]}</div>
          <br></br>
          <div>Private Key Claimed: </div>
          <div>{splitRes[5]}</div>
          {/* <br></br>
          <br></br>
          <span>Current State: </span>
          <span>{masterState[0]}</span>     */}
          <img src={logo} alt="green check" width="50" height="60" class="img_center"></img>
        </div>
      </>
    );
  }
  
};
