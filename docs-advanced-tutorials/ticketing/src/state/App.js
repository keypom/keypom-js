import QrCode from "../components/qrcode";
import KeyInfo from "./keyInfo";
// import "./styles.css";
import React from "react";
import { useState, useEffect } from "react";


function App() {

  const [contractId, setContractId] = useState("")
  const [privKey, setprivKey] = useState("")
  const [pubKey, setPubkey] = useState("");
  const [link, setLink] = useState("")
  useEffect(() => {
    const cu = window.location.href.slice(22, -89);
    setContractId(cu)
    const cp = window.location.href.slice(42)
    setprivKey(cp)
    const cd = window.location.href
    setLink(cd)
  }, [])
  // const [contractId, setContractId] = useState("N/A")
  // const [privKey, setprivKey] = useState("N/A")
  // useEffect(() => {
  //   const cu = window.location.href.slice(22, -89);
  //   setContractId(cu)
  //   const cp = window.location.href.slice(42)
  //   setprivKey(cp)
  // }, [])

  return (
    <div className="section container" style={{
      position: 'absolute', left: '50%', top: '50%',
      transform: 'translate(-50%, -50%)'
    }}>
      <QrCode link={link} />
      <KeyInfo contractId={contractId} privKey={privKey} />
      {/* <p>current contract id = {contractId}</p>
      <p>current private key = {privKey}</p> */}
    </div>
  );
}

export default App
// ReactDOM.render(<AppRouter />, document.getElementById("root"));
