import { defineTool } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { jjWithLog } from "./run-jj.ts";

export default defineTool({
	name: "jj-describe",
	label: "jj describe",
	description:
		"Set a revision's description without closing it off; defaults to `@`. Use only to retitle a non-@ revision. Prefer `jj-commit` for the working copy, since `jj-describe` leaves `@` open and later edits pile onto it.",
	parameters: Type.Object({
		message: Type.String(),
		revision: Type.Optional(Type.String({ description: "Default: @" })),
	}),
	execute: (_id, p, signal, _u, ctx) => jjWithLog(["describe", "-m", p.message, p.revision ?? "@"], ctx, signal),
});
