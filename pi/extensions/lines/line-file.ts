import { readFile, writeFile } from "node:fs/promises";

export async function load(path: string) {
	const content = await readFile(path, "utf8");
	const trailingNewline = content.endsWith("\n");
	const lines = content === "" ? [] : (trailingNewline ? content.slice(0, -1) : content).split("\n");
	return { lines, trailingNewline: trailingNewline || content === "" };
}

export async function save(path: string, lines: string[], trailingNewline: boolean) {
	await writeFile(path, lines.join("\n") + (trailingNewline && lines.length > 0 ? "\n" : ""), "utf8");
}

// 1-indexed, inclusive.
export function range(lines: string[], start: number, end: number) {
	if (end < start) throw new Error(`end (${end}) is before start (${start})`);
	if (end > lines.length) throw new Error(`end (${end}) is past the last line (${lines.length})`);
	return lines.slice(start - 1, end);
}
