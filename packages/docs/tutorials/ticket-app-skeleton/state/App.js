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


async function connectNear(privateKey, contractId){

}

async function setup(){
  
}


function App() {
  
}

export default App
// ReactDOM.render(<AppRouter />, document.getElementById("root"));
