import { homedir } from "node:os";
import { isAbsolute, join, resolve } from "node:path";
import { Type } from "typebox";

export const stringOrList = (description: string) =>
	Type.Optional(Type.Union([Type.String(), Type.Array(Type.String())], { description }));

export function resolvePath(cwd: string, path: string): string {
	let p = path.startsWith("@") ? path.slice(1) : path;
	if (p === "~") p = homedir();
	else if (p.startsWith("~/")) p = join(homedir(), p.slice(2));
	return isAbsolute(p) ? p : resolve(cwd, p);
}

export function exactlyOne(params: Record<string, unknown>, names: string[]): string {
	const set = names.filter((n) => params[n] !== undefined && params[n] !== false);
	if (set.length !== 1)
		throw new Error(`Set exactly one of ${names.map((n) => `\`${n}\``).join(", ")} (got ${set.length}).`);
	return set[0];
}

export function list(value: string | string[] | undefined): string[] {
	if (value === undefined) return [];
	return Array.isArray(value) ? value : [value];
}
