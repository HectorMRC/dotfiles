import { defineTool } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { jj } from "../lib/jj/run.ts";
import { READ_ONLY } from "../lib/tool-result.ts";

export default defineTool({
	name: "jj-log",
	label: "jj log",
	description: "Show recent jj commits. Defaults to the last 20 entries of the current stack (`trunk()..@`).",
	annotations: READ_ONLY,
	parameters: Type.Object({
		revisions: Type.Optional(Type.String({ description: "Revset (default: trunk()..@)" })),
		limit: Type.Optional(Type.Integer({ minimum: 1, description: "Max entries (default 20)" })),
	}),
	execute: (_id, p, signal, _u, ctx) =>
		jj(["log", "-r", p.revisions ?? "trunk()..@", "-n", String(p.limit ?? 20)], ctx.cwd, signal),
});
