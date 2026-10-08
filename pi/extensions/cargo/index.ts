import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import clippy from "./clippy.ts";
import dependencyPath from "./dependency-path.ts";
import test from "./test.ts";

export default function (pi: ExtensionAPI) {
	for (const tool of [clippy, test, dependencyPath]) pi.registerTool(tool);
}
