# CSS if() Polyfill API Documentation

## Installation

```bash
npm install css-if-polyfill
```

## CDN Usage

```html
<script
	type="module"
	src="https://cdn.jsdelivr.net/npm/css-if-polyfill/dist/index.modern.js"
></script>
```

## ESM Import

```javascript
import { init } from "css-if-polyfill";

// Initialize the polyfill
init();
```

## CommonJS Require

```javascript
const { init } = require("css-if-polyfill");

// Initialize the polyfill
init();
```

## API Reference

### `init(options?)`

Initializes the CSS if() polyfill.

**Parameters:**

- `options` (optional): Configuration object
- `debug` (boolean): Enable debug logging (default: false)
- `autoInit` (boolean): Auto-initialize on DOMContentLoaded (default: true)

### `processCSSText(cssText, options?, element?)`

Manually process CSS text containing if() functions.

**Parameters:**

- `cssText` (string): CSS text to process
- `options` (optional): Processing options
- `element` (optional): DOM element for media query tracking

**Returns:** Processed CSS text

### `hasNativeSupport()`

Check if the browser has native CSS if() support.

**Returns:** boolean

### `refresh()`

Manually trigger processing of existing stylesheets.

### `cleanup()`

Clean up media query listeners to prevent memory leaks.

## CSS Syntax

### Basic if() Syntax

```css
.element {
	color: if(condition: value; else: fallback);
}
```

### Supported Condition Types

#### style() Conditions

```css
.element {
	color: if(style(--custom-property): red; else: blue);
}
```

#### media() Conditions

```css
.element {
	background: if(media(min-width: 768px): lightblue; else: lightcoral);
}
```

#### supports() Conditions

```css
.element {
	display: if(supports(display: grid): grid; else: block);
}
```

### Multiple Conditions

```css
.element {
	color: if(
		media(min-width: 768px): blue; supports(color: red): red; else: black
	);
}
```
