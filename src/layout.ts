import type { Component } from "@kitajs/html";
import { Glob } from "bun";
import path from "path";
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

		this.buildPage(fullpath, this.render);

		Promise.all(this.routes).then((routes) => {
			for (const route of routes) {
				route.parent = this;
				route.build();
			}
		});

		return this;
	}

	private buildPage(fullpath: string, render: Component | undefined) {
		if (render == null) return "";

		const content = render({}).toString();
		logger("debug", import.meta.file || "", `building page: ${fullpath}`);
		console.log(content);
		return content;
	}
}

const getPostPaths = () => {
	const globResults = new Glob("*.mdx").scanSync(contentDirectory);
	return globResults;
};
const Page = () => Html.createElement("div", {});

const tree = new Route("", { prefix: "blog" })
	.page(Page)
	.route(
		new Route("post", {})
			.page(Page)
			.group(({ children }) => Html.createElement("div", {}, children), {
				source: Array.from(getPostPaths()),
			}),
	)
	.route(new Route("about", {}).page(Page));

tree.build();
