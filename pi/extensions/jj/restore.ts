import { defineTool } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { exactlyOne } from "../lib/tool-params.ts";
import { paths } from "./revision-params.ts";
import { jjWithLog } from "./run-jj.ts";

export default defineTool({
	name: "jj-restore",
	label: "jj restore",
	description:
		'Restore paths in a revision from another revision. Defaults to restoring `@` from its parent, i.e. discarding working-copy changes. To undo a revision\'s changes use `from: "X-", into: "X"`. Set exactly one of `paths` or `all`.',
	annotations: { destructiveHint: true },
	parameters: Type.Object({
		from: Type.Optional(Type.String()),
		into: Type.Optional(Type.String()),
		paths,
		all: Type.Optional(Type.Boolean({ description: "Restore every path" })),
	}),
	execute: (_id, p, signal, _u, ctx) => {
		exactlyOne(p, ["paths", "all"]);
		const args = ["restore"];
		if (p.from) args.push("--from", p.from);
		if (p.into) args.push("--into", p.into);
		return jjWithLog([...args, ...(p.paths ?? [])], ctx, signal);
	},
});
