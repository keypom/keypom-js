import React, { useState } from "react";
import { MODAL_DEFAULTS } from "../modal.types";
import { MainBody } from "./MainBody";

interface ClaimTrialProps {
    hide: () => void;
}

export const ClaimTrial: React.FC<ClaimTrialProps> = ({
    hide
}) => {
    const [accountId, setAccountId] = useState("");
    const [validName, setValidName] = useState(true);

    const handleSubmit = async (event) => {
        event.preventDefault();
        alert(`The name you entered was: ${accountId}`);
    }

    return (
        <div className="nws-modal" style={{ width: "70%", height: "27%" }}>
            <div className="modal-right" style={{ width: "100%" }}>
                <MainBody
                    title={MODAL_DEFAULTS.claimTrial.mainBody.title}
                    body={MODAL_DEFAULTS.claimTrial.mainBody.body}
                    headerOne={null}
                    headerTwo={null}
                    onCloseModal={() =>
                        hide()
                    }
                />
                <form onSubmit={handleSubmit}>
                    <label>Enter your name:
                        <input
                            type="text"
                            value={accountId}
                            onChange={(e) => { console.log('e.target.value: ', e.target.value); setAccountId(e.target.value) }}
                        />
                    </label>
                    <input type="submit" />
                </form>
            </div>
        </div>
    );
};