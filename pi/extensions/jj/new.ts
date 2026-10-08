import { defineTool } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { list } from "../lib/tool-params.ts";
import { revisions } from "./revision-params.ts";
import { jjWithLog } from "./run-jj.ts";

export default defineTool({
	name: "jj-new",
	label: "jj new",
	description:
		"Create a new empty change and (unless `noEdit`) make it the working copy `@`. Use it to move around history: `jj-new` on top of an earlier or conflicted revision, edit files, then `jj-squash` into the parent to amend it (descendants are rebased automatically).",
	parameters: Type.Object({
		parents: revisions("Parent revisions (default: @). Several make a merge"),
		message: Type.Optional(Type.String()),
		noEdit: Type.Optional(Type.Boolean({ description: "Create the change without moving @ to it" })),
		insertAfter: revisions("Insert after these revisions instead of using parents"),
		insertBefore: revisions("Insert before these revisions instead of using parents"),
	}),
	execute: (_id, p, signal, _u, ctx) => {
		const args = ["new"];
		if (p.message) args.push("-m", p.message);
		if (p.noEdit) args.push("--no-edit");
		for (const r of list(p.insertAfter)) args.push("-A", r);
		for (const r of list(p.insertBefore)) args.push("-B", r);
		args.push(...list(p.parents));
		return jjWithLog(args, ctx, signal);
	},
});
