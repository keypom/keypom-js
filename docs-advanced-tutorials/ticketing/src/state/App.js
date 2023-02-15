import QrCode from "../components/qrcode";
import KeyInfo from "./keyInfo";
// import "./styles.css";
import React from "react";
import { useState, useEffect } from "react";
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Scanner } from "../components/scanner";


function App() {
  // state variables
  const [contractId, setContractId] = useState("")
  const [privKey, setprivKey] = useState("")
  const [splitRes, setSplitRes] = useState([])
  const [pubKey, setPubkey] = useState("");
  const [curUse, setCurUse] = useState(0);
  const [link, setLink] = useState("")


  useEffect(() => {
    //setting contract id, priv key and link state variables.
    const splitResultTemp = window.location.href.split("/");
    setSplitRes(splitResultTemp)
    setContractId(splitResultTemp[3])
    setprivKey(splitResultTemp[4])
    setLink(`https://wallet.testnet.near.org/linkdrop/${splitResultTemp[3]}/${splitResultTemp[4]}`)
  }, [])

  // rendering stuff
  if(curUse%2){
    // odd uses, should show qr code 
    console.log("scenario 1, QR code")
    const homepath = `${contractId}/${privKey}`
    return (
      <div class="content">
          <Routes>
            <Route path="/scanner" element={ <Scanner/> } />
            <Route path={homepath} element={
            <>
              <QrCode link={link} />
              <KeyInfo contractId={contractId} privKey={privKey} curUse={curUse} setCurUse={setCurUse} pubKey={pubKey} setPubkey={setPubkey} />
            </>}/>
          </Routes>
      </div>
    );
  }
  else{
    // even uses, should not show qr code
    console.log("scenario 2, no QR code")
    const homepath = `${contractId}/${privKey}`
    return (
      <div class="content">
          <Routes>
            <Route path="/scanner" element={ <Scanner/> } />
            <Route path={homepath} element={
            <>
              <KeyInfo contractId={contractId} privKey={privKey} curUse={curUse} setCurUse={setCurUse} pubKey={pubKey} setPubkey={setPubkey} />
            </>}/>
          </Routes>
        
        
      </div>
      
    );
  }
  
}

export default App
// ReactDOM.render(<AppRouter />, document.getElementById("root"));
