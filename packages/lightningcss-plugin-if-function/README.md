# lightningcss-if-function

[![Default CI/CD Pipeline](https://github.com/mfranzke/css-if-polyfill/actions/workflows/default.yml/badge.svg)](https://github.com/mfranzke/css-if-polyfill/actions/workflows/default.yml)
[![npm version](https://badge.fury.io/js/lightningcss-if-function.svg)](https://badge.fury.io/js/lightningcss-if-function)
[![Build Status](https://github.com/mfranzke/css-if-polyfill/workflows/CI/badge.svg)](https://github.com/mfranzke/css-if-polyfill/actions)

A [Lightning CSS](https://lightningcss.dev/) plugin for transforming CSS `if()` functions into native CSS `@media` and `@supports` rules at build time.

This plugin is part of the [css-if-polyfill](https://github.com/mfranzke/css-if-polyfill/tree/main/packages/css-if-polyfill/) project and provides build-time transformation of conditional CSS, eliminating the need for runtime JavaScript processing when using only `media()` and `supports()` functions.

**Input CSS:**

```css
.responsive {
	width: if(media(max-width: 768px): 100%; else: 50%);
}
```

**Expected Output:**

```css
.responsive {
	width: 50%;
}
@media (max-width: 768px) {
	.responsive {
		width: 100%;
	}
}
```

## Installation

```bash
npm install lightningcss-if-function lightningcss
```

## Usage

```js
import { transform } from "lightningcss-if-function";
import { readFileSync } from "fs";

const css = readFileSync("style.css");

const result = transform({
	filename: "style.css",
	code: css
});

console.log(result.code.toString());
```

## Limitations

- **Style Functions Not Supported**: This plugin only transforms `media()` and `supports()` functions. For `style()` functions (which depend on runtime DOM state), use the [css-if-polyfill](https://github.com/mfranzke/css-if-polyfill/tree/main/packages/css-if-polyfill/) runtime (browser) library
- **Static Analysis Only**: The plugin performs static analysis and cannot handle dynamically generated CSS
- **Lightning CSS Compatibility**: Requires Lightning CSS 1.0.0 or higher

## Contributing

See the main [Contributing Guide](https://github.com/mfranzke/css-if-polyfill/blob/main/CONTRIBUTING.md) for details on how to contribute to this project.

## License

MIT © [Maximilian Franzke](https://github.com/mfranzke)

## Related

- [css-if-polyfill](https://github.com/mfranzke/css-if-polyfill/tree/main/packages/css-if-polyfill/) - Runtime polyfill for CSS if() functions
- [Lightning CSS](https://lightningcss.dev/) - A new CSS parser, transformer, and minifier written in Rust.
