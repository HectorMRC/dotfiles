import { rm } from "node:fs/promises";
import { defineTool } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { text } from "../lib/tool-result.ts";
import { jjOutput } from "./run-jj.ts";
import { DEFAULT_WORKSPACE, exists, workspacePath, workspaceRoot } from "./workspace-paths.ts";

export default defineTool({
	name: "jj-workspace-forget",
	label: "jj workspace forget",
	description:
		"Forget a jj workspace and delete its directory. Commits stay in the repository. Refuses the current workspace and, unless `force`, one with changes no bookmark points to.",
	parameters: Type.Object({
		name: Type.String({ description: "Workspace name" }),
		force: Type.Optional(Type.Boolean({ description: "Forget even with changes no bookmark points to" })),
	}),
	async execute(_id, p, signal, _u, ctx) {
		if (p.name === DEFAULT_WORKSPACE) throw new Error(`Refusing to forget the "${DEFAULT_WORKSPACE}" workspace.`);
		const path = await workspacePath(ctx.cwd, p.name, signal);
		if (path === (await workspaceRoot(ctx.cwd, signal))) {
			throw new Error(`This session is in "${p.name}"; switch to another workspace first.`);
		}

		const present = await exists(path);
		if (present && !p.force) {
			// Runs inside the workspace so its working copy is snapshotted first.
			const revset = `(trunk()..${p.name}@) ~ empty() ~ ::(bookmarks() | remote_bookmarks())`;
			const template = 'change_id.short() ++ " " ++ description.first_line() ++ "\\n"';
			const unsaved = await jjOutput(["log", "--no-graph", "-r", revset, "-T", template], path, signal);
			if (unsaved) {
				throw new Error(
					`Workspace "${p.name}" has changes no bookmark points to:\n${unsaved}\nSet a bookmark or pass \`force\`.`,
				);
			}
		}

		await jjOutput(["workspace", "forget", p.name], ctx.cwd, signal);
		if (present) await rm(path, { recursive: true, force: true });
		return text(`Forgot workspace "${p.name}"${present ? ` and deleted ${path}` : ""}.`);
	},
});
