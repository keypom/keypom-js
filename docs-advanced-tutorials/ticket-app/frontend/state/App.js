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


async function connectNear(privateKey, contractId){
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
      network: NETWORK_ID,
      keypomContractId: contractId
  });
  let resQrText = `${contractId}/${privateKey}`
  return resQrText
}

async function setup(){
  // Setting contract id, priv key and link state variables.
  splitResTemp = window.location.href.split("/");
  tempContractId = splitResTemp[3]
  tempPrivKey = splitResTemp[4]
  tempQrText = await connectNear(tempPrivKey, tempContractId)
  console.log(tempQrText)
}

let tempContractId = ""
let tempPrivKey = ""
let tempQrText = ""
let splitResTemp = ""
setup()


function App() {
  //state variables
  const [contractId, setContractId] = useState(tempContractId)
  const [privKey, setprivKey] = useState(tempPrivKey)
  const [splitRes, setSplitRes] = useState(splitResTemp)
  const [pubKey, setPubkey] = useState("");
  const [curUse, setCurUse] = useState(0);
  const [qrText, setQrText] = useState(tempQrText)
  console.log(splitRes)

  // rendering stuff
  if(curUse == 1){
    // QR code
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
              <QrCode link={qrText} />
              <br></br>
              <KeyInfo contractId={contractId} privKey={privKey} curUse={curUse} setCurUse={setCurUse} pubKey={pubKey} setPubkey={setPubkey} />
            </>}/>
          </Routes>
      </div>
    );
  }
  else if(curUse==2){
    // Direct user to claim POAP
    const homepath = `${contractId}/${privKey}`
    let link = formatLinkdropUrl({
      customURL: "https://testnet.mynearwallet.com/linkdrop/CONTRACT_ID/SECRET_KEY",
      secretKeys: privKey
    });
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
  else if(curUse==0 && splitRes[3]==''|| curUse==0 && splitRes[3]==undefined){
    // Event Landing Page
    const homepath = `${contractId}/${privKey}`
    console.log(splitRes[3])
    return (
      <div className="content">
        <h1>Welcome to the Keypom Party!</h1>
          <div>Drinks are on the house tonight!</div>
          <Routes>
            <Route path="/scanner" element={ <Scanner/> } />
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
