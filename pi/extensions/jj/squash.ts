import { defineTool } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { exactlyOne } from "../lib/tool-params.ts";
import { paths } from "./revision-params.ts";
import { jjWithLog } from "./run-jj.ts";

export default defineTool({
	name: "jj-squash",
	label: "jj squash",
	description:
		"Squash changes from one revision into another. Defaults to squashing the working copy into its parent; narrow with `from`/`into` and `paths`. Set exactly one of `message` or `useDestinationMessage`.",
	parameters: Type.Object({
		from: Type.Optional(Type.String({ description: "Default: @" })),
		into: Type.Optional(Type.String({ description: "Default: parent of from" })),
		paths,
		message: Type.Optional(Type.String({ description: "Description of the combined revision" })),
		useDestinationMessage: Type.Optional(Type.Boolean({ description: "Keep the destination's description" })),
	}),
	execute: (_id, p, signal, _u, ctx) => {
		exactlyOne(p, ["message", "useDestinationMessage"]);
		const args = ["squash"];
		if (p.from) args.push("--from", p.from);
		if (p.into) args.push("--into", p.into);
		args.push(...(p.message !== undefined ? ["-m", p.message] : ["-u"]), ...(p.paths ?? []));
		return jjWithLog(args, ctx, signal);
	},
});
