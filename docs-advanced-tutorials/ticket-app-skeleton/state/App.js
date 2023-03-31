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

}

async function setup(){
  
}


function App() {
  
}

export default App
// ReactDOM.render(<AppRouter />, document.getElementById("root"));
