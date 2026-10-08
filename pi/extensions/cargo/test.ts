import { defineTool } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { cargoBuild, targetArgs, targetParams } from "./run-cargo.ts";

export default defineTool({
	name: "cargo-test",
	label: "cargo test",
	description: "Run the test suite for a Rust crate or workspace.",
	parameters: Type.Object({
		...targetParams,
		filter: Type.Optional(Type.String({ description: "Only run tests whose name contains this" })),
	}),
	execute: (_id, p, signal, _u, ctx) =>
		cargoBuild(["test", ...targetArgs(p), ...(p.filter ? ["--", p.filter] : [])], ctx, signal),
});
