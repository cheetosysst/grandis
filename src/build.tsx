import {
	generateTree,
	type ContentFile,
	type TreeNode,
} from "./util/structure";
import path from "path";
import fs from "fs";
import { logger } from "./util/log";

export default function build() {
	console.log("🔨 Running build mode");
	const contentRoot = path.join(process.cwd(), "content");
	const tree = generateTree(contentRoot);

	buildNode(tree);
}

const contentDirectory = path.join(process.cwd(), "content");

function generatePage(treeNode: ContentFile) {
	const parsedPath = path.parse(treeNode.path);
	const relativePath = path.relative(contentDirectory, parsedPath.dir);
	const targetDirectory = path.join("out", relativePath);
	const filename = `${parsedPath.name}.html`;

	logger(
		"info",
		"BUILD",
		`Generating page "${path.join(relativePath, parsedPath.base)}"`
	);

	import(treeNode.path).then((mod) => {
		const Component = mod.default;

		const content = Component({}).toString() as string;

		fs.mkdirSync(targetDirectory, { recursive: true });
		const file = Bun.file(path.join(targetDirectory, filename));
		const writer = file.writer();
		writer.write(content);
		writer.end();
	});
}

function buildNode(treeNode: TreeNode) {
	fs.rmSync(path.join(process.cwd(), "out", "*"), { recursive: true });
	if (!(treeNode instanceof Map)) return generatePage(treeNode);
	for (const [key, item] of treeNode) {
		buildNode(item as TreeNode);
	}
}
