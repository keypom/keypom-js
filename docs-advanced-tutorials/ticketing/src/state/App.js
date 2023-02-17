import QrCode from "../components/qrcode";
import KeyInfo from "./keyInfo";
// import "./styles.css";
import React from "react";
import { useState, useEffect } from "react";
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import * as nearAPI from "near-api-js";
import { NETWORK_ID, ACCOUNT_ID } from "../utils/configurations";
import { Scanner } from "../components/scanner";
import "../styles.css";
import { initKeypom, formatLinkdropUrl } from "keypom-js";
const { keyStores, connect } = nearAPI;


function App() {
  // state variables
  const [contractId, setContractId] = useState("")
  const [privKey, setprivKey] = useState("")
  const [splitRes, setSplitRes] = useState([])
  const [pubKey, setPubkey] = useState("");
  const [curUse, setCurUse] = useState(0);
  const [link, setLink] = useState("")


  useEffect(() => {
    function makeLink(privateKey){
      var tempLink = formatLinkdropUrl({
        baseUrl: "https://testnet.mynearwallet.com/linkdrop",
        secretKeys: [privateKey]
      })
      setLink(tempLink)
    }

    async function connectNear(privateKey){
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

      makeLink(privateKey)
    }
    //setting contract id, priv key and link state variables.
    const splitResultTemp = window.location.href.split("/");
    setSplitRes(splitResultTemp)
    setContractId(splitResultTemp[3])
    setprivKey(splitResultTemp[4])
    connectNear(splitResultTemp[4])
  }, [])
//'https://wallet.testnet.near.org/linkdrop/v1-4.keypom.testnet/4aJGvd5za9nTWJcZBVAgEyaaU6kymPSyoXhtJLfNNx5XA1aWSXxDAqBnrPDBcm7PT5hCwk8L3nDExBYWKoB7HEix'

  // make hasInternet state var and toggle it everytime in scenario 2
  // use hasInternet as a flag to call a useEffect to create link

  // put link creation in useEffect  

  // rendering stuff
  console.log(curUse)
  if(curUse == 1){
    // use 1, should show qr code 
    console.log("scenario 1, QR code")
    const homepath = `${contractId}/${privKey}`
    return (
      <div className="content">
          <Routes>
            <Route path="/scanner" element={ <Scanner/> } />
            <Route path={homepath} element={
            <>
              <h1>🎟️This is your ticket🔑</h1>
              <h4>Screenshot and show me at the door</h4>
              <br></br>
              <QrCode link={link} />
              <br></br>
              <KeyInfo contractId={contractId} privKey={privKey} curUse={curUse} setCurUse={setCurUse} pubKey={pubKey} setPubkey={setPubkey} />
            </>}/>
          </Routes>
      </div>
    );
  }
  else if(curUse==2){
    //use 2 direct to claim
    console.log("scenario 2, no QR code")
    const homepath = `${contractId}/${privKey}`
    return (
      <div className="content">
          <Routes>
            <Route path="/scanner" element={ <Scanner/> } />
            <Route path={homepath} element={
            <>
              <h1>You're all set! Enjoy the event</h1>
              <a href={link} target="_blank" rel="noopener noreferrer"><button className="onboard_button">Continue Onboarding to NEAR</button></a>
              <KeyInfo contractId={contractId} privKey={privKey} curUse={curUse} setCurUse={setCurUse} pubKey={pubKey} setPubkey={setPubkey} />
            </>}/>
          </Routes>
        
        
      </div>
      
    );
  }
  else{
    //no man's land, for trouble shooting
    console.log("Key uses greater than 2 or less than 1")
    console.log(privKey)
    const homepath = `${contractId}/${privKey}`
    return (
      <div className="content">
          <Routes>
            <Route path="/scanner" element={ <Scanner/> } />
            <Route path={homepath} element={
            <>
              <h1>Current uses: {curUse}</h1>
              <div>If Current Uses greater than 2, use another key.</div>
              <div>If Current Uses greater 0, the public key was depleted and deleted.</div>
              <br></br>
              <h4>Current Public Key</h4>
              <div>{pubKey}</div>
              <KeyInfo contractId={contractId} privKey={privKey} curUse={curUse} setCurUse={setCurUse} pubKey={pubKey} setPubkey={setPubkey} />
            </>}/>
          </Routes>
        
        
      </div>
      
    );
  }
  
}

export default App
// ReactDOM.render(<AppRouter />, document.getElementById("root"));
