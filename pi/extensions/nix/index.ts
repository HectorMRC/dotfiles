import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import flakeCheck from "./flake-check.ts";
import flakeInfo from "./flake-info.ts";
import log from "./log.ts";

export default function (pi: ExtensionAPI) {
	for (const tool of [flakeCheck, log, flakeInfo]) pi.registerTool(tool);
}
