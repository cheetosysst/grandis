import type { Component } from "@kitajs/html";
import path from "path";
import type { MDXModule } from "mdx/types";

type PartialRoute<T extends string> = T extends `${string}/${string}`
	? never
	: T;

export type RouteParameters<T extends string> = {
	prefix: PartialRoute<T>;
	save: (fullpath: string, content: string) => void;
	build: (render: Component | undefined) => string;
};

export type GroupParameters = RouteParameters<string> & {
	source: Array<string>;
};

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
		subroute.params.save ??= this.params.save;
		subroute.params.build ??= this.params.build;

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

		const group = Array.from(new Set(params.source)).map((route) =>
			this.generateGroupRoute(route, render),
		);
		this.routes = this.routes.concat(group);

		return this;
	}

	private async generateGroupRoute(
		pathname: string,
		render: Component<Partial<{ content: Component }>>,
	) {
		const module = await (import(pathname) as Promise<MDXModule>);
		const filename = path.parse(pathname).name;
		const params: Partial<RouteParameters<string>> = {
			save: this.params.save,
			build: this.params.build,
		};

		return new Route(filename, params).page(() =>
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

		if (this.params.save == null) {
			throw new Error(`Missing page save dependency on "${fullpath}".`);
		}
		if (this.params.build == null) {
			throw new Error(`Missing page build dependency on "${fullpath}".`);
		}

		const content = this.params.build(this.render);
		this.params.save(fullpath, content);

		Promise.all(this.routes).then((routes) => {
			for (const route of routes) {
				route.parent = this;
				route.build();
			}
		});

		return this;
	}

	buildHandler(build: NonNullable<typeof this.params.build>) {
		this.params.build = build;
		return this;
	}

	saveHandler(save: NonNullable<typeof this.params.save>) {
		this.params.save = save;
		return this;
	}
}
