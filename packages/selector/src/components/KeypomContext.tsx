import type { ReactNode } from "react";
import React, { useContext, useEffect, useState } from "react";
import { getEnv } from "../lib/keypom";
import { EnvVars } from "../lib/types/general"

const KeypomContext = React.createContext<EnvVars | null>(null)

/** @group Keypom SDK Environment */
export const KeypomContextProvider: React.FC<{
	children: ReactNode;
}> = ({ children }) => {

	const [env, setEnv] = useState<EnvVars | null>(null)

	useEffect(() => {
		// try to call getEnv of Keypom SDK which will throw if initKeypom isn't called somewhere in client codebase
		let tried = 0;
		const attempts = 10, timeout = 1000;
		const lazyCheck = () => {
			tried++;
			if (tried === attempts) {
				return console.warn(`Tried getting Keypom env ${attempts} times over ${attempts*timeout/1000} seconds and it appears Keypom is NOT initialized. Please call initKeypom with your config to initialize.`)
			}
			try {
				// will throw if initKeypom has not been called
				setEnv(getEnv())
			} catch (e) {
				setTimeout(lazyCheck, timeout)
			}
		}
		lazyCheck()
	}, [])

	return (
		<KeypomContext.Provider value={env}>
			{children}
		</KeypomContext.Provider>
	);
};

/** @group Keypom SDK Environment */
export function useKeypom() {
	let context = useContext(KeypomContext);

	if (!context) {
		context = {
			error: 'uninitialized'
		}
	}

	return context;
}