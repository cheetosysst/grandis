import { plugin } from "bun";
import mdxLoader from "./plugins/markdown";
import "@kitajs/html/register";

import buildTask from "./build";

const argv = Bun.argv;
const task = argv.at(2);

if (task == null) {
	console.error("Task error");
	process.exit(1);
}

plugin(mdxLoader);

if (task === "build") {
	buildTask();
} else {
	throw new Error(`Not supported task "${task}"`);
}
