import { initKeypom, getPubFromSecret, getKeyInformation, getDropInformation } from "keypom-js";
import React from 'react'
import * as nearAPI from "near-api-js";
import { NETWORK_ID, ACCOUNT_ID } from "../utils/configurations";
import { useState, useEffect } from "react";
const { keyStores, connect } = nearAPI;


const KeyInfo = ({ contractId, privKey, curUse, setCurUse, pubKey, setPubkey }) => {
   
}

export default KeyInfo

