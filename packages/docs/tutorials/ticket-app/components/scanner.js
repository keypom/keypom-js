import React from "react";
import { useZxing } from "react-zxing";
import { useState, useEffect } from "react";
import logo from "../static/img/green-check.png"
import xLogo from "../static/img/red-x.png"
import "../styles.css";
import { allowEntry } from "../utils/allowEntry";

export const Scanner = () => {
  // Stage enum
  const Stage = {
    preClaim: "Pre-claim",
    claiming: "Claiming",
    successClaim: "Success",
    failClaim: "Fail"
  }

  // Data enum
  const Data = {
    empty: "Empty",
    captured: "Captured",
  }

  // State Variables
  const [result, setResult] = useState("");
  const [splitRes, setSplitRes] = useState([]);
  const [resPrivKey, setResPrivkey] = useState("")
  const [password, setPassword] = useState("NULL")
  const [masterStatus, setMasterStatus] = useState({ stage: Stage.preClaim, data: Data.empty })

  // Scanner and getting results of scan
  const { ref } = useZxing({
    onResult(result) {
      setResult(result.getText());
      setSplitRes([...result.getText().split("/")]);
      setResPrivkey(result.getText().split("/")[1])

      //indicate new data
      let tempMaster = {
        stage: Stage.claiming,
        data: Data.captured
      }
      setMasterStatus(tempMaster)
    },
  });

  // Functions that only run when scanner is mounted 
  // Get password
  useEffect(() => {
    let PASSWORD = "NULL"
    PASSWORD = prompt("Enter base password for drop")
    setPassword(PASSWORD)
  }, [])

  // Claiming the drop using password
  useEffect(() => {
    function timeout(delay) {
      return new Promise(res => setTimeout(res, delay));
    }

    async function scannerClaim() {
      let isAllowedIn = await allowEntry({
        privKey: resPrivKey,
        basePassword: password
      })

      // Successful Claim
      if (isAllowedIn) {
        setMasterStatus({
          stage: Stage.successClaim,
          data: Data.captured
        })
      } else { // Failed Claim
        setMasterStatus({
          stage: Stage.failClaim,
          data: Data.captured
        })
      }

      // Wait 3s, then flip go back to pre-claim
      await timeout(3000)
      setMasterStatus({
        stage: Stage.preClaim,
        data: Data.empty
      })
    }
    // Only claim if there is data present
    if (masterStatus.data === Data.captured) {
      scannerClaim()
    }

  }, [masterStatus.data])

  switch (masterStatus.stage) {
    case Stage.preClaim:
      return (
        <>
          <div className="content">
            <div style={{ border: "0.5rem solid white" }}><video ref={ref} /></div>
            <h2>Scan a linkdrop QR code to claim</h2>
            <h4>To re-enter password, refresh the page</h4>
          </div>
        </>
      );
    case Stage.claiming:
      return (
        <>
          <div className="content">
            <div style={{ border: "0.5rem solid yellow" }}><video ref={ref} /></div>
            <h2>Claiming</h2>
            <h4>Note this should take a few seconds</h4>
          </div>
        </>
      );
    case Stage.successClaim:
      return (
        <>
          <div className="content">
            <div style={{ border: "0.5rem solid green" }}><video ref={ref} /></div>
            <h2>Claimed!</h2>
            <img src={logo} alt="green check" width="50" height="60" className="img_center"></img>
          </div>
        </>
      );
    case Stage.failClaim:
      return (
        <>
          <div className="content">
            <div style={{ border: "0.5rem solid red" }}><video ref={ref} /></div>
            <h2>Could Not Be Claimed!</h2>
            <h3>Ensure Password is Correct</h3>
            <h4>To re-enter password, refresh the page</h4>
            <img src={xLogo} alt="red x" width="50" height="60" className="img_center"></img>
          </div>
        </>
      );
    default:
      let errorMsg = `Error: masterState.stage is ${masterStatus.stage}`
      return (
        <>
          <div className="content">
            <h2>{errorMsg}</h2>
            <img src={xLogo} alt="red x" width="50" height="60" className="img_center"></img>
          </div>
        </>
      );
  }
};
