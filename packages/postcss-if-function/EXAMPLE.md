# PostCSS CSS `if()` Plugin Example

This example demonstrates how to use the PostCSS CSS `if()` plugin to transform CSS if() functions at build time.

## Setup

```bash
npm install postcss-if-function postcss
```

## Usage

```js
import postcss from "postcss";
import postcssCssIf from "postcss-if-function";

const css = `
.card {
  color: if(media(max-width: 768px), blue, red);
  display: if(supports(display: grid), grid, block);
}
`;

const result = await postcss([postcssCssIf()]).process(css, {
	from: undefined
});

console.log(result.css);
```

## Output

The plugin will transform the CSS if() functions into native @media and @supports rules:

```css
.card {
	color: red;
	display: block;
}

@media (max-width: 768px) {
	.card {
		color: blue;
	}
}

@supports (display: grid) {
	.card {
		display: grid;
	}
}
```

## Benefits

- **Build-time transformation**: No runtime JavaScript needed for media() and supports() conditions
- **Native CSS output**: Uses standard @media and @supports rules
- **Better performance**: Eliminates runtime processing overhead
- **Standards compliance**: Output is pure CSS that works everywhere

## Integration with Build Tools

### Vite

```js
// vite.config.js
import { defineConfig } from "vite";
import postcssCssIf from "postcss-if-function";

export default defineConfig({
	css: {
		postcss: {
			plugins: [postcssCssIf()]
		}
	}
});
```

### Webpack

```js
// webpack.config.js
module.exports = {
	module: {
		rules: [
			{
				test: /\.css$/,
				use: [
					"style-loader",
					"css-loader",
					{
						loader: "postcss-loader",
						options: {
							postcssOptions: {
								plugins: [["postcss-if-function", {}]]
							}
						}
					}
				]
			}
		]
	}
};
```
