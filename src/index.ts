import { plugin } from "bun";
import mdxLoader from "./plugins/mdx";
// import mdx from "@mdx-js/esbuild";
import "@kitajs/html/register";

const argv = Bun.argv;
const task = argv.at(2);

if (task == null) {
	console.error("Task error");
	process.exit(1);
}

type Task = { source: string };

const tasks: Record<string, Task> = {
	dev: {
		source: "./renderDemo",
	},
};

if (!(task in tasks)) {
	console.error(
		`Task "${task}" not supported. Please refer to our documentation.`,
	);
}

// plugin(mdx());
plugin(mdxLoader);

import(tasks[task].source)
	.then((mod) => mod.default())
	.catch((error) => {
		console.error(error);
		process.exit(-1);
	});
