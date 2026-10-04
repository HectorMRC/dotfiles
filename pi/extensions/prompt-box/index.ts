/**
 * Hides the built-in footer; PromptBoxEditor shows its info instead. The
 * editor is installed by plan-mode, whose editor extends PromptBoxEditor.
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

	pi.on("model_select", rerender);
	pi.on("turn_end", rerender);
	pi.on("agent_end", rerender);
	pi.on("session_compact", rerender);

	pi.on("session_shutdown", () => {
		tui = undefined;
	});
}
