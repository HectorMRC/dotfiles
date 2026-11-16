import { mkdir, rm } from "node:fs/promises";
import { dirname } from "node:path";
import { DEFAULT_WORKSPACE, exists, workspacePath, workspaceRoot } from "./paths.ts";
import { jj, jjOutput } from "./run.ts";

export async function addWorkspace(cwd: string, name: string, revision = "trunk()", signal?: AbortSignal) {
	const path = await workspacePath(cwd, name, signal);
	await mkdir(dirname(path), { recursive: true });
	const result = await jj(["workspace", "add", "--name", name, "-r", revision, path], cwd, signal, "tail");
	return { path, output: result.content[0].text };
}

// Any jj command run inside a workspace snapshots its working copy.
export async function refreshWorkspace(path: string, signal?: AbortSignal): Promise<void> {
	await jjOutput(["status"], path, signal);
}

export async function forgetWorkspace(cwd: string, name: string, force = false, signal?: AbortSignal) {
	if (name === DEFAULT_WORKSPACE) throw new Error(`Refusing to forget the "${DEFAULT_WORKSPACE}" workspace.`);
	const path = await workspacePath(cwd, name, signal);
	if (path === (await workspaceRoot(cwd, signal))) {
		throw new Error(`This session is in "${name}"; switch to another workspace first.`);
	}

	const present = await exists(path);
	if (present && !force) {
		await refreshWorkspace(path, signal);
		const revset = `(trunk()..${name}@) ~ empty() ~ ::(bookmarks() | remote_bookmarks())`;
		const template = 'change_id.short() ++ " " ++ description.first_line() ++ "\\n"';
		const unsaved = await jjOutput(["log", "--no-graph", "-r", revset, "-T", template], cwd, signal);
		if (unsaved) {
			throw new Error(
				`Workspace "${name}" has changes no bookmark points to:\n${unsaved}\nSet a bookmark or pass \`force\`.`,
			);
		}
	}

	await jjOutput(["workspace", "forget", name], cwd, signal);
	if (present) await rm(path, { recursive: true, force: true });
	return { path, deleted: present };
}
