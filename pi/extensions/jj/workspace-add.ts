import { defineTool } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { addWorkspace } from "../lib/jj/workspace.ts";
import { text } from "../lib/tool-result.ts";

export default defineTool({
	name: "jj-workspace-add",
	label: "jj workspace add",
	description:
		"Create a jj workspace, an independent working copy of this repository at `../<repo>.workspaces/<name>`, so work there cannot clash with other agents. Does not move into it; use `jj-workspace-switch` for that.",
	parameters: Type.Object({
		name: Type.String({ description: "Workspace name, e.g. the issue ID" }),
		revision: Type.Optional(Type.String({ description: "Parent of its working-copy commit (default: trunk())" })),
	}),
	async execute(_id, p, signal, _u, ctx) {
		const { path, output } = await addWorkspace(ctx.cwd, p.name, p.revision, signal);
		return text(`${output}\n\nWorkspace "${p.name}" created at ${path}.`);
	},
});
