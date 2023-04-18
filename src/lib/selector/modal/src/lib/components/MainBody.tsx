import React from "react";
import { MainBodyButton, MainBodyImage, MODAL_DEFAULTS } from "../modal.types";
import { CloseModalButton } from "./CloseModalButton";

interface MainBodyProps {
  title: string;
  body: string;
  imageOne: MainBodyImage | null;
  imageTwo: MainBodyImage | null;
  button: MainBodyButton | null;
  onCloseModal: () => void;
}

export const MainBody: React.FC<MainBodyProps> = ({
  title,
  body,
  imageOne,
  imageTwo,
  button,
  onCloseModal,
}) => {
  return (
    <div className="wallet-home-wrapper">
      <div className="nws-modal-header-wrapper">
        <div className="nws-modal-header">
          <h3 className="middleTitle">{title}</h3>
          <CloseModalButton onClick={onCloseModal} />
        </div>
      </div>
      <>
        <h4>{body}</h4>
        <div>
          {imageOne && (
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
                    d={
                      imageOne.data
                    }
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>
                </svg>
              </div>
              <div className="content-side">
                <h3>
                  {imageOne.title}
                </h3>
                <p>
                  {imageOne.body}
                </p>
              </div>
            </div>
          )}
          {imageTwo && (
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
                    d={
                      imageTwo.data
                    }
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
                <h3>
                  {imageTwo.title}
                </h3>
                <p>
                  {imageTwo.body}
                </p>
              </div>
            </div>
          )}

          {button && (
            <button
              className="middleButton"
              onClick={() => {
                if (button.newTab) {
                  window.open(button.url, "_blank");
                } else {
                  window.location.replace(button.url || "https://keypom.xyz/");
                  window.location.reload();
                }
              }}
            >
              {button.text || "Next Steps"}
            </button>
          )}
        </div>
      </>
    </div>
  );
};
