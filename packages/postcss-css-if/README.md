# postcss-css-if

[![npm version](https://badge.fury.io/js/postcss-css-if.svg)](https://badge.fury.io/js/postcss-css-if)
[![Build Status](https://github.com/mfranzke/css-if-polyfill/workflows/CI/badge.svg)](https://github.com/mfranzke/css-if-polyfill/actions)

A [PostCSS](https://postcss.org/) plugin for transforming CSS `if()` functions into native CSS `@media` and `@supports` rules at build time.

This plugin is part of the [css-if-polyfill](../css-if-polyfill) project and provides build-time transformation of conditional CSS, eliminating the need for runtime JavaScript processing when using only `media()` and `supports()` functions.

## Installation

```bash
npm install postcss-css-if
```

## Usage

### Basic Usage

```js
import postcss from "postcss";
import postcssCssIf from "postcss-css-if";

const css = `
.example {
  color: if(media(max-width: 768px), blue, red);
  font-size: if(supports(display: grid), 1.2rem, 1rem);
}
`;

const result = await postcss([postcssCssIf()]).process(css, {
	from: undefined
});

console.log(result.css);
```

**Output:**

```css
.example {
	color: red;
	font-size: 1rem;
}

@media (max-width: 768px) {
	.example {
		color: blue;
	}
}

@supports (display: grid) {
	.example {
		font-size: 1.2rem;
	}
}
```

### With Options

```js
const result = await postcss([
	postcssCssIf({
		logTransformations: true,
		preserveOriginal: false,
		skipSelectors: [".no-transform"]
	})
]).process(css, { from: undefined });
```

### With Popular PostCSS Tools

#### Vite

```js
// vite.config.js
import { defineConfig } from "vite";
import postcssCssIf from "postcss-css-if";

export default defineConfig({
	css: {
		postcss: {
			plugins: [
				postcssCssIf({
					logTransformations: process.env.NODE_ENV === "development"
				})
			]
		}
	}
});
```

#### Webpack

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
								plugins: [
									[
										"postcss-css-if",
										{
											logTransformations: true
										}
									]
								]
							}
						}
					}
				]
			}
		]
	}
};
```

#### Next.js

```js
// next.config.js
module.exports = {
	experimental: {
		postcss: {
			plugins: {
				"postcss-css-if": {
					logTransformations: process.env.NODE_ENV === "development"
				}
			}
		}
	}
};
```

## Options

| Option               | Type       | Default | Description                                                                |
| -------------------- | ---------- | ------- | -------------------------------------------------------------------------- |
| `preserveOriginal`   | `boolean`  | `false` | Whether to preserve original CSS alongside transformations (for debugging) |
| `logTransformations` | `boolean`  | `false` | Whether to log transformation statistics to console                        |
| `skipSelectors`      | `string[]` | `[]`    | Array of selectors to skip transformation for                              |

## Supported Transformations

### Media Queries

```css
/* Input */
.responsive {
	width: if(media(max-width: 768px), 100%, 50%);
}

/* Output */
.responsive {
	width: 50%;
}

@media (max-width: 768px) {
	.responsive {
		width: 100%;
	}
}
```

### Feature Support Queries

```css
/* Input */
.grid {
	display: if(supports(display: grid), grid, block);
}

/* Output */
.grid {
	display: block;
}

@supports (display: grid) {
	.grid {
		display: grid;
	}
}
```

### Complex Nested Conditions

```css
/* Input */
.complex {
	color: if(
		media(max-width: 768px),
		if(supports(color: lab(50% 20 -30)), lab(50% 20 -30), blue),
		red
	);
}

/* Output */
.complex {
	color: red;
}

@media (max-width: 768px) {
	.complex {
		color: blue;
	}
}

@media (max-width: 768px) {
	@supports (color: lab(50% 20 -30)) {
		.complex {
			color: lab(50% 20 -30);
		}
	}
}
```

## Limitations

- **Style Functions Not Supported**: This plugin only transforms `media()` and `supports()` functions. For `style()` functions (which depend on runtime DOM state), use the [css-if-polyfill](../css-if-polyfill) runtime library
- **Static Analysis Only**: The plugin performs static analysis and cannot handle dynamically generated CSS
- **PostCSS Compatibility**: Requires PostCSS 8.0.0 or higher

## Integration with Runtime Polyfill

For complete CSS `if()` support including `style()` functions, combine this plugin with the runtime polyfill:

1. Use this PostCSS plugin for build-time transformation of `media()` and `supports()`
2. Use [css-if-polyfill](../css-if-polyfill) runtime for `style()` functions

```html
<!-- For style() functions only -->
<script src="https://unpkg.com/css-if-polyfill"></script>
```

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Build the package
npm run build

# Lint code
npm run lint
```

## Contributing

See the main [Contributing Guide](../../CONTRIBUTING.md) for details on how to contribute to this project.

## License

MIT © [Maximilian Franzke](https://github.com/mfranzke)

## Related

- [css-if-polyfill](../css-if-polyfill) - Runtime polyfill for CSS if() functions
- [PostCSS](https://postcss.org/) - Tool for transforming CSS with JavaScript
- [CSS Conditional Rules](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Conditional_Rules) - MDN documentation for @media and @supports
