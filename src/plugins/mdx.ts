import type { BunFile, BunPlugin, OnLoadArgs, OnLoadResult } from "bun";
import path from "path";
import { parseMarkdownToHtml, parseTextToHtml } from "../util/mdx";

async function parseContent(file: BunFile) {
	const pathData = path.parse(String(file.name));

	if (pathData.ext === ".txt") {
		const content = await file.text();
		return {
			default: parseTextToHtml(content),
		};
	}

	if (pathData.ext === ".md" || pathData.ext === ".mdx") {
		const content = file.text().then(parseMarkdownToHtml);
		return content;
	}

	throw new Error(`File ${file.name} is not supported.`);
}

async function loadFile(pathname: string) {
	const fileData = Bun.file(pathname);

	const fileExists = await fileData.exists();
	if (!fileExists) {
		throw new Error(`File ${pathname} doesn't exist.`);
	}
	return fileData;
}

async function onLoad(arg: OnLoadArgs) {
	const fileData = await loadFile(arg.path);

	const content = await parseContent(fileData);

	return {
		exports: content,
		loader: "object",
	} satisfies OnLoadResult;
}

const mdxLoader: BunPlugin = {
	name: "Custom grandis mdx loader",
	setup(build) {
		build.onLoad({ filter: /\.(md|mdx|txt)/ }, onLoad);
	},
};

export default mdxLoader;
