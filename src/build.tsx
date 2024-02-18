import path from "path";
import fs from "fs";
import config from "../grandis.toml";
import type { Route } from "./route";
import type { Component } from "@kitajs/html";

const cwd = process.cwd();
export const layoutPath = path.join(cwd, "layout");
export const contentDirectory = path.join(cwd, "content");
export const outDirectory = path.join(cwd, "out");
export const selectedLayoutPath = path.join(
	layoutPath,
	config.style.layout || "default"
);

export default function build() {
	console.log("🔨 Running build");

	if (
		!fs.existsSync(selectedLayoutPath) ||
		!fs.statSync(selectedLayoutPath).isDirectory()
	) {
		throw new Error(`Theme doesn't exist on path "${selectedLayoutPath}."`);
	}

	import(selectedLayoutPath).then((mod) => {
		const route = mod.default as Route<string>;
		route.buildHandler(buildPage).saveHandler(savePage);

		fs.rmSync(outDirectory, { recursive: true });
		route.build();
	});
}

export function buildPage(render: Component | undefined) {
	if (render == null) return "";

	const content = render({}).toString();
	return content;
}

export function savePage(fullpath: string, content: string) {
	const pagePath = path.join(outDirectory, fullpath);
	const filePath = path.join(pagePath, "index.html");
	if (!fs.existsSync(pagePath)) {
		fs.mkdirSync(pagePath);
	}
	const file = Bun.file(filePath);
	const writer = file.writer();
	writer.write(content);
	writer.end();

	return;
}
