# Grandis

Grandis is a minimal static site generator template. It provides routing support, [kitajs/html](https://github.com/kitajs/html) powered JSX and rendering support, and that's it.

Everything in this repo is subject to change.

## Planned feature

[ ] HTMX integration

## Getting Started

```bash
bun install
bun run build
```

```tsx
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
				{ source: ["./post1.md", "./post2.mdx", "./post1.txt"] }
			)
	);
```
