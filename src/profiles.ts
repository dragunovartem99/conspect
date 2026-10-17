import type { Profile } from "./api/types";

const FEW = new Set([2, 3, 4]);

// «3 года», «5 лет», «1 год».
export function ageLabel(age: number): string {
	const last = age % 10;
	const teen = age % 100 >= 11 && age % 100 <= 14;
	if (last === 1 && !teen) return `${age} год`;
	return FEW.has(last) && !teen ? `${age} года` : `${age} лет`;
}

export const ages = (profiles: Profile[]) => [...new Set(profiles.map((p) => p.age))];

export const kindsOf = (profiles: Profile[], age: number) => profiles.filter((p) => p.age === age);

// The age, and the kind of lesson only where the age has more than one.
export function profileLabel(profiles: Profile[], age: number, kind: string): string {
	const kinds = kindsOf(profiles, age);
	const name = kinds.find((p) => p.kind === kind)?.name;
	return kinds.length > 1 && name ? `${ageLabel(age)}, ${name}` : ageLabel(age);
}
