import type { Component } from "@kitajs/html";
import path from "path";
import fs from "fs";
import { logger } from "./util/log";
import type { MDXModule } from "mdx/types";

type PartialRoute<T extends string> = T extends `${string}/${string}`
	? never
	: T;

type RouteParameters<T extends string> = {
	prefix: PartialRoute<T>;
	name: string;
	source: string;
};

type GroupParameters = Omit<RouteParameters<string>, "source"> & {
	source: Array<string>;
};

const contentDirectory = path.join(process.cwd(), "content");
const outDirectory = path.join(process.cwd(), "out");

export class Route<T extends string> {
	public parent: Route<string> | undefined = undefined;
	private params: Partial<RouteParameters<T>> = {};
	private render: Component | undefined = undefined;
	private path = "";
	private routes: Array<Route<string> | Promise<Route<string>>> = new Array();

	constructor(path: PartialRoute<T>, params: Partial<RouteParameters<T>>) {
		this.params = params;
		this.path = path;
	}

	route<S extends string>(subroute: Route<S>) {
		this.routes.push(subroute);
		return this;
	}

	page(render: Component) {
		this.render = render;
		return this;
	}

	group(render: Component, params: Partial<GroupParameters>) {
		if (params.source == null) {
			throw new Error(`Missing pages source under "${this.fullpath}"`);
		}

		const group = params.source.map((route) =>
			this.generateGroupRoute(route, render),
		);
		this.routes = this.routes.concat(group);

		return this;
	}

	private async generateGroupRoute(
		pathname: string,
		render: Component<Partial<{ content: Component }>>,
	) {
		const fullpath = path.join(contentDirectory, pathname);
		const module = await (import(fullpath) as Promise<MDXModule>).catch(
			(e) => {
				console.error(e);
				throw new Error(`Cannot load file on path "${pathname}"`);
			},
		);
		const filename = path.parse(pathname).name;

		return new Route(filename, {}).page(() =>
			render({ children: [module.default({})] }),
		);
	}

	get fullpath() {
		const parentPath = this.parent?.fullpath || "";
		const prefixPath = this.params.prefix || "";
		const fullpath = path.join("/", parentPath, prefixPath, this.path);
		return fullpath;
	}

	build() {
		const fullpath = this.fullpath;

		logger("debug", import.meta.file || "", `building page: ${fullpath}`);
		const content = this.buildPage(this.render);
		logger("debug", import.meta.file || "", `building page: ${fullpath}`);
		this.savePage(fullpath, content);

		Promise.all(this.routes).then((routes) => {
			for (const route of routes) {
				route.parent = this;
				route.build();
			}
		});

		return this;
	}

	private buildPage(render: Component | undefined) {
		if (render == null) return "";

		const content = render({}).toString();
		return content;
	}

	private savePage(fullpath: string, content: string) {
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
}
