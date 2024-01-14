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

const tasks: Record<string, { file: string }> = {
	dev: {
		file: "./dev.tsx",
	},
};

if (!(task in tasks)) {
	console.error(
		`Task "${task}" not supported. Please refer to our documentation.`,
	);
}

// plugin(mdx());
plugin(mdxLoader);

import(tasks[task].file)
	.then((mod) => mod.default())
	.catch((error) => {
		console.error(error);
		process.exit(-1);
	});
