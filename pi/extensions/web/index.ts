import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import upload from "./upload.ts";
import webFetch from "./web-fetch.ts";

export default function (pi: ExtensionAPI) {
	pi.registerTool(webFetch);
	pi.registerTool(upload);
}
