import { defineTool } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { jjWithLog } from "./run-jj.ts";

export default defineTool({
	name: "jj-split",
	label: "jj split",
	description:
		"Split a revision in two. The changes in `paths` go to a first revision described by `message`; the rest stay in a second revision on top that keeps the original description. With `parallel`, the two become siblings instead.",
	parameters: Type.Object({
		revision: Type.Optional(Type.String({ description: "Default: @" })),
		paths: Type.Array(Type.String(), { minItems: 1, description: "Filesets to move into the first revision" }),
		message: Type.String({ description: "Description of the first revision" }),
		parallel: Type.Optional(Type.Boolean({ description: "Make the two revisions siblings" })),
	}),
	execute: (_id, p, signal, _u, ctx) => {
		const args = ["split", "-m", p.message];
		if (p.revision) args.push("-r", p.revision);
		if (p.parallel) args.push("--parallel");
		args.push(...p.paths);
		return jjWithLog(args, ctx, signal);
	},
});
