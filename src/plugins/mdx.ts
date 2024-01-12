import type { BunFile, BunPlugin, OnLoadArgs, OnLoadResult } from "bun";
import path from "path";
import { evaluate } from "@mdx-js/mdx";
import { Html } from "@kitajs/html";

function parseContent(file: BunFile) {
	const pathData = path.parse(String(file.name));

	// if (pathData.ext === ".txt") {
	// 	return "";
	// }

	if (pathData.ext === ".md" || pathData.ext === ".mdx") {
		const content = file.text().then((text) => {
			console.log({ text });
			return evaluate(text, {
				Fragment: Html.Fragment,
				jsx: (type, props, key) => {
					return Html.createElement(
						// biome-ignore lint/complexity/noBannedTypes: <explanation>
						type as string | Function,
						props,
						props.children,
					);
				},
				jsxs: (type, props, key) => {
					return Html.createElement(
						// biome-ignore lint/complexity/noBannedTypes: <explanation>
						type as string | Function,
						props,
						props.children,
					);
				},
			});
		});
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
	const exports = {};

	const fileData = await loadFile(arg.path);

	const content = await parseContent(fileData);
	// console.log(content.default());
	// String(content.toString());
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
