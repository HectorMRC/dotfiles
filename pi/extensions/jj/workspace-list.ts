import { defineTool } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { READ_ONLY, text } from "../lib/tool-result.ts";
import { jj } from "./run-jj.ts";
import { mainRoot, pathFor } from "./workspace-paths.ts";

export default defineTool({
	name: "jj-workspace-list",
	label: "jj workspace list",
	description: "List the jj workspaces of this repository with their paths.",
	annotations: READ_ONLY,
	parameters: Type.Object({}),
	async execute(_id, _p, signal, _u, ctx) {
		const result = await jj(["workspace", "list"], ctx, signal);
		const main = await mainRoot(ctx.cwd, signal);
		const lines = result.content[0].text
			.split("\n")
			.filter(Boolean)
			.map((line) => {
				let path: string;
				try {
					path = pathFor(main, line.split(/[\s:]/, 1)[0]);
				} catch {
					path = "?";
				}
				return `${line}\n    ${path}`;
			});
		return text(lines.join("\n"));
	},
});
