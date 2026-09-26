import type { ComponentProps } from "react";

import { AutoTextarea } from "./AutoTextarea";

type Props = Omit<ComponentProps<"textarea">, "value" | "onChange"> & {
	value: string[];
	onChange: (lines: string[]) => void;
};

/** Edits a list as text, one item per line. */
export function LinesTextarea({ value, onChange, ...props }: Props) {
	return (
		<AutoTextarea
			{...props}
			value={value.join("\n")}
			onChange={(e) => onChange(e.target.value.split("\n"))}
		/>
	);
}
