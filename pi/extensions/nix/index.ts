import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import flakeCheck from "./flake-check.ts";
import flakeInfo from "./flake-info.ts";
import log from "./log.ts";

const promptGuidelines = ["For Nix flakes, use `nix-flake-check`, `nix-log` and `nix-flake-info`."];

export default function (pi: ExtensionAPI) {
	for (const tool of [flakeCheck, log, flakeInfo]) pi.registerTool({ ...tool, promptGuidelines });
}
