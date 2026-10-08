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

type Segment = { operator: string; text: string };

function splitCommand(command: string): Segment[] {
	const segments: Segment[] = [];
	let operator = "";
	let current = "";
	let quote: string | undefined;
	let depth = 0;

	const push = () => {
		const text = current.trim();
		if (text !== "") segments.push({ operator, text });
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

	return segments;
}

function formatCommand(command: string): string {
	return splitCommand(command)
		.map(({ operator, text }) => (operator ? `    ${operator} ${text}` : text))
		.join("\n");
}

function words(text: string): string[] {
	const result: string[] = [];
	let current = "";
	let started = false;
	let quote: string | undefined;

	for (let i = 0; i < text.length; i++) {
		const char = text[i];
		if (char === "\\" && quote !== "'") {
			current += text[++i] ?? "";
			started = true;
		} else if (quote) {
			if (char === quote) quote = undefined;
			else current += char;
		} else if (char === "'" || char === '"') {
			quote = char;
			started = true;
		} else if (/\s/.test(char)) {
			if (started) result.push(current);
			current = "";
			started = false;
		} else {
			current += char;
			started = true;
		}
	}
	if (started) result.push(current);

	return result;
}

const PREFIXES = new Set(["sudo", "command", "env", "exec", "nohup", "time", "xargs"]);

const BANNED: Record<string, string> = {
	ls: "ls",
	tree: "ls",
	cat: "read",
	head: "read",
	tail: "read",
	less: "read",
	more: "read",
	grep: "rg",
	egrep: "rg",
	fgrep: "rg",
	rg: "rg",
	find: "fd",
	fd: "fd",
	sed: "read or edit",
	awk: "read or edit",
	gawk: "read or edit",
	cp: "cp",
	mv: "mv",
	rm: "rm",
	mkdir: "mkdir",
};

const JJ_TOOLS: Record<string, string> = {
	status: "jj-status",
	st: "jj-status",
	log: "jj-log",
	show: "jj-show",
	diff: "jj-diff",
	new: "jj-new",
	commit: "jj-commit",
	ci: "jj-commit",
	describe: "jj-describe",
	desc: "jj-describe",
	squash: "jj-squash",
	restore: "jj-restore",
	rebase: "jj-rebase",
};

function bannedCommand(segment: Segment): [string, string] | undefined {
	const argv = words(segment.text.replace(/^[({\s]+/, ""));
	let i = 0;
	while (i < argv.length && (/^\w+=/.test(argv[i]) || PREFIXES.has(argv[i]))) i++;
	const name = basename(argv[i] ?? "");
	const args = argv.slice(i + 1);

	// Writes a file even at the end of a pipe.
	if (name === "tee" && args.some((a) => !a.startsWith("-") && !a.startsWith("/dev/"))) return [name, "write"];
	if (name === "perl" && args.some((a) => /^-\w*i/.test(a))) return [name, "edit"];

	// Filtering another command's output is fine.
	if (segment.operator === "|") return undefined;

	if (name === "jj") {
		const sub = args.find((a) => !a.startsWith("-"));
		const tool = sub && JJ_TOOLS[sub];
		return tool ? [`jj ${sub}`, tool] : undefined;
	}

	const tool = BANNED[name];
	return tool ? [name, tool] : undefined;
}

function fileRedirect(command: string): string | undefined {
	let quote: string | undefined;

	for (let i = 0; i < command.length; i++) {
		const char = command[i];
		if (char === "\\" && quote !== "'") {
			i++;
		} else if (quote) {
			if (char === quote) quote = undefined;
		} else if (char === "'" || char === '"') {
			quote = char;
		} else if (char === ">") {
			if (command[i + 1] === ">" || command[i + 1] === "|") i++;
			const target = words(command.slice(i + 1).match(/^\s*("[^"]*"|'[^']*'|[^\s;|&()<>]+)/)?.[1] ?? "")[0];
			if (target === undefined || target.startsWith("/dev/")) continue;
			return target;
		}
	}

	return undefined;
}

function checkBash(command: string): string | undefined {
	for (const segment of splitCommand(command)) {
		const banned = bannedCommand(segment);
		if (banned) {
			const [name, tool] = banned;
			return `Blocked: use the ${tool} tool instead of bash \`${name}\` (see AGENTS.md). For several lookups, make parallel tool calls.`;
		}
	}
	const target = fileRedirect(command);
	if (target !== undefined) {
		return `Blocked: use the built-in write or edit tool instead of redirecting bash output to \`${target}\` (see AGENTS.md).`;
	}
	return undefined;
}

function describe(input: Record<string, unknown>): string {
	if (typeof input.command === "string") return formatCommand(input.command);
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
			if (!confirm && (event.toolName === "codemode" || isDeclaredReadOnly(event.toolName))) return undefined;
			if (event.toolName === "bash" && typeof input.command === "string") {
				const reason = checkBash(input.command);
				if (reason) return { block: true, reason };
			}
			return ask(
				ctx,
				event.toolName === "bash" ? "error" : "accent",
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
