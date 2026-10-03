// Read-only tools run freely inside the working directory (symlinks resolved);
// anything else asks for confirmation, or is blocked when there is no UI.

import { realpathSync } from "node:fs";
import { homedir } from "node:os";
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import type { ExtensionAPI, ExtensionContext, ThemeColor } from "@earendil-works/pi-coding-agent";

const READ_ONLY_TOOLS: Record<string, { arg: string; fallback?: string }> = {
	read: { arg: "path" },
	grep: { arg: "path", fallback: "." },
	find: { arg: "path", fallback: "." },
	ls: { arg: "path", fallback: "." },
};

const UNICODE_SPACES = /[\u00A0\u2000-\u200A\u202F\u205F\u3000]/g;

// Mirrors Pi's own path handling (utils/paths.ts).
function normalize(input: string): string {
	let path = input.replace(UNICODE_SPACES, " ");
	if (path.startsWith("@")) path = path.slice(1);
	if (path === "~") return homedir();
	if (path.startsWith("~/")) return join(homedir(), path.slice(2));
	if (/^file:\/\//.test(path)) return fileURLToPath(path);
	return path;
}

// realpath that also works for missing paths, by resolving the nearest
// existing ancestor, so a symlinked parent cannot escape the check.
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

async function ask(
	ctx: ExtensionContext,
	color: ThemeColor,
	title: string,
	message: string,
	reason: string,
) {
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

// Display only: puts each chained command on its own line. Splits on `&&`,
// `||`, `;` and `|` outside quotes and parentheses.
function formatCommand(command: string): string {
	const lines: string[] = [];
	let operator = "";
	let current = "";
	let quote: string | undefined;
	let depth = 0;

	const push = () => {
		const text = current.trim();
		if (text !== "") lines.push(operator ? `    ${operator} ${text}` : text);
	};
	const split = (next: string) => {
		push();
		operator = next;
		current = "";
	};

	for (let i = 0; i < command.length; i++) {
		const char = command[i];
		const pair = command.slice(i, i + 2);

		if (char === "\\" && quote !== "'") {
			current += command.slice(i, i + 2);
			i++;
		} else if (quote) {
			if (char === quote) quote = undefined;
			current += char;
		} else if (char === "'" || char === '"') {
			quote = char;
			current += char;
		} else if (char === "(") {
			depth++;
			current += char;
		} else if (char === ")") {
			depth = Math.max(0, depth - 1);
			current += char;
		} else if (depth === 0 && (pair === "&&" || pair === "||")) {
			split(pair);
			i++;
		} else if (depth === 0 && (char === ";" || char === "|")) {
			split(char);
		} else {
			current += char;
		}
	}
	push();

	return lines.join("\n");
}

function describe(input: Record<string, unknown>): string {
	if (typeof input.command === "string") return formatCommand(input.command);
	if (typeof input.path === "string") return input.path;
	return JSON.stringify(input, null, 2);
}

export default function (pi: ExtensionAPI) {
	pi.on("tool_call", async (event, ctx) => {
		const input = event.input as Record<string, unknown>;
		const readOnly = READ_ONLY_TOOLS[event.toolName];

		if (!readOnly) {
			return ask(
				ctx,
				event.toolName === "bash" ? "error" : "accent",
				`Allow ${event.toolName}?`,
				describe(input),
				`${event.toolName} requires confirmation`,
			);
		}

		const raw = input[readOnly.arg];
		const arg = typeof raw === "string" && raw !== "" ? raw : readOnly.fallback;
		if (arg === undefined) return undefined; // The tool itself reports it.

		const root = canonicalize(resolve(ctx.cwd));
		const target = canonicalize(resolve(ctx.cwd, normalize(arg)));
		if (isInside(root, target)) return undefined;

		return ask(
			ctx,
			"warning",
			`Allow ${event.toolName} outside the working directory?`,
			arg === target ? target : `${arg}\n→ ${target}`,
			`${event.toolName} of ${target} is outside ${root}`,
		);
	});
}
