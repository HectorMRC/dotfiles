import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

export const CACHE_DIR = join(process.env.XDG_CACHE_HOME || join(homedir(), ".cache"), "pi-tools");

export async function cachePath(name: string): Promise<string> {
	await mkdir(CACHE_DIR, { recursive: true });
	return join(CACHE_DIR, `${Date.now()}-${randomUUID().slice(0, 8)}-${name}`);
}

export async function cacheFile(name: string, data: string | Uint8Array): Promise<string> {
	const path = await cachePath(name);
	await writeFile(path, data);
	return path;
}
