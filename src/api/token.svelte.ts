const KEY = "conspect.token";

function stored(): string | null {
	try {
		return localStorage.getItem(KEY);
	} catch {
		return null;
	}
}

// Kept in memory too: storage can be blocked (private windows), and then a sign-in
// should still last until the tab is closed. Reactive, so signing out shows the login screen.
let token = $state(stored());

export function getToken(): string | null {
	return token;
}

export function setToken(value: string): void {
	token = value;
	try {
		localStorage.setItem(KEY, value);
	} catch {
		// Nothing to do: the in-memory copy is enough for this tab.
	}
}

export function clearToken(): void {
	token = null;
	try {
		localStorage.removeItem(KEY);
	} catch {
		// Same as above.
	}
}
