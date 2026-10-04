/**
 *   ───────────────────────────────────────────────
 *    ~/project        claude-opus · ctx 23% · 152k tok · $0.123
 *
 *      user input
 *       wrapped input stays aligned
 *   ───────────────────────────────────────────────
 */

import {
	CustomEditor,
	type CustomEditorOptions,
	type ExtensionContext,
	type KeybindingsManager,
} from "@earendil-works/pi-coding-agent";
import type { EditorTheme, TUI, TuiMouseEvent, TuiMouseEventResult } from "@earendil-works/pi-tui";
import { buildStatusLine } from "./status.ts";

/** Nerd Font glyph, same as the starship prompt (home-manager/zsh.nix). */
export const PROMPT_SYMBOL = "\u{f4b5}";
/** Space + symbol + space. */
const PROMPT_PADDING = 3;
/** Status line + blank line, inserted below the top border. */
const STATUS_ROWS = 2;

export interface PromptBoxOptions extends Omit<CustomEditorOptions, "paddingX"> {
	ctx: () => ExtensionContext;
}

export class PromptBoxEditor extends CustomEditor {
	protected readonly getCtx: () => ExtensionContext;

	constructor(tui: TUI, theme: EditorTheme, keybindings: KeybindingsManager, options: PromptBoxOptions) {
		const { ctx, ...rest } = options;
		super(tui, theme, keybindings, { ...rest, paddingX: PROMPT_PADDING });
		this.getCtx = ctx;
	}

	/** pi pushes its `editorPaddingX` setting into custom editors; keep ours. */
	override setPaddingX(_padding: number): void {
		super.setPaddingX(PROMPT_PADDING);
	}

	protected promptColor(text: string): string {
		return this.getCtx().ui.theme.fg("text", text);
	}

	override render(width: number): string[] {
		const lines = super.render(width);
		if (lines.length < 2 || width < PROMPT_PADDING + 2) return lines;

		// Only when not scrolled past the first input line.
		const scrollOffset = (this as unknown as { scrollOffset?: number }).scrollOffset ?? 0;
		const first = lines[1];
		if (scrollOffset === 0 && first !== undefined && first.startsWith(" ".repeat(PROMPT_PADDING))) {
			lines[1] = ` ${this.promptColor(PROMPT_SYMBOL)} ${first.slice(PROMPT_PADDING)}`;
		}

		lines.splice(1, 0, buildStatusLine(this.getCtx(), width), "");
		return lines;
	}

	override handleMouse(event: TuiMouseEvent): TuiMouseEventResult | undefined {
		if (event.y >= 1 && event.y < 1 + STATUS_ROWS) {
			return event.type === "click" ? { handled: true, focus: true } : undefined;
		}
		const y = event.y >= 1 + STATUS_ROWS ? event.y - STATUS_ROWS : event.y;
		return super.handleMouse({ ...event, y });
	}
}
