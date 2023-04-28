import React, { createRef, useState } from "react";
import { accountExists, getPubFromSecret } from "../../../../../keypom-utils";
import { claimTrialAccountDrop } from "../../../../../trial-accounts/pre-trial";
import { BeginTrialCustomizations, MODAL_DEFAULTS } from "../modal.types";
import { MainBody } from "./MainBody";
import { getEnv } from "../../../../../keypom";
import { getCurMethodData } from "../../../../../views";
import { claim } from "../../../../../claims";

const ACCOUNT_ID_REGEX =
  /^(([a-z\d]+[-_])*[a-z\d]+\.)*([a-z\d]+[-_])*[a-z\d]+$/;

interface BeginTrialProps {
  customizations?: BeginTrialCustomizations;
  secretKey: string;
  redirectUrlBase: string;
  delimiter: string;
  hide: () => void;
}

export const BeginTrial: React.FC<BeginTrialProps> = ({
  hide,
  secretKey,
  redirectUrlBase,
  delimiter,
  customizations,
}) => {
  const [userInput, setUserInput] = useState("");
  const [accountId, setAccountId] = useState("");
  const [isClaimingTrial, setIsClaimingTrial] = useState(false);
  const [dropClaimed, setDropClaimed] = useState(false);

  const [borderColor, setBorderColor] = useState("");
  const [validAccountName, setValidAccountName] = useState(true);
  const [doesAccountExist, setDoesAccountExist] = useState(false);

  const { networkId } = getEnv();
  const accountIdSuffix = networkId == "testnet" ? ".testnet" : ".near";

  const handleChangeInput = (e) => {
    setDoesAccountExist(false);
    let userInput = e.target.value;

    let validInput = ACCOUNT_ID_REGEX.test(userInput) || userInput.length === 0;

    if (!validInput) {
      setValidAccountName(false);
      setBorderColor("red");
      return;
    }

    setUserInput(userInput);
    setAccountId(`${userInput}${accountIdSuffix}`);

    setBorderColor("");
    setValidAccountName(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const exists = await accountExists(accountId);
    setDoesAccountExist(exists);

    if (exists) {
      setBorderColor("red");
      return;
    }

    setBorderColor("green");
    setIsClaimingTrial(true);

    const curMethodData = await getCurMethodData({secretKey})
    console.log('curMethodData: ', curMethodData);

    // create an array of null with the length of cur method data
    const fcArgs = Array(curMethodData!.length).fill(null);

    let userFcArgs = {
      "INSERT_NEW_ACCOUNT": accountId,
      "INSERT_TRIAL_PUBLIC_KEY": getPubFromSecret(secretKey)
    }

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
              <span>{accountIdSuffix}</span>
            </div>
            <div
              style={{
                position: "absolute",
                top: "42px",
                left: 0,
                color: "red",
              }}
            >
              {!validAccountName && <sub>Invalid character</sub>}
              {doesAccountExist && <sub>Account already exists</sub>}
            </div>
          </div>
          <div style={{ marginBottom: "32px" }} />
          <button
            className="middleButton"
            onClick={handleSubmit}
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid",
              borderRadius: "8px",
            }}
          >
            {customizations?.landing?.buttonText ||
              MODAL_DEFAULTS.beginTrial.landing.buttonText}
          </button>
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
              `${redirectUrlBase}${accountId}${delimiter}${secretKey}`
            );
            window.location.reload();
          }}
        />
        <button
          className="middleButton"
          onClick={() => {
            window.location.replace(
              `${redirectUrlBase}${accountId}${delimiter}${secretKey}`
            );
            window.location.reload();
          }}
          style={{
            width: "100%",
            padding: "8px",
            border: "1px solid",
            borderRadius: "8px",
          }}
        >
          {customizations?.claimed?.buttonText ||
            MODAL_DEFAULTS.beginTrial.claimed.buttonText}
        </button>
      </div>
    </div>
  );
};
