import { readFile, realpath, stat } from "node:fs/promises";
import { basename, dirname, join, resolve } from "node:path";
import { jjOutput } from "./run-jj.ts";

export const DEFAULT_WORKSPACE = "default";

const NAME = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

export async function workspaceRoot(cwd: string, signal?: AbortSignal): Promise<string> {
	return realpath(await jjOutput(["workspace", "root"], cwd, signal));
}

// A secondary workspace's `.jj/repo` is a file holding the path of the main `.jj/repo` directory.
export async function mainRoot(cwd: string, signal?: AbortSignal): Promise<string> {
	const root = await workspaceRoot(cwd, signal);
	const repo = join(root, ".jj", "repo");
	if ((await stat(repo)).isDirectory()) return root;
	const target = resolve(join(root, ".jj"), (await readFile(repo, "utf8")).trim());
	return realpath(dirname(dirname(target)));
}

export function pathFor(main: string, name: string): string {
	if (name === DEFAULT_WORKSPACE) return main;
	if (!NAME.test(name)) throw new Error(`Invalid workspace name "${name}": use letters, digits, ".", "_" or "-".`);
	return join(dirname(main), `${basename(main)}.workspaces`, name);
}

export async function workspacePath(cwd: string, name: string, signal?: AbortSignal): Promise<string> {
	return pathFor(await mainRoot(cwd, signal), name);
}

// Path of an existing workspace other than the current one.
export async function otherWorkspace(cwd: string, name: string, signal?: AbortSignal): Promise<string> {
	const path = await workspacePath(cwd, name, signal);
	if (!(await exists(path))) throw new Error(`Workspace "${name}" does not exist at ${path}.`);
	if (path === (await workspaceRoot(cwd, signal))) throw new Error(`Already in workspace "${name}".`);
	return path;
}

export async function exists(path: string): Promise<boolean> {
	return stat(path).then(
		(s) => s.isDirectory(),
		() => false,
	);
}
