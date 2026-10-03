/**
 * Status line shown inside the prompt box:
 *   <cwd>                         <model> · <ctx%> · <tokens> tok · $<cost>
 */

import { relative, resolve, sep, isAbsolute } from "node:path";
import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import { truncateToWidth, visibleWidth } from "@earendil-works/pi-tui";

interface UsageLike {
	totalTokens?: number;
	cost?: { total?: number };
}

export function formatCwd(cwd: string, home = process.env.HOME): string {
	if (!home) return cwd;
	const rel = relative(resolve(home), resolve(cwd));
	if (rel === "") return "~";
	if (rel === ".." || rel.startsWith(`..${sep}`) || isAbsolute(rel)) return cwd;
	return `~${sep}${rel}`;
}

/** Truncate from the start so the end (the actual directory) stays visible. */
export function truncateStart(text: string, maxWidth: number, ellipsis = "…"): string {
	if (visibleWidth(text) <= maxWidth) return text;
	const room = maxWidth - visibleWidth(ellipsis);
	if (room <= 0) return "";
	const chars = Array.from(text);
	let kept = "";
	for (let i = chars.length - 1; i >= 0; i--) {
		const next = chars[i] + kept;
		if (visibleWidth(next) > room) break;
		kept = next;
	}
	return ellipsis + kept;
}

export function formatTokens(count: number): string {
	if (count < 1000) return `${count}`;
	if (count < 10_000) return `${(count / 1000).toFixed(1)}k`;
	if (count < 1_000_000) return `${Math.round(count / 1000)}k`;
	if (count < 10_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
	return `${Math.round(count / 1_000_000)}M`;
}

/** Total tokens and cost across the whole session (all branches, incl. compactions). */
function sessionTotals(ctx: ExtensionContext): { tokens: number; cost: number } {
	let tokens = 0;
	let cost = 0;
	const add = (usage: UsageLike | undefined) => {
		if (!usage) return;
		tokens += usage.totalTokens ?? 0;
		cost += usage.cost?.total ?? 0;
	};
	for (const entry of ctx.sessionManager.getEntries()) {
		if (entry.type === "message") {
			const message = entry.message as { role: string; usage?: UsageLike };
			if (message.role === "assistant" || message.role === "toolResult") add(message.usage);
		} else if (entry.type === "compaction" || entry.type === "branch_summary") {
			add((entry as { usage?: UsageLike }).usage);
		}
	}
	return { tokens, cost };
}

export function buildStatusLine(ctx: ExtensionContext, width: number): string {
	if (width <= 0) return "";
	const theme = ctx.ui.theme;
	const dim = (s: string) => theme.fg("dim", s);
	const sepStr = dim(" · ");

	const usage = ctx.getContextUsage();
	let ctxText: string;
	if (!usage || usage.percent === null) {
		ctxText = dim("ctx ?");
	} else {
		const label = `ctx ${Math.round(usage.percent)}%`;
		ctxText =
			usage.percent > 90
				? theme.fg("error", label)
				: usage.percent > 70
					? theme.fg("warning", label)
					: dim(label);
	}

	const { tokens, cost } = sessionTotals(ctx);
	const rightParts = [
		dim(ctx.model?.id ?? "no model"),
		ctxText,
		dim(`${formatTokens(tokens)} tok`),
		dim(`$${cost.toFixed(3)}`),
	];
	let right = rightParts.join(sepStr);
	const cwdText = formatCwd(ctx.cwd);
	let left = dim(cwdText);

	// One leading/trailing space inside the box, minimum gap of 2 between sides.
	const inner = Math.max(0, width - 2);
	const gap = 2;
	let rightWidth = visibleWidth(right);
	if (rightWidth > inner) {
		right = truncateToWidth(right, inner, dim("…"));
		rightWidth = visibleWidth(right);
	}
	const leftRoom = inner - rightWidth - gap;
	if (leftRoom < 4) {
		left = "";
	} else if (visibleWidth(cwdText) > leftRoom) {
		left = dim(truncateStart(cwdText, leftRoom));
	}
	const pad = " ".repeat(Math.max(0, inner - visibleWidth(left) - rightWidth));
	return ` ${left}${pad}${right} `;
}
