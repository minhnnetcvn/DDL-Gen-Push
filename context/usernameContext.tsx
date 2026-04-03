// contexts/username-context.tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";

const UsernameContext = createContext<string>("");

function isValidUsername(username: string): boolean {
	if (!username || username.trim() === "") return false;
	// Allow alphanumeric, underscore, dash, and at least 3 characters
	return /^[a-zA-Z0-9_-]{3,}$/.test(username.trim());
}

export function UsernameProvider({ children }: { children: React.ReactNode }) {
	const [username, setUsername] = useState("");

	useEffect(() => {
		let saved = sessionStorage.getItem("username");

		if (!saved || !isValidUsername(saved)) {
			while (true) {
				if (!saved || saved.trim() === "") {
					saved = prompt("Nhập tên người dùng:") || "";
				} else {
					saved = prompt("Tên người dùng không hợp lệ.\nNhập tên người dùng:") || "";
				}
				
				if (isValidUsername(saved)) {
					break;
				}
			}
			sessionStorage.setItem("username", saved.trim());
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
