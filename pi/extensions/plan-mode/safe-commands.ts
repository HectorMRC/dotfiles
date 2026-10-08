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

// Errs towards extra segments, which then fail the allowlist.
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

export function isSafeCommand(command: string): boolean {
	const segments = splitCommands(command.replace(HARMLESS_REDIRECTS, " "));
	if (segments.length === 0) return false;
	return segments.every(
		(segment) => !DESTRUCTIVE_PATTERNS.some((p) => p.test(segment)) && SAFE_PATTERNS.some((p) => p.test(segment)),
	);
}
