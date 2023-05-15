import React from "react";
import { useZxing } from "react-zxing";
import { useState, useEffect } from "react";
import logo from "../static/img/green-check.png"
import xLogo from "../static/img/red-x.png"
import "../styles.css";
import { allowEntry } from "../utils/allowEntry";

export const Scanner = () => {

  // Scanner and getting results of scan
  const { ref } = useZxing({
    onResult(result) {

    },
  });

  // Functions that only run when scanner is mounted 
  // connect to NEAR, initKeypom, and get password
  useEffect(() => {
  
  }, [])

  // Claiming the drop using password
  useEffect(() => {
      function timeout(delay) {
          
      }

      async function scannerClaim(){
        
      }

  }, [masterStatus.data])

  switch (masterStatus.stage) {
    case Stage.preClaim:

    case Stage.claiming:
      
    case Stage.successClaim:
     
    case Stage.failClaim:
      
    default:
      
    }
};
