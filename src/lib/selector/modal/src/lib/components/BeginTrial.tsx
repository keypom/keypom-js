import React, { createRef, useState } from "react";
import { accountExists } from "../../../../../keypom-utils";
import { claimTrialAccountDrop } from "../../../../../trial-accounts/pre-trial";
import { BeginTrialCustomizations, MODAL_DEFAULTS } from "../modal.types";
import { MainBody } from "./MainBody";
import AccountFormAccountId from "./AccountIdForm/AccountFormAccountId";
import { getEnv } from "../../../../../keypom";

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
  const [accountId, setAccountId] = useState("");
  const [isClaimingTrial, setIsClaimingTrial] = useState(false);
  const [dropClaimed, setDropClaimed] = useState(false);
  const [validAccountName, setValidAccountName] = useState(true);
  const [doesAccountExist, setDoesAccountExist] = useState(false);

  const { networkId } = getEnv();
  const accountSuffix = networkId! == "testnet" ? "testnet" : "near";

  const checkNewAccount = async (accountId) => {
    console.log("accountId in check: ", accountId);
    if (!ACCOUNT_ID_REGEX.test(accountId)) {
      setValidAccountName(false);
      return false;
    }

    if (await accountExists(accountId)) {
      setDoesAccountExist(true);
      return false;
    }

    return true;
  };

  const handleChange = (value) => {
    if (value.length > 0) {
      setAccountId(`${value}.${accountSuffix}`);
    } else {
      setAccountId(value);
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

          <AccountFormAccountId
            handleChange={handleChange}
            type="create"
            pattern={/[^a-zA-Z0-9_-]/}
            checkAvailability={checkNewAccount}
            accountId={accountId}
            placeholder={
              customizations?.landing?.fieldPlaceholder ||
              MODAL_DEFAULTS.beginTrial.landing.fieldPlaceholder
            }
            autoFocus={true}
            accountIdSuffix={accountSuffix}
          />

          {/* <InputWrapper>
            <input
              type="text"
              value={accountId}
              onInput={(e) => updateSuffix(e.target.value.trim())}
              onChange={(e) =>
                handleChangeAccountId({
                  userValue: e.target.value.trim(),
                  el: e.target,
                })
              }
              placeholder={
                customizations?.landing?.fieldPlaceholder ||
                MODAL_DEFAULTS.beginTrial.landing.fieldPlaceholder
              }
              required
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              disabled={disabled}
              style={{
                width: "100%",
                padding: "8px",
                marginBottom: "48px",
                border: "1px solid",
                borderRadius: "8px",
              }}
            />
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
          </InputWrapper> */}
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
