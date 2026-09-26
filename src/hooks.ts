import { useEffect, useState } from "react";

import { message } from "./api/client";

/**
 * Runs `load` once on mount. A result that arrives after unmount is dropped;
 * remount the component (e.g. with a `key`) to load something else.
 */
export function useLoad<T>(load: () => Promise<T>) {
	const [data, setData] = useState<T | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;
		load()
			.then((value) => !cancelled && setData(value))
			.catch((e) => !cancelled && setError(message(e)));
		return () => {
			cancelled = true;
		};
	}, []);

	return { data, setData, error };
}

/** Which action is running, if any, and the error from the last one. */
export function useAction<Kind extends string>() {
	const [busy, setBusy] = useState<Kind | null>(null);
	const [error, setError] = useState<string | null>(null);

	/**
	 * Runs `action`, returning whether it succeeded; a failure is shown through `error`.
	 * `leaves` is for actions that move off the screen: they stay busy until then.
	 */
	async function run(
		kind: Kind,
		action: () => Promise<unknown>,
		{ leaves = false } = {}
	): Promise<boolean> {
		setBusy(kind);
		setError(null);
		try {
			await action();
			if (!leaves) setBusy(null);
			return true;
		} catch (e) {
			setError(message(e));
			setBusy(null);
			return false;
		}
	}

	return { busy, error, run };
}

/** Asks the browser to confirm leaving the page while `active`, e.g. with unsaved changes. */
export function useLeaveWarning(active: boolean) {
	useEffect(() => {
		if (!active) return;
		const warn = (event: BeforeUnloadEvent) => event.preventDefault();
		window.addEventListener("beforeunload", warn);
		return () => window.removeEventListener("beforeunload", warn);
	}, [active]);
}
