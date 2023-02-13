import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './state/App';
import reportWebVitals from './reportWebVitals';
import { Buffer } from "buffer"; global.Buffer = Buffer;

// FOR REF
// https://wallet.testnet.near.org/linkdrop/v1-3.keypom.testnet/2TJ9RbP3UtNyJGTD9EKdabavTMSJC97hcnGQjXwbC7uRPn7TZaUspoXEKzFEThgyJqatyCVung3yySQGGEBumXd2
// curPks:  [ 'ed25519:4X3TdmDCEuVg6ifBoU3v3r75XqUk6w37HiapucsQ497W' ]


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
