import type { BunFile } from "bun";
import fs from "node:fs";
import path from "path";

type ContentFile = { file: BunFile | TreeNode; path: string };
type TreeNode = Map<string, ContentFile | TreeNode>;

const SUPPORTED_FILETYPE = [".txt", ".md", ".mdx"];

function parseFilename(pathname: string) {
	const parsed = path.parse(pathname);
	if (!SUPPORTED_FILETYPE.includes(parsed.ext)) {
		throw new Error(`Unsupported file format "${parsed.ext}".`);
	}
	return parsed.name;
}

/**
 * Recursively generates a file tree.
 * @param pathname Path of the current node
 * @returns Section of a file tree
 */
export function getTreeNode(pathname: string): TreeNode | ContentFile {
	const isDirectory = fs.statSync(pathname).isDirectory();
	if (!isDirectory) return { file: Bun.file(pathname), path: pathname };

	const dirContents = fs.readdirSync(pathname);
	const tree: TreeNode = new Map();

	for (const filename of dirContents) {
		const filenameParsed = parseFilename(filename);
		const currentPath = path.join(pathname, filename);
		if (tree.has(filenameParsed))
			throw new Error(`Path conflict on ${currentPath}`);
		tree.set(filenameParsed, getTreeNode(currentPath));
	}

	return tree;
}

/**
 * Generates a file tree using Bun's file API.
 * @param pathname Root path of the target file tree
 * @returns File tree map
 */
export function generateTree(pathname: string) {
	const dirContents = fs.readdirSync(pathname);
	const tree: TreeNode = new Map();
	for (const directory of dirContents) {
		const currentPath = path.join(pathname, directory);
		const isDirectory = fs.statSync(currentPath).isDirectory();
		const nodename = isDirectory ? directory : parseFilename(directory);

		if (tree.has(nodename))
			throw new Error(`Path conflict on ${currentPath}`);

		tree.set(nodename, getTreeNode(path.join(pathname, directory)));
	}
	return tree;
}
