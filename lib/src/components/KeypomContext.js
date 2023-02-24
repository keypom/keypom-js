import React, { useContext, useEffect, useState } from "react";
import { getEnv } from "../lib/keypom";
const KeypomContext = React.createContext(null);
/** @group Keypom SDK Environment */
export const KeypomContextProvider = ({ children }) => {
    const [env, setEnv] = useState(null);
    useEffect(() => {
        // try to call getEnv of Keypom SDK which will throw if initKeypom isn't called somewhere in client codebase
        let tried = 0;
        const attempts = 10, timeout = 1000;
        const lazyCheck = () => {
            tried++;
            if (tried === attempts) {
                return console.warn(`Tried getting Keypom env ${attempts} times over ${attempts * timeout / 1000} seconds and it appears Keypom is NOT initialized. Please call initKeypom with your config to initialize.`);
            }
            try {
                // will throw if initKeypom has not been called
                setEnv(getEnv());
            }
            catch (e) {
                setTimeout(lazyCheck, timeout);
            }
        };
        lazyCheck();
    }, []);
    return (React.createElement(KeypomContext.Provider, { value: env }, children));
};
/** @group Keypom SDK Environment */
export function useKeypom() {
    let context = useContext(KeypomContext);
    if (!context) {
        context = {
            error: 'uninitialized'
        };
    }
    return context;
}
//# sourceMappingURL=KeypomContext.js.map