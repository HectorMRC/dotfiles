import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import commit from "./commit.ts";
import describe from "./describe.ts";
import diff from "./diff.ts";
import log from "./log.ts";
import newChange from "./new.ts";
import rebase from "./rebase.ts";
import restore from "./restore.ts";
import show from "./show.ts";
import split from "./split.ts";
import squash from "./squash.ts";
import status from "./status.ts";
import workspaceAdd from "./workspace-add.ts";
import workspaceForget from "./workspace-forget.ts";
import workspaceList from "./workspace-list.ts";
import registerWorkspaceSwitch from "./workspace-switch.ts";

const promptGuidelines = [
	"When `.jj` exists, use the `jj-*` tools for version control, even if `.git` also exists.",
	"Use the `parallel-work` skill for concurrent work in one repository; only touch files inside your own jj workspace, and never switch into a workspace another agent is using.",
];

export default function (pi: ExtensionAPI) {
	for (const tool of [
		status,
		log,
		show,
		diff,
		commit,
		describe,
		newChange,
		squash,
		split,
		restore,
		rebase,
		workspaceAdd,
		workspaceList,
		workspaceForget,
	]) {
		pi.registerTool({ ...tool, promptGuidelines });
	}
	registerWorkspaceSwitch(pi, promptGuidelines);
}
