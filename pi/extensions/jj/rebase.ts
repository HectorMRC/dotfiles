import { defineTool } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { exactlyOne, list } from "../lib/tool-params.ts";
import { revisions } from "./revision-params.ts";
import { jjWithLog } from "./run-jj.ts";

export default defineTool({
	name: "jj-rebase",
	label: "jj rebase",
	description:
		"Move revisions to new parents. Choose what to move with exactly one of `source` (revision plus descendants) or `revisions` (just those, children get reparented), and where with `onto` or `insertAfter`/`insertBefore`. Conflicts are recorded in the commits, not raised as errors: check the returned log and resolve them.",
	parameters: Type.Object({
		source: revisions("Move these revisions and their descendants"),
		revisions: revisions("Move only these revisions"),
		onto: revisions("New parents"),
		insertAfter: revisions("Insert after these revisions"),
		insertBefore: revisions("Insert before these revisions"),
	}),
	execute: (_id, p, signal, _u, ctx) => {
		const what = exactlyOne(p, ["source", "revisions"]);
		if (p.onto === undefined && p.insertAfter === undefined && p.insertBefore === undefined) {
			throw new Error("Set `onto`, `insertAfter` or `insertBefore`.");
		}
		const args = ["rebase"];
		for (const r of list(p[what as "source" | "revisions"])) args.push(what === "source" ? "-s" : "-r", r);
		for (const r of list(p.onto)) args.push("-o", r);
		for (const r of list(p.insertAfter)) args.push("-A", r);
		for (const r of list(p.insertBefore)) args.push("-B", r);
		return jjWithLog(args, ctx, signal);
	},
});
