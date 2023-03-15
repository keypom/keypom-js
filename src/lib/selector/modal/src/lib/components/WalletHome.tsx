import React, { useEffect, useState } from "react";
import { ModalHeader } from "./ModalHeader";
import { translate } from "@near-wallet-selector/core";

interface WalletHomeProps {
  title?: string;
  body?: string;
  headerOne?: any;
  headerTwo?: any;
  button?: any;
  onCloseModal: () => void;
}

export const WalletHome: React.FC<WalletHomeProps> = ({
  title = "Your Trial Has Ended",
  body = "To continue using NEAR, secure your account with a wallet.",
  headerOne = {
    title: translate("modal.wallet.secureAndManage"),
    description: translate("modal.wallet.safelyStore")
  },
  headerTwo = {
    title: translate("modal.wallet.logInToAny"),
    description: translate("modal.wallet.noNeedToCreate")
  },
  button,
  onCloseModal,
}) => {
  return (
    <div className="wallet-home-wrapper">
      <div className="nws-modal-header-wrapper">
        <ModalHeader
          title={title}
          onCloseModal={onCloseModal}
        />
      </div>
      <>
        <h4>{body}</h4>
        <div className="wallet-info-wrapper what-wallet-hide">
          {headerOne && (
            <div className="wallet-what">
              <div className={"icon-side"}>
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 40 40"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M33.5 1.83325L30.1666 5.16658M17.4818 17.8514C19.1406 19.5103 20.1666 21.8019 20.1666 24.3333C20.1666 29.3959 16.0626 33.4999 11 33.4999C5.93735 33.4999 1.8333 29.3959 1.8333 24.3333C1.8333 19.2706 5.93735 15.1666 11 15.1666C13.5313 15.1666 15.8229 16.1926 17.4818 17.8514ZM17.4818 17.8514L24.3333 10.9999M24.3333 10.9999L29.3333 15.9999L35.1666 10.1666L30.1666 5.16658M24.3333 10.9999L30.1666 5.16658"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>
                </svg>
              </div>
              <div className="content-side">
                <h3>{headerOne.title || translate("modal.wallet.secureAndManage")}</h3>
                <p>{headerTwo.description || translate("modal.wallet.safelyStore")}</p>
              </div>
            </div>
          )}
          {headerTwo && (
            <div className="wallet-what">
              <div className={"icon-side"}>
                <svg
                  width="40"
                  height="41"
                  viewBox="0 0 40 41"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="28.3333"
                    cy="23.8333"
                    r="1.66667"
                    fill="currentColor"
                  ></circle>
                  <path
                    d="M35 12.1667H7C5.89543 12.1667 5 11.2712 5 10.1667V7.5C5 6.39543 5.89543 5.5 7 5.5H31.6667"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>
                  <path
                    d="M35 12.1667V35.5H7C5.89543 35.5 5 34.6046 5 33.5V8.83334"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>
                </svg>
              </div>
              <div className="content-side">
                <h3>{headerTwo.title || translate("modal.wallet.logInToAny")}</h3>
                <p>{headerTwo.description || translate("modal.wallet.noNeedToCreate")}</p>
              </div>
            </div>
          )}

          <div className="button-spacing" />
          {button && (
            <button
              className="middleButton"
              onClick={() => {
                window.open(button.url || 'https://keypom.xyz/', '_blank');
              }}
            >
              {button.text || "Next Steps"}
            </button>
          )}
        </div>

        {button && (
          <div className="what-wallet-mobile">
            <button
              className="middleButton"
              onClick={() => {
                window.open(button.url || 'https://keypom.xyz/', '_blank');
              }}
            >
              {button.text || "Next Steps"}
            </button>
          </div>
        )}
        <div className="lang-selector-wrapper">
          <select className="lang-selector" name="lang">
            <option value="en">English</option>
            <option value="es">Spanish</option>
          </select>
        </div>
      </>
    </div>
  );
};
