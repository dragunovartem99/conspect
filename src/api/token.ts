const KEY = "conspect.token";

// Kept in memory too: storage can be blocked (private windows), and then a sign-in
// should still last until the tab is closed.
let memory: string | null = null;

const listeners = new Set<() => void>();

/** Called whenever the token is set or cleared, e.g. when the server rejects it. */
export function subscribeToken(listener: () => void): () => void {
	listeners.add(listener);
	return () => listeners.delete(listener);
}

export function getToken(): string | null {
	if (memory) return memory;
	try {
		return localStorage.getItem(KEY);
	} catch {
		return null;
	}
}

export function setToken(token: string): void {
	memory = token;
	try {
		localStorage.setItem(KEY, token);
	} catch {
		// Nothing to do: the in-memory copy is enough for this tab.
	}
	listeners.forEach((listener) => listener());
}

export function clearToken(): void {
	memory = null;
	try {
		localStorage.removeItem(KEY);
	} catch {
		// Same as above.
	}
	listeners.forEach((listener) => listener());
}
