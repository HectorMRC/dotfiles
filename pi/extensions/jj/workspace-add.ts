import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { defineTool } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { text } from "../lib/tool-result.ts";
import { jj } from "./run-jj.ts";
import { workspacePath } from "./workspace-paths.ts";

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
		const path = await workspacePath(ctx.cwd, p.name, signal);
		await mkdir(dirname(path), { recursive: true });
		const args = ["workspace", "add", "--name", p.name, "-r", p.revision ?? "trunk()", path];
		const result = await jj(args, ctx, signal, "tail");
		return text(`${result.content[0].text}\n\nWorkspace "${p.name}" created at ${path}.`);
	},
});
