/**
 * Plan mode: read-only exploration (/plan or Ctrl+Alt+P). Extracts numbered
 * steps from a "Plan:" section and tracks [DONE:n] markers during execution.
 */

import type { AgentMessage } from "@earendil-works/pi-agent-core";
import type { AssistantMessage, TextContent } from "@earendil-works/pi-ai";
import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { Key } from "@earendil-works/pi-tui";
import { type PlanEditorMode, PlanModeEditor } from "./editor.ts";
import { extractTodoItems, isSafeCommand, markCompletedSteps, type TodoItem } from "./utils.ts";

const PLAN_MODE_TOOLS = ["read", "bash", "grep", "find", "ls"];
const NORMAL_MODE_TOOLS = ["read", "bash", "edit", "write", "grep", "find", "ls"];
const PLAN_MODE_DISABLED_TOOLS = new Set<string>(["edit", "write"]);
const PLAN_MANAGED_TOOLS = new Set<string>([...PLAN_MODE_TOOLS, ...NORMAL_MODE_TOOLS]);

const DONE_TAG_INSTRUCTIONS = `Mark each step as soon as it is finished: write [DONE:n] (n = step number) in your
response text right after completing step n, before starting work on the next step.
Do not save the tags up for a final summary - progress is tracked live from them.`;

interface PlanModeState {
	enabled: boolean;
	todos?: TodoItem[];
	executing?: boolean;
	toolsBeforePlanMode?: string[];
}

function isAssistantMessage(m: AgentMessage): m is AssistantMessage {
	return m.role === "assistant" && Array.isArray(m.content);
}

function getTextContent(message: AssistantMessage): string {
	return message.content
		.filter((block): block is TextContent => block.type === "text")
		.map((block) => block.text)
		.join("\n");
}

export default function planModeExtension(pi: ExtensionAPI): void {
	let planModeEnabled = false;
	let executionMode = false;
	let todoItems: TodoItem[] = [];
	let toolsBeforePlanMode: string[] | undefined;
	let editor: PlanModeEditor | undefined;

	function editorMode(): PlanEditorMode {
		if (planModeEnabled) return "plan";
		if (executionMode && todoItems.length > 0) return "executing";
		return "normal";
	}

	function installEditor(ctx: ExtensionContext): void {
		if (!ctx.hasUI) return;
		ctx.ui.setStatus("plan-mode", undefined);
		ctx.ui.setEditorComponent((tui, theme, keybindings) => {
			editor = new PlanModeEditor(tui, theme, keybindings, {
				mode: editorMode,
				progress: () => ({
					completed: todoItems.filter((t) => t.completed).length,
					total: todoItems.length,
				}),
				theme: () => ctx.ui.theme,
				ctx: () => ctx,
			});
			return editor;
		});
	}

	pi.registerFlag("plan", {
		description: "Start in plan mode (read-only exploration)",
		type: "boolean",
		default: false,
	});

	function updateStatus(ctx: ExtensionContext): void {
		// The editor reads plan state lazily.
		editor?.refresh();

		if (executionMode && todoItems.length > 0) {
			const lines = todoItems.map((item) => {
				if (item.completed) {
					return (
						ctx.ui.theme.fg("success", "☑ ") +
						ctx.ui.theme.fg("muted", ctx.ui.theme.strikethrough(item.text))
					);
				}
				return `${ctx.ui.theme.fg("muted", "☐ ")}${item.text}`;
			});
			ctx.ui.setWidget("plan-todos", lines);
		} else {
			ctx.ui.setWidget("plan-todos", undefined);
		}
	}

	function uniqueToolNames(toolNames: string[]): string[] {
		return [...new Set(toolNames)];
	}

	function getPlanModeTools(activeToolNames: string[]): string[] {
		return uniqueToolNames([
			...activeToolNames.filter((name) => !PLAN_MODE_DISABLED_TOOLS.has(name)),
			...PLAN_MODE_TOOLS,
		]);
	}

	function getNormalModeTools(activeToolNames: string[]): string[] {
		return uniqueToolNames([
			...NORMAL_MODE_TOOLS,
			...activeToolNames.filter((name) => !PLAN_MANAGED_TOOLS.has(name)),
		]);
	}

	function enablePlanModeTools(): void {
		if (toolsBeforePlanMode === undefined) {
			toolsBeforePlanMode = pi.getActiveTools();
		}
		pi.setActiveTools(getPlanModeTools(toolsBeforePlanMode));
	}

	function restoreNormalModeTools(): void {
		pi.setActiveTools(toolsBeforePlanMode ?? getNormalModeTools(pi.getActiveTools()));
		toolsBeforePlanMode = undefined;
	}

	function persistState(): void {
		pi.appendEntry("plan-mode", {
			enabled: planModeEnabled,
			todos: todoItems,
			executing: executionMode,
			toolsBeforePlanMode,
		});
	}

	function togglePlanMode(ctx: ExtensionContext): void {
		planModeEnabled = !planModeEnabled;
		executionMode = false;
		todoItems = [];

		if (planModeEnabled) {
			enablePlanModeTools();
			ctx.ui.notify("Plan mode enabled. Built-in write tools disabled.");
		} else {
			restoreNormalModeTools();
			ctx.ui.notify("Plan mode disabled. Full access restored.");
		}
		updateStatus(ctx);
		persistState();
	}

	pi.registerCommand("plan", {
		description: "Toggle plan mode (read-only exploration)",
		handler: async (_args, ctx) => togglePlanMode(ctx),
	});

	pi.registerCommand("todos", {
		description: "Show current plan todo list",
		handler: async (_args, ctx) => {
			if (todoItems.length === 0) {
				ctx.ui.notify("No todos. Create a plan first with /plan", "info");
				return;
			}
			const list = todoItems.map((item, i) => `${i + 1}. ${item.completed ? "✓" : "○"} ${item.text}`).join("\n");
			ctx.ui.notify(`Plan Progress:\n${list}`, "info");
		},
	});

	pi.registerShortcut(Key.ctrlAlt("p"), {
		description: "Toggle plan mode",
		handler: async (ctx) => togglePlanMode(ctx),
	});

	pi.on("tool_call", async (event) => {
		if (!planModeEnabled || event.toolName !== "bash") return;

		const command = event.input.command as string;
		if (!isSafeCommand(command)) {
			return {
				block: true,
				reason: `Plan mode: command blocked (not allowlisted). Use /plan to disable plan mode first.\nCommand: ${command}`,
			};
		}
	});

	// Drop stale plan mode context once plan mode is off.
	pi.on("context", async (event) => {
		if (planModeEnabled) return;

		return {
			messages: event.messages.filter((m) => {
				const msg = m as AgentMessage & { customType?: string };
				if (msg.customType === "plan-mode-context") return false;
				if (msg.role !== "user") return true;

				const content = msg.content;
				if (typeof content === "string") {
					return !content.includes("[PLAN MODE ACTIVE]");
				}
				if (Array.isArray(content)) {
					return !content.some(
						(c) => c.type === "text" && (c as TextContent).text?.includes("[PLAN MODE ACTIVE]"),
					);
				}
				return true;
			}),
		};
	});

	pi.on("before_agent_start", async () => {
		if (planModeEnabled) {
			return {
				message: {
					customType: "plan-mode-context",
					content: `[PLAN MODE ACTIVE]
You are in plan mode - a read-only exploration mode for safe code analysis.

Restrictions:
- Built-in edit and write tools are disabled
- Other currently active tools remain available
- Bash is restricted to an allowlist of read-only commands

Ask the user clarifying questions when needed.

Create a detailed numbered plan under a "Plan:" header:

Plan:
1. First step description
2. Second step description
...

Do NOT attempt to make changes - just describe what you would do.`,
					display: false,
				},
			};
		}

		if (executionMode && todoItems.length > 0) {
			const remaining = todoItems.filter((t) => !t.completed);
			const todoList = remaining.map((t) => `${t.step}. ${t.text}`).join("\n");
			return {
				message: {
					customType: "plan-execution-context",
					content: `[EXECUTING PLAN - Full tool access enabled]

Remaining steps:
${todoList}

Execute each step in order.
${DONE_TAG_INSTRUCTIONS}`,
					display: false,
				},
			};
		}
	});

	// Picks up [DONE:n] tags live while the message streams.
	function syncDoneTags(message: AgentMessage, ctx: ExtensionContext): boolean {
		if (!executionMode || todoItems.length === 0 || !isAssistantMessage(message)) return false;
		const before = todoItems.filter((t) => t.completed).length;
		markCompletedSteps(getTextContent(message), todoItems);
		const changed = todoItems.filter((t) => t.completed).length !== before;
		if (changed) updateStatus(ctx);
		return changed;
	}

	let unsavedProgress = false;
	// Unmarked steps listed by the last reminder, so each set is reminded once.
	let remindedSteps: string | undefined;
	pi.on("message_update", async (event, ctx) => {
		if (syncDoneTags(event.message, ctx)) unsavedProgress = true;
	});
	pi.on("message_end", async (event, ctx) => {
		if (syncDoneTags(event.message, ctx) || unsavedProgress) {
			unsavedProgress = false;
			persistState();
		}
	});

	pi.on("agent_end", async (event, ctx) => {
		if (executionMode && todoItems.length > 0) {
			// Unmarked steps are handled in agent_before_settle.
			if (todoItems.some((t) => !t.completed)) return;

			remindedSteps = undefined;
			const completedList = todoItems.map((t) => `~~${t.text}~~`).join("\n");
			pi.sendMessage(
				{ customType: "plan-complete", content: `**Plan Complete!** ✓\n\n${completedList}`, display: true },
				{ triggerTurn: false },
			);
			executionMode = false;
			todoItems = [];
			updateStatus(ctx);
			persistState();
			return;
		}

		if (!planModeEnabled || !ctx.hasUI) return;

		// Only prompt when the last message has a plan, not on follow-up answers.
		const lastAssistant = [...event.messages].reverse().find(isAssistantMessage);
		const extracted = lastAssistant ? extractTodoItems(getTextContent(lastAssistant)) : [];
		if (extracted.length === 0) return;
		todoItems = extracted;
		persistState();

		const todoListText = todoItems.map((t, i) => `${i + 1}. ☐ ${t.text}`).join("\n");
		const planTodoListMessage = {
			customType: "plan-todo-list",
			content: `**Plan Steps (${todoItems.length}):**\n\n${todoListText}`,
			display: true,
		};

		const choice = await ctx.ui.select("Plan mode - what next?", [
			"Execute the plan (track progress)",
			"Stay in plan mode",
			"Refine the plan",
		]);

		if (choice?.startsWith("Execute")) {
			const firstTodoItem = todoItems[0];
			if (!firstTodoItem) return;

			planModeEnabled = false;
			executionMode = true;
			remindedSteps = undefined;
			restoreNormalModeTools();
			updateStatus(ctx);
			persistState();

			// One message, so the step list never arrives without the tagging instructions.
			const execMessage = `Execute the plan.

Steps:
${todoListText}

Start with: ${firstTodoItem.text}
${DONE_TAG_INSTRUCTIONS}`;
			pi.sendMessage(
				{ customType: "plan-mode-execute", content: execMessage, display: true },
				{ triggerTurn: true, deliverAs: "followUp" },
			);
		} else if (choice === "Refine the plan") {
			const refinement = await ctx.ui.editor("Refine the plan:", "");
			if (refinement?.trim()) {
				pi.sendMessage(planTodoListMessage, { deliverAs: "followUp" });
				pi.sendUserMessage(refinement.trim(), { deliverAs: "followUp" });
			}
		}
	});

	// Fires only when pi is about to go idle, so queued user messages run first.
	pi.on("agent_before_settle", async (event) => {
		if (!executionMode || event.outcome !== "completed") return;
		const remaining = todoItems.filter((t) => !t.completed);
		const key = remaining.map((t) => t.step).join(",");
		if (remaining.length === 0 || key === remindedSteps) return;

		remindedSteps = key;
		const list = remaining.map((t) => `${t.step}. ${t.text}`).join("\n");
		return {
			entries: [
				{
					type: "custom_message",
					customType: "plan-untagged-steps",
					content: `These plan steps are not marked as done:

${list}

For each one: if it is finished, verify it and write [DONE:n] in your response text now. Otherwise, state in one line why it is not finished. Do not start new work.`,
					display: true,
				},
			],
			continue: true,
		};
	});

	pi.on("session_start", async (_event, ctx) => {
		// Also fires for /new, /resume and /fork: don't leak previous session state.
		const wasPlanMode = planModeEnabled;
		const previousTools = toolsBeforePlanMode;
		planModeEnabled = false;
		executionMode = false;
		todoItems = [];
		toolsBeforePlanMode = undefined;
		unsavedProgress = false;
		remindedSteps = undefined;

		if (pi.getFlag("plan") === true) {
			planModeEnabled = true;
		}

		const entries = ctx.sessionManager.getEntries();

		const planModeEntry = entries
			.filter((e: { type: string; customType?: string }) => e.type === "custom" && e.customType === "plan-mode")
			.pop() as { data?: PlanModeState } | undefined;

		if (planModeEntry?.data) {
			planModeEnabled = planModeEntry.data.enabled ?? planModeEnabled;
			todoItems = planModeEntry.data.todos ?? todoItems;
			executionMode = planModeEntry.data.executing ?? executionMode;
			toolsBeforePlanMode = planModeEntry.data.toolsBeforePlanMode ?? toolsBeforePlanMode;
		}

		// On resume, rebuild completion from messages after the last
		// "plan-mode-execute", ignoring [DONE:n] from previous plans.
		const isResume = planModeEntry !== undefined;
		if (isResume && executionMode && todoItems.length > 0) {
			let executeIndex = -1;
			for (let i = entries.length - 1; i >= 0; i--) {
				const entry = entries[i] as { type: string; customType?: string };
				if (entry.customType === "plan-mode-execute") {
					executeIndex = i;
					break;
				}
			}

			const messages: AssistantMessage[] = [];
			for (let i = executeIndex + 1; i < entries.length; i++) {
				const entry = entries[i];
				if (
					entry.type === "message" &&
					"message" in entry &&
					isAssistantMessage(entry.message as AgentMessage)
				) {
					messages.push(entry.message as AssistantMessage);
				}
			}
			const allText = messages.map(getTextContent).join("\n");
			markCompletedSteps(allText, todoItems);
		}

		if (planModeEnabled) {
			// Don't snapshot the previous session's read-only set as the "normal" tools.
			if (wasPlanMode && toolsBeforePlanMode === undefined) toolsBeforePlanMode = previousTools;
			enablePlanModeTools();
		} else if (wasPlanMode) {
			// Previous session left the read-only tool set active.
			toolsBeforePlanMode = previousTools;
			restoreNormalModeTools();
		}
		installEditor(ctx);
		updateStatus(ctx);
	});
}
