import { defineTool } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { forgetWorkspace } from "../lib/jj/workspace.ts";
import { text } from "../lib/tool-result.ts";

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
		const { path, deleted } = await forgetWorkspace(ctx.cwd, p.name, p.force, signal);
		return text(`Forgot workspace "${p.name}"${deleted ? ` and deleted ${path}` : ""}.`);
	},
});
