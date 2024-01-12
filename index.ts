import { plugin } from "bun";
import mdx from "@mdx-js/esbuild";

declare global {
	const Html: typeof import("@kitajs/html/index");
}

const argv = Bun.argv;
const task = argv.at(2);

if (task == null) {
	console.error("Task error");
	process.exit(1);
}

const tasks: Record<string, { file: string }> = {
	dev: {
		file: "./src/dev.ts",
	},
};

if (!(task in tasks)) {
	console.error(
		`Task "${task}" not supported. Please refer to our documentation.`,
	);
}

plugin(
	// @ts-ignore
	mdx({
		jsxRuntime: undefined,
	}),
);

import(tasks[task].file)
	.then((mod) => mod.default())
	.catch((error) => {
		console.error(error);
		process.exit(-1);
	});
