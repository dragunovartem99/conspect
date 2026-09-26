import type { ReactNode } from "react";

/** A failure the user should read: announced to screen readers as soon as it shows. */
export function ErrorText({ children }: { children: ReactNode }) {
	return (
		<p
			className="error-text"
			role="alert"
		>
			{children}
		</p>
	);
}
