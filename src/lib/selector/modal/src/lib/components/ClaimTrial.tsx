import React, { useState } from "react";
import { accountExists } from "../../../../../keypom-utils";
import { claimTrialAccountDrop } from "../../../../../trial-accounts";
import { MODAL_DEFAULTS } from "../modal.types";
import { MainBody } from "./MainBody";

interface ClaimTrialProps {
    secretKey: string;
    redirectUrlBase: string;
    delimiter: string;
    hide: () => void;
}

export const ClaimTrial: React.FC<ClaimTrialProps> = ({
    hide,
    secretKey,
    redirectUrlBase,
    delimiter
}) => {
    const [accountId, setAccountId] = useState("");
    const [isClaimingTrial, setIsClaimingTrial] = useState(false);
    const [dropClaimed, setDropClaimed] = useState(false);
    const [validName, setValidName] = useState(true);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const exists = await accountExists(accountId);

        if (exists) {
            alert(`The account: ${accountId} already exists. Please choose a new one.`);
        } else {
            alert(`The account: ${accountId} is available. Click the claim.`);
            setIsClaimingTrial(true);

            await claimTrialAccountDrop({ desiredAccountId: accountId, secretKey })

            setIsClaimingTrial(false);
            setDropClaimed(true);
        }

    }

    return (isClaimingTrial ? (
            <div className="nws-modal" style={{ width: "70%", height: "27%" }} >
                <div className="modal-right" style={{ width: "100%" }}>
                    <MainBody
                        title={"i am claiming the drop"}
                        body={"fuck yea bro"}
                        headerOne={null}
                        headerTwo={null}
                        onCloseModal={() =>
                            hide()
                        }
                    />
                </div>
            </div >
        ) : (
            (dropClaimed ? (
                <div className="nws-modal" style={{ width: "70%", height: "27%" }}>
                    <div className="modal-right" style={{ width: "100%" }}>
                        <MainBody
                            title={"drop was claimed bruh"}
                            body={"click button to enter trial"}
                            headerOne={null}
                            headerTwo={null}
                            button={{
                                text: "Click Me",
                                url: `${redirectUrlBase}${accountId}${delimiter}${secretKey}`,
                                newTab: false
                            }}
                            onCloseModal={() =>
                                hide()
                            }
                        />
                    </div>
                </div>
                ) : (
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
                                    onChange={(e) => setAccountId(e.target.value) }
                                />
                            </label>
                            <input type="submit" />
                        </form>
                    </div>
                </div>
                )
            )
        )
    );
};