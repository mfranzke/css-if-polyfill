# CSS if() Polyfill v2.0 API Documentation

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

### Core Polyfill Methods

#### `init(options?)`

Initializes the CSS if() polyfill with optional configuration.

**Parameters:**

- `options` (optional): Configuration object
    - `debug` (boolean): Enable debug logging (default: false)
    - `autoInit` (boolean): Auto-initialize on DOMContentLoaded (default: true)
    - `useNativeTransform` (boolean): Enable hybrid native transformation (default: true)

**Example:**

```javascript
init({
	debug: true,
	useNativeTransform: true
});
```

#### `processCSSText(cssText, options?, element?)`

Manually process CSS text containing if() functions.

**Parameters:**

- `cssText` (string): CSS text to process
- `options` (optional): Processing options (same as init options)
- `element` (optional): DOM element for media query tracking

**Returns:** Processed CSS text (string)

**Example:**

```javascript
const processedCSS = CSSIfPolyfill.processCSSText(`
  .button {
    color: if(media(min-width: 768px): blue; else: red);
  }
`);
```

#### `hasNativeSupport()`

Check if the browser has native CSS if() support.

**Returns:** boolean

**Example:**

```javascript
if (!CSSIfPolyfill.hasNativeSupport()) {
	console.log("Polyfill is needed");
}
```

#### `refresh()`

Manually trigger processing of existing stylesheets.

**Example:**

```javascript
// After dynamically adding new styles
CSSIfPolyfill.refresh();
```

#### `cleanup()`

Clean up media query listeners to prevent memory leaks.

**Example:**

```javascript
// Before page unload or component unmount
CSSIfPolyfill.cleanup();
```

### Build-time Transformation

#### `buildTimeTransform(cssText, options?)`

Transform CSS at build time to generate native CSS where possible.

**Parameters:**

- `cssText` (string): CSS text to transform
- `options` (optional): Transform options
    - `minify` (boolean): Minify the output CSS (default: false)

**Returns:** Transform result object

```typescript
{
	nativeCSS: string; // CSS with native @media/@supports rules
	runtimeCSS: string; // CSS requiring runtime processing
	hasRuntimeRules: boolean; // Whether runtime processing is needed
	stats: {
		totalRules: number;
		transformedRules: number;
	}
}
```

**Example:**

```javascript
import { buildTimeTransform } from "css-if-polyfill";

const result = buildTimeTransform(
	`
  .card {
    background: if(media(min-width: 768px): blue; else: gray);
    font-size: if(style(--large): 24px; else: 16px);
  }
`,
	{ minify: true }
);

console.log("Native CSS:", result.nativeCSS);
console.log("Runtime CSS:", result.runtimeCSS);
console.log("Needs polyfill:", result.hasRuntimeRules);
```

## CLI Tool

The package includes a command-line tool for build-time transformation:

```bash
npx css-if-transform input.css output.css [options]
```

### CLI Options

- `--minify` - Minify the output CSS
- `--stats` - Show transformation statistics
- `--help` - Show help message

### CLI Examples

```bash
# Basic transformation
npx css-if-transform styles.css optimized.css

# With minification and statistics
npx css-if-transform styles.css optimized.css --minify --stats

# Output to stdout with stats
npx css-if-transform styles.css --stats
```

## CSS Syntax

### Basic if() Syntax

```css
.element {
	property: if(condition: value; else: fallback);
}
```

### Supported Condition Types

#### style() Conditions (Runtime Processing)

Test CSS custom properties:

```css
.element {
	color: if(style(--theme): var(--primary-color) ; else: blue);
	font-size: if(style(--large-text): 24px; else: 16px);
}
```

#### media() Conditions (Native Transformation)

Responsive design conditions:

```css
.element {
	background: if(media(min-width: 768px): lightblue; else: lightcoral);
	grid-columns: if(media(max-width: 480px): 1; else: 3);
}
```

#### supports() Conditions (Native Transformation)

Feature detection:

```css
.element {
	display: if(supports(display: grid): grid; else: block);
	color: if(
		supports(color: oklch(0.7 0.15 200)): oklch(0.7 0.15 200) ; else: blue
	);
}
```

### Multiple Conditions

Chain multiple conditions within a single if():

```css
.element {
	color: if(
		media(min-width: 1200px): navy; media(min-width: 768px): blue;
			supports(color: red): red; else: black
	);
}
```

### Complex Values

Use if() functions within complex CSS values:

```css
.element {
	background: linear-gradient(
		if(media(min-width: 768px): to right; else: to bottom),
		if(style(--dark-mode): #333; else: #fff),
		if(style(--dark-mode): #000; else: #ccc)
	);

	margin: if(media(max-width: 480px): 10px; else: 20px) auto;
}
```

## Performance Considerations

### Native vs Runtime Processing

| Condition Type | Processing              | Performance                 | Use Case          |
| -------------- | ----------------------- | --------------------------- | ----------------- |
| `media()`      | Build-time → Native CSS | Fastest (zero runtime cost) | Responsive design |
| `supports()`   | Build-time → Native CSS | Fastest (zero runtime cost) | Feature detection |
| `style()`      | Runtime JavaScript      | Slower but necessary        | Dynamic theming   |

### Best Practices

1. **Prefer Transformable Conditions**: Use `media()` and `supports()` when possible
2. **Build-time Transformation**: Use the CLI tool or `buildTimeTransform()` for optimal performance
3. **Minimize Runtime Processing**: Reserve `style()` conditions for truly dynamic scenarios
4. **Progressive Enhancement**: Structure CSS so fallbacks work without JavaScript

### Optimization Tips

```css
/* Good: Will be transformed to native CSS */
.button {
	background: if(media(min-width: 768px): blue; else: gray);
}

/* Better: Combine related conditions */
.button {
	padding: if(media(max-width: 480px): 8px 12px; else: 12px 16px);
	margin: if(media(max-width: 480px): 4px; else: 8px);
}

/* Best: Use build-time transformation */
/* Transformed to native @media rules during build */
```

## TypeScript Support

The polyfill includes comprehensive TypeScript definitions:

```typescript
import {
	init,
	buildTimeTransform,
	type CssIfPolyfillOptions,
	type TransformResult
} from "css-if-polyfill";

const options: CssIfPolyfillOptions = {
	debug: true,
	useNativeTransform: true
};

init(options);

const result: TransformResult = buildTimeTransform(cssText);
```

## Browser Support

- **Modern browsers**: Native performance with build-time transformation
- **Legacy browsers**: Full functionality via runtime polyfill
- **No JavaScript**: Fallback values are used

The polyfill gracefully degrades and provides fallback values even when JavaScript is disabled.

## Migration from v1.x

### No Breaking Changes

Existing v1.x code continues to work without modifications:

```javascript
// v1.x code - still works
import { init } from "css-if-polyfill";
init();
```

### Opt-in to v2.0 Features

```javascript
// Enable hybrid processing
init({ useNativeTransform: true });

// Use build-time transformation
import { buildTimeTransform } from "css-if-polyfill";
const optimized = buildTimeTransform(cssText);
```

## Examples

See the `/examples` directory for complete working demonstrations of all features.
