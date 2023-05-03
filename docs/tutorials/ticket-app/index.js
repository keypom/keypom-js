import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './state/App';
import { BrowserRouter } from "react-router-dom";
import { Buffer } from "buffer"; global.Buffer = Buffer;

// CREATED WITH V1-4 30 uses with pw and every 2nd minting nft
//ed25519:4Yc94z2jETj2c4iMRuAexRZsYadYtXBoHsmUuN9XUtwj
// https://testnet.mynearwallet.com/linkdrop/v1-4.keypom.testnet/t5PWmHyFh5bKFpycSzEApJ4GMjofGZM3pvYpzkNkm6Wa1cDMaotfbYQ67Jwjtrqp9hu8aa1j32Zf9BJEzK1CMLM

// CREATED WITH V1-4, 1000 uses simple drop no pw
// Public Keys and Linkdrops:  {
// 'ed25519:GUeRZniVhEA4DRfikBoiZFZyEdzja3jo3jFLvyLeRd32'
//'https://wallet.testnet.near.org/linkdrop/v1-4.keypom.testnet/4aJGvd5za9nTWJcZBVAgEyaaU6kymPSyoXhtJLfNNx5XA1aWSXxDAqBnrPDBcm7PT5hCwk8L3nDExBYWKoB7HEix'

               
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>,
  // </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals


// 10 keys, 2 each with null 1st and nft mint second. tabbed entry indicates key in use or depleted
// --- 'ed25519:6Ug2EqRAFSPk5o18aMc7F27EUJjtYwqgKcQvWobUtHZC': 'https://testnet.mynearwallet.com/linkdrop/v1-4.keypom.testnet/qKfzzz2y15p91HzSh5xxZA6GGx2V3DmNEAzgtbo5HZVn7PsqaRj6g3P6i5KQ28bKy2R2E61WA5f6jXzNJFmKziN',
// --- 'ed25519:6V4PTNFKgqQet3b5ckB1wwEtT389CDD5rik4SVMTu6kP': 'https://testnet.mynearwallet.com/linkdrop/v1-4.keypom.testnet/rtQ9LyqNcbGGJknZeZDk7w37dApUk1GnHCVRb7d5AaqxuytMUf6bh6HQsE3C2uWCakFaa2Z4QJipkFs6WwZafB5',
// 'ed25519:sBb3B1FsjxFHFJCWfMKchyaZWsSsK1U52iwvF9EXmCk': 'https://testnet.mynearwallet.com/linkdrop/v1-4.keypom.testnet/3yCwKjw6jSMk4Dbn939mpLVrGBDH4mFd7yRcS8M5Us1LgEhwePMXQ7XczASt7L6qYDHBnvmP1wWnGcF6sgZzo28Y',
// 'ed25519:FUteBnVMTquBS2Fq8NL4krcCX4Bbj7opiLGSnnHHbYvB': 'https://testnet.mynearwallet.com/linkdrop/v1-4.keypom.testnet/rwT4ZetJdHdBhGnV7iMD8zqJ4o9bjjBwNJYFcV32CgaQBXDNbHMcp3Df4rP3iCER28ZwrFhKNDaTGhJYPCoFNaT',
// 'ed25519:DW6Ux6XJhYLajej5VB8svyZ5MGeCMozeazxRSuA4CHtm': 'https://testnet.mynearwallet.com/linkdrop/v1-4.keypom.testnet/c5B7yjwTHwkquKjYT5z2hGvXsHS3kdKvy2v5NChdJVaQGeJfTsMhs3VM7tfq28f7FqLBNZNJSUQB2nUuesRMmCu',
// 'ed25519:2nbNNfo1tm5pcMniq8r6HSkq2gLhK9M1iCwGZ59JPhQF': 'https://testnet.mynearwallet.com/linkdrop/v1-4.keypom.testnet/5QN4aFbfMwAtm8ubasKX6VbqH7i4K33HznfLTpRpQYKv9oG2dBNbRg1pYooYbC7kSbJ3qgA6pSySwEha71XvN5oH',
// 'ed25519:FY7Ws3yW7TmbEhJGkpcM8tx4Lowt5Z6wqC9z8fJYXUGS': 'https://testnet.mynearwallet.com/linkdrop/v1-4.keypom.testnet/2Uj5a2e9AjWG6p8SqMNCEJGKAW5QiVjtgmqGShDWYE3GY5oYWz9mzC19vPyLUmAXNuhxCN9r6TF3D6vhdYTahVUn',
// 'ed25519:Gd7v5NaL2fCwNsMdDiRiwtXBBhe9LHo1CSoRCDs1unev': 'https://testnet.mynearwallet.com/linkdrop/v1-4.keypom.testnet/3J744n3zT29Dc4GzrnGbdNiwMM5cZv9eJdCd6WxAbJQy48RSfMWvnzbwcn6tgBYYPYtqcEeGhxU4pVdjmCx3yBZc',
// 'ed25519:DULssBcpvFpnMQ4sPnGrpqSrqyuTnHErFTzNfJERvf7e': 'https://testnet.mynearwallet.com/linkdrop/v1-4.keypom.testnet/25J9zdomMM9uDttmJRefwJwSpKsv7VRccvbqym8QEUu3PnjiRhye5h8U9hUdnq7bp72x56eABLNXYaThqVNVeWnL',
// 'ed25519:3CSopDVtq4uGno5tAes3Ld1tBE8jM1qJmMTsYt86PMxy': 'https://testnet.mynearwallet.com/linkdrop/v1-4.keypom.testnet/3JPaXXbdiDr3JVXx6qR1bce2byrTbgBeVKzYCWZ7jSwuKgangetNiYG5NY4NtUzxbaV1LDLtqqDoMuvE19zNa9jb'



// OLD
// https://wallet.testnet.near.org/linkdrop/v1-3.keypom.testnet/2TJ9RbP3UtNyJGTD9EKdabavTMSJC97hcnGQjXwbC7uRPn7TZaUspoXEKzFEThgyJqatyCVung3yySQGGEBumXd2
// curPks:  [ 'ed25519:4X3TdmDCEuVg6ifBoU3v3r75XqUk6w37HiapucsQ497W' ]
