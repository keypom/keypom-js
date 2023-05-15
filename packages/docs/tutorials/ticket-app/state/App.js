import QrCode from "../components/qrcode";
import KeyInfo from "./keyInfo";
// import "./styles.css";
import React from "react";
import { useState, useEffect } from "react";
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Scanner } from "../components/scanner";
import "../styles.css";
import { initKeypom, formatLinkdropUrl } from "@keypom/core";
import { Near } from "@near-js/wallet-account";
import { BrowserLocalStorageKeyStore } from "@near-js/keystores-browser";

const NETWORK_ID = "testnet";
async function connectNear(privateKey, contractId){
  const myKeyStore = new BrowserLocalStorageKeyStore();
  const connectionConfig = {
     networkId: NETWORK_ID,
     keyStore: myKeyStore,
     nodeUrl: `https://rpc.${NETWORK_ID}.near.org`,
     walletUrl: `https://wallet.${NETWORK_ID}.near.org`,
     helperUrl: `https://helper.${NETWORK_ID}.near.org`,
     explorerUrl: `https://explorer.${NETWORK_ID}.near.org`,
  };

  const nearConnection = new Near(connectionConfig);
  await initKeypom({
      near: nearConnection,
      network: NETWORK_ID,
      keypomContractId: contractId
  });
}


let contractId;
let privKey;
let qrText;
function setup() {
  // Setting contract id, priv key and link state variables.
  const urlSplit = window.location.href.split("/");

  if (urlSplit.length > 3) {
    contractId = urlSplit[3]
    privKey = urlSplit[4]
    qrText =  `${contractId}/${privKey}`
  }

  if (contractId) {
    connectNear(contractId)
  }
}

setup()

function App() {
  //state variables
  const [curUse, setCurUse] = useState(0);
  const [pubKey, setPubKey] = useState("");
  
  const homepath = `/${contractId}/${privKey}`
  const scannerpath = `/${contractId}/scanner`

  // rendering stuff
  if(curUse == 1){
    // QR code
    console.log("scenario 1, QR code")
    return (
      <div className="content">
          <Routes>
            <Route path={scannerpath} element={ <Scanner/> } />
            <Route path={homepath} element={
            <>
              <h1>🎟️This is your ticket🔑</h1>
              <h4>Screenshot and show me at the door</h4>
              <br></br>
              <QrCode link={qrText} />
              <br></br>
              <KeyInfo contractId={contractId} privKey={privKey} curUse={curUse} setCurUse={setCurUse} pubKey={pubKey} setPubKey={setPubKey} />
            </>}/>
          </Routes>
      </div>
    );
  }
  else if(curUse==2){
    // Direct user to claim POAP
    let link = formatLinkdropUrl({
      customURL: "https://testnet.mynearwallet.com/linkdrop/CONTRACT_ID/SECRET_KEY",
      secretKeys: privKey
    });
    return (
      <div className="content">
          <Routes>
            <Route path={scannerpath} element={ <Scanner/> } />
            <Route path={homepath} element={
            <>
              <h1>You're all set! Enjoy the event</h1>
              <a href={link} target="_blank" rel="noopener noreferrer"><button className="onboard_button">Claim your POAP</button></a>
              <KeyInfo contractId={contractId} privKey={privKey} curUse={curUse} setCurUse={setCurUse} pubKey={pubKey} setPubKey={setPubKey} />
            </>}/>
          </Routes>
      </div>
    );
  }
  else if(curUse==0 && !contractId && !privKey){
    // Event Landing Page
    return (
      <div className="content">
        <h1>Welcome to the Keypom Party!</h1>
          <div>Drinks are on the house tonight!</div>
          <Routes>
            <Route path={scannerpath} element={ <Scanner/> } />
            <Route path={homepath} element={  <KeyInfo contractId={contractId} privKey={privKey} curUse={curUse} setCurUse={setCurUse} pubKey={pubKey} setPubKey={setPubKey} /> }></Route>
          </Routes>
      </div>
    );
  }
  else if(curUse==0){
    // Key has been depleted, show resources for NEAR
    return (
      <div className="content">
          <Routes>
            <Route path={scannerpath} element={ <Scanner/> } />
            <Route path={homepath} element={
            <>
              <h1>Now that you have a wallet...</h1>
              <a href={"https://near.org/learn/#anker_near"} target="_blank" rel="noopener noreferrer"><button className="onboard_button">Continue your journey into NEAR</button></a>
              <KeyInfo contractId={contractId} privKey={privKey} curUse={curUse} setCurUse={setCurUse} pubKey={pubKey} setPubKey={setPubKey} />
            </>}/>
          </Routes>
      </div>
    );
  }
  
  
}

export default App
// ReactDOM.render(<AppRouter />, document.getElementById("root"));
