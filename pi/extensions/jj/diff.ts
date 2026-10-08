import { defineTool } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { list } from "../lib/tool-params.ts";
import { READ_ONLY } from "../lib/tool-result.ts";
import { revisions } from "./revision-params.ts";
import { jj } from "./run-jj.ts";

export default defineTool({
	name: "jj-diff",
	label: "jj diff",
	description:
		"Show a jj diff. Defaults to the current working copy; narrow with `revision` or `from`/`to`, and/or `path`.",
	annotations: READ_ONLY,
	parameters: Type.Object({
		revision: Type.Optional(Type.String({ description: "Show this revision's changes" })),
		from: Type.Optional(Type.String()),
		to: Type.Optional(Type.String()),
		path: revisions("Limit to these paths"),
		stat: Type.Optional(Type.Boolean({ description: "Only a per-file summary" })),
	}),
	execute: (_id, p, signal, _u, ctx) => {
		if (p.revision && (p.from || p.to)) throw new Error("Use either `revision` or `from`/`to`.");
		const args = ["diff", p.stat ? "--stat" : "--git"];
		if (p.revision) args.push("-r", p.revision);
		if (p.from) args.push("--from", p.from);
		if (p.to) args.push("--to", p.to);
		return jj([...args, ...list(p.path)], ctx, signal);
	},
});
