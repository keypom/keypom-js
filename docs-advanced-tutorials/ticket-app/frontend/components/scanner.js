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
  // const [click, setClick] = useState(false);
  const [password, setPassword] = useState("NULL")

  var arr = [1, false];
  const [masterState, setMasterState] = useState(arr)
  // [stage, data bool]

  // Scanner and getting results of scan
  const { ref } = useZxing({
    onResult(result) {
      setResult(result.getText());
      setSplitRes([...result.getText().split("/")]);
      setResPrivkey(result.getText().split("/")[5])

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
      function timeout(delay) {
          return new Promise( res => setTimeout(res, delay) );
      }

      async function scannerClaim(){
          try{
            // Get current key use
            var publicKey = await getPubFromSecret(resPrivKey)
            var resKeyInfo = await getKeyInformation({publicKey: publicKey})
            if(resKeyInfo == null){
              throw new Error(`Key info could not be determined`)
            }
            var resCurUse = resKeyInfo.cur_key_use 
          }
          catch(err){
            // Key has been deleted OR key was never part of drop
            // set to a 5th state and then return to 1
            var tempState = [...masterState]
            tempState[0] = 6
            setMasterState([...tempState])
            // Wait 2s, then flip go back to stage 1
            await timeout(3000)
            var emptyRes = new Array(splitRes.length)
            setSplitRes(emptyRes)
            setResPrivkey("")
            var arr = [1, false];
            setMasterState(arr)
            return
          }

          //only claim if first key use, do not allow scanner to claim multiple times
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
            // set to a 5th state and then return to 1
            var tempState = [...masterState]
            tempState[0] = 5
            setMasterState([...tempState])
            // Wait 2s, then flip go back to stage 1
            await timeout(3000)
            var emptyRes = new Array(splitRes.length)
            setSplitRes(emptyRes)
            setResPrivkey("")
            var arr = [1, false];
            setMasterState(arr)
          }
          // check if claim succeeded and then indicate claimed
          var newKeyInfo = await getKeyInformation({publicKey: publicKey})
          if(newKeyInfo.cur_key_use - resCurUse === 1){
            var tempState = [...masterState]
            tempState[0] = 3
            setMasterState([...tempState])
            // Wait 2s, then flip go back to stage 1
            await timeout(3000)
            var emptyRes = new Array(splitRes.length)
            setSplitRes(emptyRes)
            setResPrivkey("")
            var arr = [1, false];
            setMasterState(arr)
          }
          else if(newKeyInfo.cur_key_use === resCurUse ){
            // set to a 4th state and then return to 1
            var tempState = [...masterState]
            tempState[0] = 4
            setMasterState([...tempState])
            // Wait 2s, then flip go back to stage 1
            await timeout(2000)
            var emptyRes = new Array(splitRes.length)
            setSplitRes(emptyRes)
            setResPrivkey("")
            var arr = [1, false];
            setMasterState(arr)
          }
      }

      // only claim if there is data present
      if(masterState[1] === true){
        scannerClaim()
      }

  }, [masterState[1]])
  // Not scanned, just received pw
  if(masterState[0] === 1){
    return (
      <>
        <div className="content">
        <div style={{border:"0.5rem solid black"}}><video ref={ref} /></div>
          <h2>Scan a linkdrop QR code to claim</h2>
          <h4>To re-enter password, refresh the page</h4>
          {/* <br></br>
          <span>Current State: </span>
          <span>{masterState[0]}</span>     */}
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
          {/* <br></br>
          <div>Contract to Claim On: </div>
          <div>{splitRes[4]}</div>
          <br></br>
          <div>Private Key to Claim: </div>
          <div>{splitRes[5]}</div> */}
          {/* <br></br>
          <span>Current State: </span>
          <span>{masterState[0]}</span>     */}

          {/* <button onClick={()=>setClick(true)} className="button"><span>Click here to claim</span></button> */}
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
          {/* <br></br>
          <div>Contract Claimed On: </div>
          <div>{splitRes[4]}</div>
          <br></br>
          <div>Private Key Claimed: </div>
          <div>{splitRes[5]}</div> */}
          {/* <br></br>
          <span>Current State: </span>
          <span>{masterState[0]}</span>     */}
          <img src={logo} alt="green check" width="50" height="60" className="img_center"></img>
        </div>
      </>
    );
  }
  // failed to claim
  else if(masterState[0] === 4){
    return (
      <>
        <div className="content">
          <div style={{border:"0.5rem solid red"}}><video ref={ref} /></div>
          <h2>Could Not Be Claimed!</h2>
          <h3>Ensure Password is Correct</h3>
          <h4>To re-enter password, refresh the page</h4>
          {/* <br></br>
          <div>Contract Claimed On: </div>
          <div>{splitRes[4]}</div>
          <br></br>
          <div>Private Key Claimed: </div>
          <div>{splitRes[5]}</div> */}
          {/* <br></br>
          <span>Current State: </span>
          <span>{masterState[0]}</span>     */}
          <img src={xLogo} alt="red x" width="50" height="60" className="img_center"></img>
        </div>
      </>
    );
  }
  else if(masterState[0] === 5){
    return (
      <>
        <div className="content">
          <div style={{border:"0.5rem solid red"}}><video ref={ref} /></div>
          <h2>Could Not Be Claimed!</h2>
          <h3>Ticket has already been scanned</h3>
          <h4>Attendee may proceed to event and claim POAP</h4>
          {/* <br></br>
          <div>Contract Claimed On: </div>
          <div>{splitRes[4]}</div>
          <br></br>
          <div>Private Key Claimed: </div>
          <div>{splitRes[5]}</div> */}
          {/* <br></br>
          <span>Current State: </span>
          <span>{masterState[0]}</span>     */}
          <img src={xLogo} alt="red x" width="50" height="60" className="img_center"></img>
        </div>
      </>
    );
  }
  else if(masterState[0] === 6){
    return (
      <>
        <div className="content">
          <div style={{border:"0.5rem solid red"}}><video ref={ref} /></div>
          <h2>Could Not Be Claimed!</h2>
          <h3>The attendee's access key has been depleted and deleted</h3>
          <h4>Attendee may re-enter event</h4>
          {/* <br></br>
          <div>Contract Claimed On: </div>
          <div>{splitRes[4]}</div>
          <br></br>
          <div>Private Key Claimed: </div>
          <div>{splitRes[5]}</div> */}
          {/* <br></br>
          <span>Current State: </span>
          <span>{masterState[0]}</span>     */}
          <img src={xLogo} alt="red x" width="50" height="60" className="img_center"></img>
        </div>
      </>
    );
  }
  
};
