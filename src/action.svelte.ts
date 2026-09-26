import { message } from "./api/client";

/** Which action is running, if any, and the error from the last one. */
export class Action<Kind extends string> {
	busy: Kind | null = $state(null);
	error: string | null = $state(null);

	// Runs `action`, returning whether it succeeded; a failure is shown through `error`.
	// `leaves` is for actions that move off the screen: they stay busy until then.
	async run(
		kind: Kind,
		action: () => Promise<unknown>,
		{ leaves = false } = {}
	): Promise<boolean> {
		this.busy = kind;
		this.error = null;
		try {
			await action();
			if (!leaves) this.busy = null;
			return true;
		} catch (e) {
			this.error = message(e);
			this.busy = null;
			return false;
		}
	}
}
