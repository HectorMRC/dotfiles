import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import cp from "./cp.ts";
import mkdir from "./mkdir.ts";
import mv from "./mv.ts";
import rm from "./rm.ts";
import tar from "./tar.ts";

export default function (pi: ExtensionAPI) {
	for (const tool of [cp, mv, rm, mkdir, tar]) pi.registerTool(tool);
}
