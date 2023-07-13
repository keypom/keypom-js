import React, { useState } from "react";
import { BeginTrialCustomizations, MODAL_DEFAULTS } from "../modal.types";
import { MainBody } from "./MainBody";
import { accountExists, claim, getCurMethodData, getEnv, getPubFromSecret } from "@keypom/core";

/**
 * regex for the body of an account not including TLA and not allowing subaccount
 */
export const accountAddressPatternNoSubaccount = /^([a-z\d]+[-_])*[a-z\d]+$/;

interface BeginTrialProps {
  customizations?: BeginTrialCustomizations;
  includedCid?: string;
  secretKey: string;
  redirectUrlBase: string;
  delimiter: string;
  hide: () => void;
}

export const BeginTrial: React.FC<BeginTrialProps> = ({
  hide,
  secretKey,
  redirectUrlBase,
  includedCid,
  delimiter,
  customizations,
}) => {
  const [userInput, setUserInput] = useState("");
  const [accountId, setAccountId] = useState("");
  const [isClaimingTrial, setIsClaimingTrial] = useState(false);
  const [dropClaimed, setDropClaimed] = useState(false);

  const [borderColor, setBorderColor] = useState("grey");
  const [messageText, setMessageText] = useState<string>(
    customizations?.landing?.subText?.landing ||
      MODAL_DEFAULTS.beginTrial.landing.subText.landing
  );

  const { networkId } = getEnv();
  const accountIdSuffix = networkId == "testnet" ? "testnet" : "near";

  const handleChangeInput = async (e) => {
    let userInput = e.target.value.toLowerCase();
    setUserInput(userInput);
    const actualAccountId = `${userInput}.${accountIdSuffix}`;
    setAccountId(actualAccountId);

    if (!userInput.length) {
      setMessageText(
        customizations?.landing?.subText?.landing ||
          MODAL_DEFAULTS.beginTrial.landing.subText.landing
      );
      setBorderColor("grey");
      return;
    }

    const isValid = accountAddressPatternNoSubaccount.test(userInput);
    if (!isValid) {
      setMessageText(
        customizations?.landing?.subText?.invalidAccountId ||
          MODAL_DEFAULTS.beginTrial.landing.subText.invalidAccountId
      );
      setBorderColor("red");
      return;
    }

    const exists = await accountExists(actualAccountId);
    if (exists) {
      setMessageText(`${actualAccountId} is taken, try something else.`);
      setBorderColor("red");
      return;
    }

    setMessageText(`${actualAccountId} is available!`);
    setBorderColor("green");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (borderColor === "red") return;
    setIsClaimingTrial(true);

    const curMethodData = await getCurMethodData({ secretKey });
    console.log("curMethodData: ", curMethodData);

    // create an array of null with the length of cur method data
    const fcArgs = Array(curMethodData!.length).fill(null);

    let userFcArgs = {
      INSERT_NEW_ACCOUNT: accountId,
      INSERT_TRIAL_PUBLIC_KEY: getPubFromSecret(secretKey),
    };

    fcArgs[0] = JSON.stringify(userFcArgs);

    await claim({ accountId, secretKey, fcArgs });

    setIsClaimingTrial(false);
    setDropClaimed(true);
  };

  // Landing modal - drop isn't claimed and we're not in the process of claiming
  if (!dropClaimed && !isClaimingTrial) {
    return (
      <div
        className="nws-modal"
        style={{ width: "100%", height: "auto", maxWidth: "500px" }}
      >
        <div className="modal-right" style={{ width: "100%" }}>
          <MainBody
            title={
              customizations?.landing?.title ||
              MODAL_DEFAULTS.beginTrial.landing.title
            }
            body={
              customizations?.landing?.body ||
              MODAL_DEFAULTS.beginTrial.landing.body
            }
            imageOne={null}
            imageTwo={null}
            button={null}
            onCloseModal={() => hide()}
          />
          <div
            style={{
              position: "relative",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
              }}
            >
              <input
                type="text"
                value={userInput}
                onChange={handleChangeInput}
                placeholder={
                  customizations?.landing?.fieldPlaceholder ||
                  MODAL_DEFAULTS.beginTrial.landing.fieldPlaceholder
                }
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid",
                  borderRadius: "8px",
                  marginRight: "8px",
                  borderColor: borderColor,
                }}
              />
              <span>.{accountIdSuffix}</span>
            </div>
            <div
              style={{
                position: "absolute",
                top: "42px",
                left: 0,
                color: borderColor,
              }}
            >
              <sub>{messageText}</sub>
            </div>
          </div>
          <div style={{ marginBottom: "32px" }} />
          <div className="nws-modal-body wallet-info-wrapper what-wallet-hide ">
            <button
              disabled={borderColor === "red"}
              className="middleButton"
              onClick={handleSubmit}
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "8px",
              }}
            >
              {customizations?.landing?.buttonText ||
                MODAL_DEFAULTS.beginTrial.landing.buttonText}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Claiming modal - drop is not claimed and we're in the process of claiming
  if (isClaimingTrial) {
    return (
      <div
        className="nws-modal"
        style={{ width: "100%", height: "auto", maxWidth: "500px" }}
      >
        <div className="modal-right" style={{ width: "100%" }}>
          <MainBody
            title={
              customizations?.claiming?.title ||
              MODAL_DEFAULTS.beginTrial.claiming.title
            }
            body={
              customizations?.claiming?.body ||
              MODAL_DEFAULTS.beginTrial.claiming.body
            }
            imageOne={null}
            imageTwo={null}
            button={null}
            onCloseModal={() => console.log("cant close... claiming.")}
          />
        </div>
      </div>
    );
  }

  // Drop was claimed
  return (
    <div
      className="nws-modal"
      style={{ width: "100%", height: "auto", maxWidth: "500px" }}
    >
      <div className="modal-right" style={{ width: "100%" }}>
        <MainBody
          title={
            customizations?.claimed?.title ||
            MODAL_DEFAULTS.beginTrial.claimed.title
          }
          body={
            customizations?.claimed?.body ||
            MODAL_DEFAULTS.beginTrial.claimed.body
          }
          imageOne={null}
          imageTwo={null}
          button={null}
          onCloseModal={() => {
            window.location.replace(
              `${redirectUrlBase}${accountId}${delimiter}${secretKey}${includedCid !== undefined ? `?cid=${includedCid}` : ""}`
            );
            window.location.reload();
          }}
        />
        <div className="nws-modal-body wallet-info-wrapper what-wallet-hide ">
          <button
            className="middleButton"
            onClick={() => {
              window.location.replace(
                `${redirectUrlBase}${accountId}${delimiter}${secretKey}${includedCid !== undefined ? `?cid=${includedCid}` : ""}`
              );
              window.location.reload();
            }}
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "8px",
            }}
          >
            {customizations?.claimed?.buttonText ||
              MODAL_DEFAULTS.beginTrial.claimed.buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};
