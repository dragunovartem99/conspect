import type { Profile } from "./api/types";

export type Program = { key: string; name: string };

// Each program once, in the API's order: «3 года», «4 года», «5 лет — промежуточная программа».
export const programs = (profiles: Profile[]): Program[] => [
	...new Map(profiles.map((p) => [p.program, { key: p.program, name: p.program_name }])).values(),
];

export const kindsOf = (profiles: Profile[], program: string) =>
	profiles.filter((p) => p.program === program);

// The program, and the kind of lesson only where the program has more than one.
export function profileLabel(profiles: Profile[], program: string, kind: string): string {
	const kinds = kindsOf(profiles, program);
	const profile = kinds.find((p) => p.kind === kind);
	if (!profile) return program;
	return kinds.length > 1 ? `${profile.program_name}, ${profile.name}` : profile.program_name;
}
