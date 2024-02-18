# Grandis

Grandis is a minimal static site generator template. It provides routing support, with [kitajs/html](https://github.com/kitajs/html) powered JSX rendering.

Grandis uses Bun's file API for loading file, so it doesn't work on other runtime.

Everything in this repo is subject to change.

## Getting Started

```bash
bun install grandis
```

```tsx
// This is required to register kitajs types, see more at @kitajs/html's documentation. 
import "@kitajs/html/register";

const route = new Route("", { prefix: ""})
	.page(() => <div>Index page</div>)
	.route(
		new Route("about", {})
			.page(() => <div>About page</div>)
	)
	.route(
		new Route("post", {})
			.page(() => <div>Post page</div>)
			.group(
				({ children })=> <div>{ children }</div>,
				{ source: [ "/absolute/path/to/file" ] }
			)
	);

route.saveHandler(save).buildHandler(build);
```

## API

### `Route()`

The `Route` class defines any route in a website, like `/`, `/about`. It handles the website's structure and rendering, things like file saving should be provided by the user. 

```tsx
const route = new Route("", { prefix: ""})
	.page(() => <div>Index page</div>);
```

#### Parameters

- `path: string`
	The name of the route. Only basic characters are allowed.
	- `"foo"`: ✅ valid
	- `"Bar"`: ✅ valid
	- `"foo/Bar"`: ❌ invalid
- `params: RouteParameters<"">`
	Parameters of the current route.
	- `prefix`: Prefix of the current route, useful for scenarios like deploying github pages.
	- `save`: `(fullpath: string, content: string) => void`
		Defines how the Route should be saved. Called immediately after build. It is passed to all the child routes automatically.

#### Methods

##### `route(route: Route): this`

Assign subroute to the current route.

This method also passes the parent `Route`'s `save` handler to the new route.

```tsx
import { Route } from "grandis/route"

const routes = new Route("", {})
	.route(new Route("about", {}));
```

##### `page(render: Component): this`

Assigns content to the current route.

```tsx
import { Route } from "grandis/route"

const routes = new Route("", {})
	.page(()=>{
		return (
			<html>
				<head>
					<title>Index Page</title>
				</head>
				<body>
					hello world!
				</body>
			</html>
		)
	});
```

##### `group(render: Component, params: Partial<GroupParameters>)`

Defines a series of subroutes for the current route. It will generate new `Route()` instances and add them subroutes.

- `render`
Content of each subroutes, rendered markdown content is passed in as child component.
- `params`
Extension of `RouteParameters`.
	- `source: Array<strings>`
	An array of absolute paths to be loaded as markdowns.

```tsx
const route = new Route("post", {})
	.group(
		({ children })=> <div>{ children }</div>,
		{ source: [ "/absolute/path/to/markdown" ] }
	);
```

##### `build(): void`

Render the route's page, calls the `save` handler, and calls subroutes' `build` recursively.

##### `saveHandler(save: NonNullable<typeof this.params.save>): this`

Assign a `save` handler to the current route and all subroutes. Unless you have a special usecase, you can copy&paste the example code.

The handler is automatically passed down the line, unless a subroute overwrites it.

```tsx
const outDirectory = path.join(process.cwd(), "out");

route.saveHandler((fullpath, content) => {
	const pagePath = path.join(outDirectory, fullpath);
	const filePath = path.join(pagePath, "index.html");
	if (!fs.existsSync(pagePath)) {
		fs.mkdirSync(pagePath);
	}
	const file = Bun.file(filePath);
	const writer = file.writer();
	writer.write(content);
	writer.end();
});
```

##### `buildHandler(build: NonNullable<typeof this.params.build>): this`

Assigns a `build` handler that's defines how the route and all subroutes is rendered. Unless you have a special usecase, you can copy&paste the example code.

The handler is automatically passed down the line, unless a subroute overwrites it.

```tsx
route.buildHandler((render: Component | undefined) => {
	if (render == null) return "";

	const content = render({}).toString();
	return content;
});
```

## Plugin

If you chose to use the save/build handler examples we provided, make sure to preload the custom MDX plugin before you start. See [bunfig#preload](https://bun.sh/docs/runtime/bunfig#preload) for more informantion.

This plugin loads `@mdx-js/mdx` with a custom loader in Bun's format and use's @kitajs/html's API for rendering. It's fairly simple to implement so we encourage you to write one that suits your particular need.

```toml
# bunfig.toml
preload = ["preload.ts"]
```

```ts
// preload.ts
import { plugin } from "bun";
import mdxLoader from "grandis/markdown";

await plugin(mdxLoader);
```