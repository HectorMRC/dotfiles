/**
 * Input editor for plan mode.
 *
 * - Plan mode: border painted in the theme's warning color and a
 *   "PLAN MODE" label embedded in the top border.
 * - Execution mode: "📋 done/total" progress label in the top border.
 * - The streaming "Working…" status is embedded in the top border too,
 *   next to the label (embedWorkingStatus).
 * - Status line + prompt symbol inside the box come from PromptBoxEditor.
 */

import type { ExtensionContext, KeybindingsManager, Theme } from "@earendil-works/pi-coding-agent";
import { type EditorTheme, type TUI, visibleWidth } from "@earendil-works/pi-tui";
import { PromptBoxEditor } from "../prompt-box/editor.ts";

export type PlanEditorMode = "plan" | "executing" | "normal";

export interface PlanEditorState {
	mode(): PlanEditorMode;
	progress(): { completed: number; total: number };
	theme(): Theme;
	ctx(): ExtensionContext;
}

// Mirrors the (private) indicator CustomEditor stores for embedded working status.
interface BorderStatusIndicator {
	renderInBorder(width: number): string;
	renderSpinnerInBorder(width: number): string;
}

type ColorFn = (str: string) => string;

export class PlanModeEditor extends PromptBoxEditor {
	// Not named `state`: the base Editor uses that field internally.
	private readonly planState: PlanEditorState;

	constructor(tui: TUI, theme: EditorTheme, keybindings: KeybindingsManager, state: PlanEditorState) {
		super(tui, theme, keybindings, { embedWorkingStatus: true, ctx: () => state.ctx() });
		this.planState = state;

		// `borderColor` is an own field set by Editor's constructor, and pi
		// reassigns it on thinking-level / bash-mode changes. Intercept it so
		// plan mode keeps the warning color while remembering pi's color for
		// when plan mode is turned off.
		let baseColor: ColorFn = this.borderColor;
		const warning: ColorFn = (s) => this.planState.theme().fg("warning", s);
		Object.defineProperty(this, "borderColor", {
			configurable: true,
			enumerable: true,
			get: (): ColorFn => (this.planState.mode() === "plan" ? warning : baseColor),
			set: (fn: ColorFn) => {
				baseColor = fn;
			},
		});
	}

	protected override promptColor(text: string): string {
		return this.planState.mode() === "plan" ? this.planState.theme().fg("warning", text) : super.promptColor(text);
	}

	/** Request a re-render after plan state changes. */
	refresh(): void {
		this.tui.requestRender();
	}

	private labels(): string[] {
		const theme = this.planState.theme();
		switch (this.planState.mode()) {
			case "plan":
				return [theme.fg("warning", theme.bold(" Plan mode")), theme.fg("warning", theme.bold("⏸ PLAN"))];
			case "executing": {
				const { completed, total } = this.planState.progress();
				return [theme.fg("accent", `📋 ${completed}/${total}`)];
			}
			default:
				return [];
		}
	}

	protected override renderTopBorder(width: number, hiddenLineCount: number): string {
		const labels = this.labels();
		if (labels.length === 0 || width <= 0) return super.renderTopBorder(width, hiddenLineCount);

		const border = this.borderColor;
		const indicator = (this as unknown as { workingStatusIndicator?: BorderStatusIndicator }).workingStatusIndicator;
		const overflow = hiddenLineCount > 0 ? ` ↑ ${hiddenLineCount} more ` : undefined;

		for (const label of labels) {
			const labelWidth = visibleWidth(label);
			// "── " + label + " " + at least one trailing "─"
			const minWidth = 3 + labelWidth + 2;
			if (width < minWidth) continue;

			let left = border("── ") + label;
			let leftWidth = 3 + labelWidth;

			// Embed the working status: " ── " + status, keeping " ─" at the end.
			if (indicator) {
				const room = width - leftWidth - 4 - 2;
				if (room > 0) {
					let status = indicator.renderInBorder(room);
					if (visibleWidth(status) > room) status = indicator.renderSpinnerInBorder(room);
					const statusWidth = visibleWidth(status);
					if (statusWidth > 0 && statusWidth <= room) {
						left += border(" ── ") + status;
						leftWidth += 4 + statusWidth;
					}
				}
			}

			const rest = width - leftWidth - 1; // after the separating space
			let tail = "─".repeat(rest);
			if (overflow) {
				const overflowWidth = visibleWidth(overflow);
				if (overflowWidth + 2 <= rest) {
					// Center within the full width when possible, otherwise right after the left block.
					const centered = Math.floor((width - overflowWidth) / 2) - (leftWidth + 1);
					const before = Math.max(1, Math.min(centered, rest - overflowWidth - 1));
					tail = "─".repeat(before) + overflow + "─".repeat(rest - before - overflowWidth);
				}
			}
			return left + border(` ${tail}`);
		}

		return super.renderTopBorder(width, hiddenLineCount);
	}
}
