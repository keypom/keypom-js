import React from "react";
import { useZxing } from "react-zxing";
import { initKeypom, claim, hashPassword, getPubFromSecret, getKeyInformation } from "keypom-js";
import * as nearAPI from "near-api-js";
import { NETWORK_ID, ACCOUNT_ID } from "../utils/configurations";
import { useState, useEffect } from "react";
import logo from "../static/img/green-check.png" 
import xLogo from "../static/img/red-x.png"
import "../styles.css";
const { keyStores, connect } = nearAPI; 



export const Scanner = () => {
  const [result, setResult] = useState("");
  const [splitRes, setSplitRes] = useState([]);
  const [resPrivKey, setResPrivkey] = useState("")
  const [password, setPassword] = useState("NULL")

  var arr = [1, false];
  const [masterState, setMasterState] = useState(arr)
  // [stage, data bool]

  // Scanner and getting results of scan
  const { ref } = useZxing({
    onResult(result) {
      setResult(result.getText());
      setSplitRes([...result.getText().split("/")]);
      setResPrivkey(result.getText().split("/")[1])

      //indicate new data
      var tempState = [...masterState]
      tempState[1] = true
      tempState[0] = 2
      setMasterState([...tempState])
    },
  });

  // Functions that only run when scanner is mounted 
  // connect to NEAR, initKeypom, and get password
  useEffect(() => {
      let PASSWORD = "NULL"
      PASSWORD = prompt("enter base password for drop")
      setPassword(PASSWORD)
  }, [])

  // Claiming the drop using password
  useEffect(() => {
      function timeout(delay) {
          return new Promise( res => setTimeout(res, delay) );
      }

      async function scannerClaim(){
        try{
          // Test 1: Check if Key exists, get curUse
          var publicKey = await getPubFromSecret(resPrivKey)
          var resKeyInfo = await getKeyInformation({publicKey: publicKey})
          if(resKeyInfo == null){
            // Key does not exist
            throw new Error(`Key does not exist`)
          }
          var resCurUse = resKeyInfo.cur_key_use 

          // Test 2: Only claim if it has never been scanned
          if(resCurUse == 1){
            // Create password using base + pubkey + key use as string
            let passwordForClaim = await hashPassword(password + publicKey + resCurUse.toString())
            // Claim with created password
            await claim({
                secretKey: resPrivKey,
                accountId: "minqi.testnet",
                password: passwordForClaim
            })
          }
          else{
            // Ticket was already scanned
            throw new Error(`The Key has already been scanned`)
          }

          // Test 3: Check if curUse decremented
          var newKeyInfo = await getKeyInformation({publicKey: publicKey})
          if(newKeyInfo.cur_key_use - resCurUse === 1){
            // Successful Claim
            var tempState = [...masterState]
            tempState[0] = 3
            setMasterState([...tempState])
            // Wait 3s, then flip go back to stage 1
            await timeout(3000)
            var emptyRes = new Array(splitRes.length)
            setSplitRes(emptyRes)
            setResPrivkey("")
            var arr = [1, false];
            setMasterState(arr)
          }
          else if(newKeyInfo.cur_key_use === resCurUse ){
            // Claim Failed
            throw new Error(`Claim has failed, check password`)
          }
        }
        catch(err){
          // Claim Failed
          console.log(`Claim Failed: ${err}`)
          var tempState = [...masterState]
          tempState[0] = 4
          setMasterState([...tempState])
          // Wait 3s, then flip go back to stage 1
          await timeout(3000)
          var emptyRes = new Array(splitRes.length)
          setSplitRes(emptyRes)
          setResPrivkey("")
          var arr = [1, false];
          setMasterState(arr)
        }
      }
      // Only claim if there is data present
      if(masterState[1] === true){
        scannerClaim()
      }

  }, [masterState[1]])

  // Scanner open, waiting to read data
  if(masterState[0] === 1){
    return (
      <>
        <div className="content">
        <div style={{border:"0.5rem solid white"}}><video ref={ref} /></div>
          <h2>Scan a linkdrop QR code to claim</h2>
          <h4>To re-enter password, refresh the page</h4>
        </div>
      </>
    );
  }
  // Claiming, waiting to finish claim
  else if(masterState[0] === 2){
    return (
      <>
        <div className="content">
          <div style={{border:"0.5rem solid yellow"}}><video ref={ref} /></div>
          <h2>Claiming</h2>
          <h4>Note this should take a few seconds</h4>
        </div>
      </>
    );
  }
  // claimed
  else if(masterState[0] === 3){
    return (
      <>
        <div className="content">
          <div style={{border:"0.5rem solid green"}}><video ref={ref} /></div>
          <h2>Claimed!</h2>
          <img src={logo} alt="green check" width="50" height="60" className="img_center"></img>
        </div>
      </>
    );
  }
  // Failed to claim
  else if(masterState[0] === 4){
    return (
      <>
        <div className="content">
          <div style={{border:"0.5rem solid red"}}><video ref={ref} /></div>
          <h2>Could Not Be Claimed!</h2>
          <h3>Ensure Password is Correct</h3>
          <h4>To re-enter password, refresh the page</h4>
          <img src={xLogo} alt="red x" width="50" height="60" className="img_center"></img>
        </div>
      </>
    );
  }
};
