import { defineTool } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { READ_ONLY } from "../lib/tool-result.ts";
import { jj } from "./run-jj.ts";

export default defineTool({
	name: "jj-show",
	label: "jj show",
	description: "Show a commit's full, untruncated description (jj-log truncates it to one line).",
	annotations: READ_ONLY,
	parameters: Type.Object({ revision: Type.Optional(Type.String({ description: "Default: @" })) }),
	execute: (_id, p, signal, _u, ctx) => jj(["show", "--summary", p.revision ?? "@"], ctx, signal),
});
