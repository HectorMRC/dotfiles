const DESTRUCTIVE_PATTERNS = [
	/\brm\b/i,
	/\brmdir\b/i,
	/\bmv\b/i,
	/\bcp\b/i,
	/\bmkdir\b/i,
	/\btouch\b/i,
	/\bchmod\b/i,
	/\bchown\b/i,
	/\bchgrp\b/i,
	/\bln\b/i,
	/\btee\b/i,
	/\btruncate\b/i,
	/\bdd\b/i,
	/\bshred\b/i,
	/(^|[^<])>(?!>)/,
	/>>/,
	/\bnpm\s+(install|uninstall|update|ci|link|publish)/i,
	/\byarn\s+(add|remove|install|publish)/i,
	/\bpnpm\s+(add|remove|install|publish)/i,
	/\bpip\s+(install|uninstall)/i,
	/\bapt(-get)?\s+(install|remove|purge|update|upgrade)/i,
	/\bbrew\s+(install|uninstall|upgrade)/i,
	/\bgit\s+(add|commit|push|pull|merge|rebase|reset|checkout|branch\s+-[dD]|stash|cherry-pick|revert|tag|init|clone)/i,
	/\bsudo\b/i,
	/\bsu\b/i,
	/\bkill\b/i,
	/\bpkill\b/i,
	/\bkillall\b/i,
	/\breboot\b/i,
	/\bshutdown\b/i,
	/\bsystemctl\s+(start|stop|restart|enable|disable)/i,
	/\bservice\s+\S+\s+(start|stop|restart)/i,
	/\b(vim?|nano|emacs|code|subl)\b/i,
	// Read-only commands with write/exec options
	/\bfind\b.*\s-(delete|fprint0?|fprintf|fls)\b/,
	/\bfind\b.*\s-(exec|execdir|ok|okdir)\s+(?!(grep|rg|cat|head|tail|wc|ls|stat|file|du)\b)/,
	/\bsed\b.*\s(-[a-zA-Z]*i|--in-place)\b/,
	/\bcurl\b.*\s(-[a-zA-Z]*[oO]|--output|--remote-name)\b/,
	/\bawk\b.*\bsystem\s*\(/,
];

const SAFE_PATTERNS = [
	/^\s*cat\b/,
	/^\s*head\b/,
	/^\s*tail\b/,
	/^\s*less\b/,
	/^\s*more\b/,
	/^\s*grep\b/,
	/^\s*find\b/,
	/^\s*ls\b/,
	/^\s*pwd\b/,
	/^\s*echo\b/,
	/^\s*printf\b/,
	/^\s*wc\b/,
	/^\s*sort\b/,
	/^\s*uniq\b/,
	/^\s*diff\b/,
	/^\s*file\b/,
	/^\s*stat\b/,
	/^\s*du\b/,
	/^\s*df\b/,
	/^\s*tree\b/,
	/^\s*which\b/,
	/^\s*whereis\b/,
	/^\s*type\b/,
	/^\s*env\s*$/, // bare `env` only; `env cmd` runs cmd
	/^\s*cd\b/,
	/^\s*true\s*$/,
	/^\s*printenv\b/,
	/^\s*uname\b/,
	/^\s*whoami\b/,
	/^\s*id\b/,
	/^\s*date\b/,
	/^\s*cal\b/,
	/^\s*uptime\b/,
	/^\s*ps\b/,
	/^\s*top\b/,
	/^\s*htop\b/,
	/^\s*free\b/,
	/^\s*git\s+(status|log|diff|show|branch|remote|config\s+--get)/i,
	/^\s*git\s+ls-/i,
	/^\s*git\s+(blame|rev-parse|describe|shortlog)\b/i,
	/^\s*jj\s+(st|status|log|diff|show|evolog|file\s+(list|show)|bookmark\s+list|op\s+log)\b/i,
	/^\s*gh\s+(pr|issue|run|repo)\s+(view|diff|list|checks|status)\b/i,
	/^\s*gh\s+auth\s+status\b/i,
	/^\s*npm\s+(list|ls|view|info|search|outdated|audit)/i,
	/^\s*yarn\s+(list|info|why|audit)/i,
	/^\s*node\s+--version/i,
	/^\s*python\s+--version/i,
	/^\s*curl\s/i,
	/^\s*wget\s+-O\s*-/i,
	/^\s*jq\b/,
	/^\s*sed\s+-n/i,
	/^\s*awk\b/,
	/^\s*rg\b/,
	/^\s*fd\b/,
	/^\s*bat\b/,
	/^\s*eza\b/,
];

// fd duplication and /dev/null: redirections that don't write files.
const HARMLESS_REDIRECTS = /(&>>?|\d*>>?)\s*\/dev\/null\b|\d*>&\d+|\d*<&\d+/g;

/**
 * Split a command line into simple commands, including the contents of
 * `$(...)`, backticks, `<(...)` and `>(...)`. Quote-aware. Errs towards extra
 * segments, which then fail the allowlist.
 */
export function splitCommands(command: string): string[] {
	const parts: string[] = [];
	let current = "";
	let quote: "'" | '"' | null = null;
	const push = () => {
		if (current.trim()) parts.push(current.trim());
		current = "";
	};

	for (let i = 0; i < command.length; i++) {
		const c = command[i] as string;
		const next = command[i + 1];
		if (c === "\\" && quote !== "'") {
			current += c + (next ?? "");
			i++;
			continue;
		}
		if (quote === "'") {
			if (c === "'") quote = null;
			current += c;
			continue;
		}
		// Substitutions also run inside double quotes.
		if (c === "`" || ((c === "$" || c === "<" || c === ">") && next === "(")) {
			push();
			if (c !== "`") i++;
			continue;
		}
		if (quote === '"') {
			if (c === '"') quote = null;
			current += c;
			continue;
		}
		if (c === "'" || c === '"') {
			quote = c;
			current += c;
			continue;
		}
		if (c === ";" || c === "|" || c === "&" || c === "\n" || c === "(" || c === ")") {
			push();
			continue;
		}
		current += c;
	}
	push();
	return parts;
}

/** Every simple command must be allowlisted and none destructive. */
export function isSafeCommand(command: string): boolean {
	const segments = splitCommands(command.replace(HARMLESS_REDIRECTS, " "));
	if (segments.length === 0) return false;
	return segments.every(
		(segment) =>
			!DESTRUCTIVE_PATTERNS.some((p) => p.test(segment)) && SAFE_PATTERNS.some((p) => p.test(segment)),
	);
}

export interface TodoItem {
	step: number;
	text: string;
	completed: boolean;
}

export function cleanStepText(text: string): string {
	let cleaned = text
		.replace(/\*{1,2}([^*]+)\*{1,2}/g, "$1") // bold/italic
		.replace(/`([^`]+)`/g, "$1") // inline code
		.replace(/\s+/g, " ")
		.trim();

	if (cleaned.length > 0) {
		cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
	}
	if (cleaned.length > 50) {
		cleaned = `${cleaned.slice(0, 47)}...`;
	}
	return cleaned;
}

export function extractTodoItems(message: string): TodoItem[] {
	const items: TodoItem[] = [];
	const headerMatch = message.match(/\*{0,2}Plan:\*{0,2}\s*\n/i);
	if (!headerMatch) return items;

	const planSection = message.slice(message.indexOf(headerMatch[0]) + headerMatch[0].length);
	// Unindented only: indented numbers are sub-steps of the previous step.
	const numberedPattern = /^(\d+)[.)]\s+\*{0,2}([^*\n]+)/;

	// Only the first numbered list after the header counts. Any unindented,
	// non-blank, non-numbered line ends it.
	let listStarted = false;
	for (const line of planSection.split("\n")) {
		const match = line.match(numberedPattern);
		if (!match) {
			if (listStarted && line.trim() !== "" && !/^\s/.test(line)) break;
			continue;
		}
		listStarted = true;
		const text = match[2]
			.trim()
			.replace(/\*{1,2}$/, "")
			.trim();
		if (text.length > 5 && !text.startsWith("`") && !text.startsWith("/") && !text.startsWith("-")) {
			const cleaned = cleanStepText(text);
			if (cleaned.length > 3) {
				items.push({ step: items.length + 1, text: cleaned, completed: false });
			}
		}
	}
	return items;
}

export function extractDoneSteps(message: string): number[] {
	const steps: number[] = [];
	for (const match of message.matchAll(/\[DONE:(\d+)\]/gi)) {
		const step = Number(match[1]);
		if (Number.isFinite(step)) steps.push(step);
	}
	return steps;
}

export function markCompletedSteps(text: string, items: TodoItem[]): number {
	const doneSteps = extractDoneSteps(text);
	for (const step of doneSteps) {
		const item = items.find((t) => t.step === step);
		if (item) item.completed = true;
	}
	return doneSteps.length;
}
