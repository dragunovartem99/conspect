import { MONTHS } from "./labels";

interface Props {
	value: string;
	onChange: (month: string) => void;
}

/** A month picker that keeps a stored month outside the usual list selectable. */
export function MonthSelect({ value, onChange }: Props) {
	const months = MONTHS.includes(value) ? MONTHS : [value, ...MONTHS];
	return (
		<select
			value={value}
			onChange={(e) => onChange(e.target.value)}
		>
			{months.map((m) => (
				<option key={m}>{m}</option>
			))}
		</select>
	);
}
