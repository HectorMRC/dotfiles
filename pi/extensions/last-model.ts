// Own state file: settings.json is managed by Nix.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { getAgentDir, type ExtensionAPI } from "@earendil-works/pi-coding-agent";

const STATE_FILE = join(getAgentDir(), "last-model.json");
const CLI_MODEL_FLAGS = ["--model", "--models", "--provider"];

interface LastModel {
	provider: string;
	model: string;
}

function load(): LastModel | undefined {
	try {
		const data = JSON.parse(readFileSync(STATE_FILE, "utf-8"));
		if (typeof data?.provider === "string" && typeof data?.model === "string") return data;
	} catch {}
	return undefined;
}

function save(state: LastModel): void {
	try {
		mkdirSync(dirname(STATE_FILE), { recursive: true });
		writeFileSync(STATE_FILE, `${JSON.stringify(state, null, 2)}\n`, "utf-8");
	} catch {}
}

function cliChoseModel(): boolean {
	return process.argv.some((arg) => CLI_MODEL_FLAGS.some((flag) => arg === flag || arg.startsWith(`${flag}=`)));
}

export default function (pi: ExtensionAPI) {
	pi.on("model_select", (event) => {
		if (event.source === "restore") return;
		save({ provider: event.model.provider, model: event.model.id });
	});

	pi.on("session_start", async (event, ctx) => {
		if (event.reason !== "startup" && event.reason !== "new") return;
		if (cliChoseModel()) return;
		// Resumed sessions keep their own model.
		if (ctx.sessionManager.getEntries().some((entry) => entry.type === "message")) return;

		const last = load();
		if (!last) return;
		if (ctx.model?.provider === last.provider && ctx.model.id === last.model) return;

		const model = ctx.modelRegistry.find(last.provider, last.model);
		if (model) await pi.setModel(model);
	});
}
