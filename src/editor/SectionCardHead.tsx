import type { SectionKind } from "../api/types";
import { Icon } from "../Icon";
import { KIND_LABELS } from "./labels";

interface Props {
	index: number;
	total: number;
	kind: SectionKind;
	onKind: (kind: SectionKind) => void;
	onMove: (delta: -1 | 1) => void;
	onRemove: () => void;
}

const KINDS = Object.keys(KIND_LABELS) as SectionKind[];

/** A part's number, kind, and the buttons that move or remove it. */
export function SectionCardHead({ index, total, kind, onKind, onMove, onRemove }: Props) {
	return (
		<div className="card-head">
			<span className="number">{index + 1}</span>
			<select
				aria-label="Вид части"
				value={kind}
				onChange={(e) => onKind(e.target.value as SectionKind)}
			>
				{KINDS.map((k) => (
					<option
						key={k}
						value={k}
					>
						{KIND_LABELS[k]}
					</option>
				))}
			</select>
			<span className="spacer" />
			<button
				type="button"
				className="square"
				aria-label="Выше"
				disabled={index === 0}
				onClick={() => onMove(-1)}
			>
				<Icon name="up" />
			</button>
			<button
				type="button"
				className="square"
				aria-label="Ниже"
				disabled={index === total - 1}
				onClick={() => onMove(1)}
			>
				<Icon name="down" />
			</button>
			<button
				type="button"
				onClick={onRemove}
			>
				Удалить
			</button>
		</div>
	);
}
