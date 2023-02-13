import QrCode from "../components/qrcode";
import KeyInfo from "./keyInfo";
// import "./styles.css";
import React from "react";
import { useState, useEffect } from "react";


function App() {
  // state variables
  const [contractId, setContractId] = useState("")
  const [privKey, setprivKey] = useState("")
  const [pubKey, setPubkey] = useState("");
  const [curUse, setCurUse] = useState(0);
  const [link, setLink] = useState("")


  useEffect(() => {
    //setting contract id, priv key and link state variables.
    const cu = window.location.href.slice(22, -89);
    setContractId(cu)
    const cp = window.location.href.slice(42)
    setprivKey(cp)
    const cd = window.location.href
    setLink(cd)
  }, [])

  // rendering stuff
  if(curUse%2){
    console.log("scenario 1")
    return (
      <div className="section container" style={{
        position: 'absolute', left: '50%', top: '50%',
        transform: 'translate(-50%, -50%)'
      }}>
        <KeyInfo contractId={contractId} privKey={privKey} curUse={curUse} setCurUse={setCurUse} pubKey={pubKey} setPubkey={setPubkey}/>
        {/* <p>current contract id = {contractId}</p>
        <p>current private key = {privKey}</p> */}
      </div>
    );
  }
  else{
    console.log("scenario 2")
    return (
      <div className="section container" style={{
        position: 'absolute', left: '50%', top: '50%',
        transform: 'translate(-50%, -50%)'
      }}>
        <QrCode link={link} />
        <KeyInfo contractId={contractId} privKey={privKey} curUse={curUse} setCurUse={setCurUse} pubKey={pubKey} setPubkey={setPubkey}/>
        {/* <p>current contract id = {contractId}</p>
        <p>current private key = {privKey}</p> */}
      </div>
      
    );
  }
  
}

export default App
// ReactDOM.render(<AppRouter />, document.getElementById("root"));
