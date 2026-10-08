import { defineTool } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { cargoBuild, targetArgs, targetParams } from "./run-cargo.ts";

export default defineTool({
	name: "cargo-clippy",
	label: "cargo clippy",
	description: "Lint and type-check a Rust crate or workspace with clippy (all targets).",
	parameters: Type.Object(targetParams),
	execute: (_id, p, signal, _u, ctx) =>
		cargoBuild(["clippy", ...targetArgs(p), "--all-targets", "--message-format=short"], ctx, signal),
});
