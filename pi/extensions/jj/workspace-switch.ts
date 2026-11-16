import { type ExtensionAPI, type ExtensionCommandContext, SessionManager } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { otherWorkspace } from "../lib/jj/paths.ts";
import { text } from "../lib/tool-result.ts";

interface Request {
	name: string;
	kickoff: string;
}

const UNSAVED = "This session is not saved to a file, so it cannot move.";

async function switchTo(name: string, kickoff: string | undefined, ctx: ExtensionCommandContext) {
	await ctx.waitForIdle();
	const path = await otherWorkspace(ctx.cwd, name);
	const source = ctx.sessionManager.getSessionFile();
	if (!source) throw new Error(UNSAVED);
	const target = SessionManager.forkFrom(source, path).getSessionFile();
	if (!target) throw new Error(`Could not create a session in ${path}.`);
	await ctx.switchSession(target, {
		withSession: async (next) => {
			if (kickoff) await next.sendUserMessage(kickoff);
		},
	});
}

// Tools cannot switch sessions, so the tool queues a request that the `/workspace` command runs once the agent settles.
export default function (pi: ExtensionAPI, promptGuidelines: string[]) {
	let pending: Request | undefined;
	let dispatched: Request | undefined;

	pi.registerCommand("workspace", {
		description: "Move this session into a jj workspace: /workspace <name> (`default` is the main one)",
		handler: async (args, ctx) => {
			const name = args.trim();
			const kickoff = dispatched?.name === name ? dispatched.kickoff : undefined;
			dispatched = undefined;
			try {
				await switchTo(name, kickoff, ctx);
			} catch (error) {
				ctx.ui.notify((error as Error).message, "error");
			}
		},
	});

	pi.registerTool({
		name: "jj-workspace-switch",
		label: "jj workspace switch",
		description:
			"Move this session, with its conversation, into a jj workspace (`default` is the main one) after this response. All tools then run there.",
		promptGuidelines,
		parameters: Type.Object({
			name: Type.String({ description: "Workspace name" }),
			kickoff: Type.Optional(Type.String({ description: "Message to continue with once there" })),
		}),
		async execute(_id, p, signal, _u, ctx) {
			const path = await otherWorkspace(ctx.cwd, p.name, signal);
			if (!ctx.sessionManager.getSessionFile()) throw new Error(UNSAVED);
			pending = { name: p.name, kickoff: p.kickoff ?? `Continue the task in workspace "${p.name}" (${path}).` };
			return { ...text(`Switching to ${path} after this response.`), terminate: true };
		},
	});

	pi.on("agent_settled", () => {
		if (!pending) return;
		dispatched = pending;
		pending = undefined;
		pi.sendUserMessage(`/workspace ${dispatched.name}`, { expandPromptTemplates: true });
	});
}
