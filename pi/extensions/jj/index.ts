import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import commit from "./commit.ts";
import describe from "./describe.ts";
import diff from "./diff.ts";
import log from "./log.ts";
import newChange from "./new.ts";
import rebase from "./rebase.ts";
import restore from "./restore.ts";
import show from "./show.ts";
import squash from "./squash.ts";
import status from "./status.ts";

export default function (pi: ExtensionAPI) {
	for (const tool of [status, log, show, diff, commit, describe, newChange, squash, restore, rebase]) {
		pi.registerTool(tool);
	}
}
