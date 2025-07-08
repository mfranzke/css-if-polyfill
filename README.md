# CSS if() Function Polyfill

A comprehensive JavaScript polyfill for the [CSS `if()` function](https://developer.mozilla.org/en-US/docs/Web/CSS/if) that provides support for conditional CSS with `style()`, [`media()`](https://developer.mozilla.org/de/docs/Web/CSS/@media), and [`supports()`](https://developer.mozilla.org/de/docs/Web/CSS/@supports) functions. Now with enhanced support for **multiple conditions within a single if()** and **shorthand property usage**.

## Features

- ✅ **Complete CSS if() support** with condition evaluation
- ✅ **Media queries** via `media()` function
- ✅ **Feature detection** via `supports()` function
- ✅ **Style queries** via `style()` function
- ✅ **Multiple conditions** within a single if() function
- ✅ **Shorthand property support** for complex CSS values
- ✅ **Automatic fallback** for unsupported browsers
- ✅ **Real-time processing** of dynamic stylesheets
- ✅ **TypeScript support** with full type definitions
- ✅ **Zero dependencies** - Pure JavaScript implementation
- ✅ **Comprehensive test suite** with 95%+ coverage
- ✅ **Multiple build formats** (ES6, CommonJS, UMD)

## Installation

```bash
npm install css-if-polyfill
```

## Usage

### Automatic Initialization (Recommended)

Simply import the polyfill and it will automatically initialize:

```javascript
import "css-if-polyfill";
```

Or include it via script tag:

```html
<script src="https://cdn.jsdelivr.net/npm/css-if-polyfill/dist/index.umd.min.js"></script>
```

### Manual Initialization

```javascript
import { init } from "css-if-polyfill";

// Initialize with options
const polyfill = init({
	debug: true,
	autoInit: true
});
```

### Processing CSS Text

```javascript
import { processCSSText } from "css-if-polyfill";

const css = ".button { color: if(media(width >= 768px): blue; else: red); }";
const processed = processCSSText(css);
console.log(processed); // .button { color: blue; } (if screen >= 768px)
```

## CSS if() Syntax

The polyfill supports the following CSS if() syntax:

```css
property: if(condition: value; else: value-if-false);
```

**Note:** The `else` clause is optional. If omitted and the condition is false, an empty value will be used.

## Enhanced Features

### 1. Multiple Conditions within Single if()

You can now use multiple conditions within a single `if()` function, where each condition is tested sequentially until one matches:

```css
.element {
	/* Multiple conditions tested in order */
	background: if(
		style(--scheme: ice): linear-gradient(#caf0f8, white, #caf0f8) ;
			style(--scheme: fire): linear-gradient(#ffc971, white, #ffc971) ;
			style(--scheme: earth): linear-gradient(#8fbc8f, white, #8fbc8f) ;
			else: linear-gradient(#e0e0e0, white, #e0e0e0) ;
	);
}
```

### 2. Shorthand Property Support

Use if() functions within CSS shorthand properties:

```css
.element {
	/* Border shorthand with conditional values */
	border: if(
			style(--scheme: ice): 3px; style(--scheme: fire): 5px; else: 1px;
		)
		if(supports(border-style: dashed): dashed; else: solid;)
		if(
			style(--scheme: ice): #0ea5e9; style(--scheme: fire): #f97316;
				else: #6b7280;
		);

	/* Font shorthand with multiple conditions */
	font:
		if(
				media(width >= 1200px): bold; media(width >= 768px): 600;
					else: normal;
			)
			if(media(width >= 768px): 18px; else: 14px;) / 1.5 system-ui,
		sans-serif;
}
```

## Supported Condition Types

### 1. Media Queries with `media()`

```css
.responsive-text {
	font-size: if(
		media(width >= 1200px): 24px; media(width >= 768px): 18px; else: 16px;
	);
}
```

### 2. Feature Detection with `supports()`

```css
.modern-layout {
	display: if(
		supports(display: subgrid): subgrid; supports(display: grid): grid;
			supports(display: flex): flex; else: block;
	);
}
```

### 3. Style Queries with `style()`

```css
.theme-aware {
	color: if(
		style(--theme: dark): white; style(--theme: light): black;
			style(--theme: blue): #1e40af; else: #374151;
	);
}
```

### 4. Boolean Conditions

```css
.debug-mode {
	border: if(style(--true): 2px solid red; else: none);
	opacity: if(style(--false): 0.5; else: 1);
}
```

## Advanced Examples

### Theme-Based Styling

```css
.card {
	background: if(
		style(--scheme: ice): linear-gradient(135deg, #caf0f8, white, #caf0f8) ;
			style(--scheme: fire): linear-gradient(
				135deg,
				#ffc971,
				white,
				#ffc971
			)
			;
			style(--scheme: earth): linear-gradient(
				135deg,
				#8fbc8f,
				white,
				#8fbc8f
			)
			; else: linear-gradient(135deg, #e0e0e0, white, #e0e0e0) ;
	);

	color: if(
		style(--theme: dark): #e2e8f0; style(--theme: light): #2d3748;
			style(--theme: blue): #1e40af; else: #374151;
	);
}
```

### Progressive Enhancement

```css
.feature-demo {
	display: if(
		supports(display: subgrid): subgrid; supports(display: grid): grid;
			supports(display: flex): flex; else: block;
	);

	gap: if(supports(gap): 20px; else: 0;);
}
```

### Responsive Design with Multiple Breakpoints

```css
.responsive-element {
	padding: if(
		media(width >= 1200px): 40px; media(width >= 768px): 30px;
			media(width >= 480px): 20px; else: 15px;
	);

	font-size: if(
		media(width >= 1200px): 20px; media(width >= 768px): 18px; else: 16px;
	);
}
```

### Accessibility-Aware Animations

```css
.animated-element {
	transition: if(
		media(prefers-reduced-motion: reduce): none; supports(transition): all
			0.3s ease; else: none;
	);

	transform: if(
		media(prefers-reduced-motion: reduce): none;
			supports(transform): scale(1) ; else: none;
	);
}
```

## API Reference

### `init(options)`

Initialize the polyfill with optional configuration.

```javascript
const polyfill = init({
	debug: false, // Enable debug logging
	autoInit: true // Automatically process existing stylesheets
});
```

### `processCSSText(cssText, options)`

Process CSS text containing if() functions.

```javascript
const processed = processCSSText(`
  .test {
    color: if(
      style(--theme: dark): white;
      style(--theme: light): black;
      else: gray;
    );
  }
`);
```

### `hasNativeSupport()`

Check if the browser has native CSS if() support.

```javascript
if (hasNativeSupport()) {
	console.log("Native support available!");
}
```

### Instance Methods

```javascript
const polyfill = init();

// Manually refresh/reprocess all stylesheets
polyfill.refresh();

// Check if polyfill is needed
polyfill.hasNativeSupport();

// Process specific CSS text
polyfill.processCSSText(cssText);
```

## Browser Support

The polyfill works in all modern browsers that support:

- ES6 (ECMAScript 2015)
- CSS Object Model
- MutationObserver
- matchMedia API

**Tested browsers:**

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Performance Considerations

- The polyfill only activates when native CSS if() support is not available
- Uses efficient CSS parsing with minimal DOM manipulation
- Caches evaluation results for better performance
- Processes stylesheets incrementally to avoid blocking
- Optimized parsing for multiple conditions and complex shorthand properties

## Examples

The package includes comprehensive examples:

- `examples/index.html` - Basic CSS if() usage
- `examples/advanced.html` - Advanced conditional styling
- `examples/enhanced.html` - Multiple if-tests and shorthand properties
- `examples/multiple-conditions.html` - Multiple conditions within single if()

## Contributing

Please have a look at our [CONTRIBUTION guidelines](CONTRIBUTING.md).

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Credits

- Pure JavaScript implementation with custom CSS parsing
- Inspired by the CSS Working Group's conditional CSS proposals
- Thanks to all contributors and testers
