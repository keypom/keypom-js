import React, { useState } from "react";
import { accountExists } from "../../../../../keypom-utils";
import { claimTrialAccountDrop } from "../../../../../trial-accounts/pre-trial";
import { BeginTrialCustomizations, MODAL_DEFAULTS } from "../modal.types";
import { MainBody } from "./MainBody";

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
  const [accountId, setAccountId] = useState("");
  const [isClaimingTrial, setIsClaimingTrial] = useState(false);
  const [dropClaimed, setDropClaimed] = useState(false);
  const [validName, setValidName] = useState(true);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const exists = await accountExists(accountId);

    if (exists) {
      alert(
        `The account: ${accountId} already exists. Please choose a new one.`
      );
    } else {
      alert(`The account: ${accountId} is available. Click the claim.`);
      setIsClaimingTrial(true);

      await claimTrialAccountDrop({ desiredAccountId: accountId, secretKey });

      setIsClaimingTrial(false);
      setDropClaimed(true);
    }
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
          <input
            type="text"
            value={accountId}
            placeholder={
              customizations?.landing?.fieldPlaceholder ||
              MODAL_DEFAULTS.beginTrial.landing.fieldPlaceholder
            }
            onChange={(e) => setAccountId(e.target.value)}
            style={{
              padding: "8px",
              marginBottom: "16px",
              border: "1px solid",
              borderRadius: "4px",
            }}
          />
          <br />
          <button className="middleButton" onClick={handleSubmit}>
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
          button={{
            text:
              customizations?.claimed?.buttonText ||
              MODAL_DEFAULTS.beginTrial.claimed.buttonText,
            url: `${redirectUrlBase}${accountId}${delimiter}${secretKey}`,
            newTab: false,
          }}
          onCloseModal={() => {
            window.location.replace(
              `${redirectUrlBase}${accountId}${delimiter}${secretKey}`
            );
            window.location.reload();
          }}
        />
      </div>
    </div>
  );
};
