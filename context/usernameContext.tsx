// contexts/username-context.tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";

const UsernameContext = createContext<string>("");

export function UsernameProvider({ children }: { children: React.ReactNode }) {
	const [username, setUsername] = useState("");

	useEffect(() => {
		let saved = sessionStorage.getItem("username");

		if (!saved || saved.trim() === "") {
			saved = prompt("Enter your username:") || "";
			while (!saved.trim()) {
				saved = prompt("Invalid username.\nPlease enter your username:") || "";
			}
			sessionStorage.setItem("username", saved);
		}

		setUsername(saved);
	}, []);

	return (
		<UsernameContext.Provider value={username}>
			{children}
		</UsernameContext.Provider>
	);
}

export function useUsername() {
	return useContext(UsernameContext);
}
