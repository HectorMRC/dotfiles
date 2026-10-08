import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import fd from "./fd.ts";
import rg from "./rg.ts";

export default function (pi: ExtensionAPI) {
	pi.registerTool(rg);
	pi.registerTool(fd);
}
