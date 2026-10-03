/**
 * Prompt Box Extension
 *
 * Hides the built-in footer; its info (cwd, model, context %, tokens, cost)
 * is rendered inside the input editor by PromptBoxEditor (./editor.ts).
 *
 * The editor itself is installed by the plan-mode extension, whose
 * PlanModeEditor extends PromptBoxEditor (only one editor can be active).
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import type { TUI } from "@earendil-works/pi-tui";

export default function promptBoxExtension(pi: ExtensionAPI): void {
	let tui: TUI | undefined;
	const rerender = () => tui?.requestRender();

	pi.on("session_start", (_event, ctx) => {
		if (!ctx.hasUI) return;
		ctx.ui.setFooter((footerTui) => {
			tui = footerTui;
			return { render: () => [], invalidate() {} };
		});
		rerender();
	});

	// Keep model / cost / tokens / context % current in the status line.
	pi.on("model_select", rerender);
	pi.on("turn_end", rerender);
	pi.on("agent_end", rerender);
	pi.on("session_compact", rerender);

	pi.on("session_shutdown", () => {
		tui = undefined;
	});
}
