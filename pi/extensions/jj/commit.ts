import { defineTool } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { jjWithLog } from "../lib/jj/run.ts";
import { paths } from "./revision-params.ts";

export default defineTool({
	name: "jj-commit",
	label: "jj commit",
	description:
		"Commit the working copy with the given description and start a fresh empty `@` on top. The default tool for 'commit what I just did': it seals the revision so later edits land in a new one.",
	parameters: Type.Object({ message: Type.String(), paths }),
	execute: (_id, p, signal, _u, ctx) => jjWithLog(["commit", "-m", p.message, ...(p.paths ?? [])], ctx.cwd, signal),
});
