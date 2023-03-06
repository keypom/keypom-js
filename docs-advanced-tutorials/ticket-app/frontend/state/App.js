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
  let resLink = formatLinkdropUrl({
    customURL: "https://testnet.mynearwallet.com/linkdrop/CONTRACT_ID/SECRET_KEY",
    secretKeys: privateKey
  })
  return resLink
}

async function setup(){
  //setting contract id, priv key and link state variables.
  const splitResultTemp = window.location.href.split("/");
  tempContractId = splitResultTemp[3]
  tempPrivKey = splitResultTemp[4]
  tempLink = await connectNear(tempPrivKey)
  console.log(tempLink)
}

let tempContractId = ""
let tempPrivKey = ""
let tempLink = ""
setup()


function App() {
  //state variables
  const [contractId, setContractId] = useState(tempContractId)
  const [privKey, setprivKey] = useState(tempPrivKey)
  const [splitRes, setSplitRes] = useState([])
  const [pubKey, setPubkey] = useState("");
  const [curUse, setCurUse] = useState(0);
  const [link, setLink] = useState(tempLink)


  // rendering stuff
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
    const homepath = `${contractId}/${privKey}`
    return (
      <div className="content">
          <Routes>
            <Route path="/scanner" element={ <Scanner/> } />
            <Route path={homepath} element={
            <>
              <h1>You're all set! Enjoy the event</h1>
              <a href={link} target="_blank" rel="noopener noreferrer"><button className="onboard_button">Claim your POAP</button></a>
              <KeyInfo contractId={contractId} privKey={privKey} curUse={curUse} setCurUse={setCurUse} pubKey={pubKey} setPubkey={setPubkey} />
            </>}/>
          </Routes>
      </div>
    );
  }
  else if(curUse==0 && splitRes[3]==''){
    // Event Landing Page
    const homepath = `${contractId}/${privKey}`
    return (
      <div className="content">
        <h1>Welcome to the Keypom Party!</h1>
          <div>Drinks are on the house tonight!</div>
          <Routes>
            <Route path="/scanner" element={ <Scanner/> } />
            {/* if a private key exists, route elements will be valid and then call keyinfo, updating curUse  */}
            <Route path={homepath} element={  <KeyInfo contractId={contractId} privKey={privKey} curUse={curUse} setCurUse={setCurUse} pubKey={pubKey} setPubkey={setPubkey} /> }></Route>
          </Routes>
      </div>
    );
  }
  else if(curUse==0){
    // Key has been depleted, show resources for NEAR
    const homepath = `${contractId}/${privKey}`
    return (
      <div className="content">
          <Routes>
            <Route path="/scanner" element={ <Scanner/> } />
            <Route path={homepath} element={
            <>
              <h1>Now that you have a wallet...</h1>
              <a href={"https://near.org/learn/#anker_near"} target="_blank" rel="noopener noreferrer"><button className="onboard_button">Continue your journey into NEAR</button></a>
              <KeyInfo contractId={contractId} privKey={privKey} curUse={curUse} setCurUse={setCurUse} pubKey={pubKey} setPubkey={setPubkey} />
            </>}/>
          </Routes>
      </div>
    );
  }
  
  
}

export default App
// ReactDOM.render(<AppRouter />, document.getElementById("root"));
