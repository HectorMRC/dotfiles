import { realpathSync } from "node:fs";
import { homedir } from "node:os";
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import type { ExtensionAPI, ExtensionContext, ThemeColor } from "@earendil-works/pi-coding-agent";
import { CACHE_DIR } from "./lib/cache-dir.ts";

const READ_ONLY_TOOLS: Record<string, { arg: string; fallback?: string }> = {
	read: { arg: "path" },
	grep: { arg: "path", fallback: "." },
	find: { arg: "path", fallback: "." },
	ls: { arg: "path", fallback: "." },
	rg: { arg: "path", fallback: "." },
	fd: { arg: "path", fallback: "." },
	"copy-lines": { arg: "path" },
};

// A URL can leak data.
const ALWAYS_CONFIRM = new Set(["web-fetch"]);

const READABLE_ROOTS = [
	CACHE_DIR,
	join(homedir(), ".cargo", "registry"),
	join(homedir(), ".cargo", "git"),
	"/nix/store",
];

const UNICODE_SPACES = /[\u00A0\u2000-\u200A\u202F\u205F\u3000]/g;

function normalize(input: string): string {
	let path = input.replace(UNICODE_SPACES, " ");
	if (path.startsWith("@")) path = path.slice(1);
	if (path === "~") return homedir();
	if (path.startsWith("~/")) return join(homedir(), path.slice(2));
	if (/^file:\/\//.test(path)) return fileURLToPath(path);
	return path;
}

// Resolves missing paths too, so a symlinked parent cannot escape the check.
function canonicalize(path: string): string {
	try {
		return realpathSync(path);
	} catch {
		const parent = dirname(path);
		if (parent === path) return path;
		return join(canonicalize(parent), basename(path));
	}
}

function isInside(root: string, path: string): boolean {
	const rel = relative(root, path);
	return rel === "" || (rel !== ".." && !rel.startsWith(`..${sep}`) && !isAbsolute(rel));
}

async function ask(ctx: ExtensionContext, color: ThemeColor, title: string, message: string, reason: string) {
	if (!ctx.hasUI) {
		return { block: true, reason: `${reason} (no UI available for confirmation)` };
	}
	if (ctx.mode === "tui") {
		// Pi renders `${title}\n${message}` in accent; the title's color reset would drop it.
		title = ctx.ui.theme.fg(color, title);
		message = ctx.ui.theme.fg("accent", message);
	}
	if (await ctx.ui.confirm(title, message)) return undefined;
	return { block: true, reason: `${reason}: denied by the user` };
}

function describe(input: Record<string, unknown>): string {
	return Object.entries(input)
		.map(([key, value]) => `${key}: ${typeof value === "string" ? value : JSON.stringify(value)}`)
		.join("\n");
}

export default function (pi: ExtensionAPI) {
	const isDeclaredReadOnly = (name: string) =>
		pi.getAllTools().find((t) => t.name === name)?.annotations?.readOnlyHint === true;

	pi.on("tool_call", async (event, ctx) => {
		const input = event.input as Record<string, unknown>;
		const readOnly = READ_ONLY_TOOLS[event.toolName];

		if (!readOnly) {
			const confirm = ALWAYS_CONFIRM.has(event.toolName);
			if (!confirm && isDeclaredReadOnly(event.toolName)) return undefined;
			return ask(
				ctx,
				"accent",
				`Allow ${event.toolName}?`,
				describe(input),
				`${event.toolName} requires confirmation`,
			);
		}

		const raw = input[readOnly.arg];
		const given = (Array.isArray(raw) ? raw : [raw]).filter((a): a is string => typeof a === "string" && a !== "");
		const args = given.length > 0 ? given : readOnly.fallback !== undefined ? [readOnly.fallback] : [];

		const root = canonicalize(resolve(ctx.cwd));
		const roots = [root, ...READABLE_ROOTS.map(canonicalize)];
		for (const arg of args) {
			const target = canonicalize(resolve(ctx.cwd, normalize(arg)));
			if (roots.some((r) => isInside(r, target))) continue;
			const answer = await ask(
				ctx,
				"warning",
				`Allow ${event.toolName} outside the working directory?`,
				arg === target ? target : `${arg}\n→ ${target}`,
				`${event.toolName} of ${target} is outside ${root}`,
			);
			if (answer) return answer;
		}
		return undefined;
	});
}
