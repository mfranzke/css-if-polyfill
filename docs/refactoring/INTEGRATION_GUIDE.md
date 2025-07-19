# Integration Guide: CSS if() Polyfill v0.1

This document describes the major architectural improvements and integration of build-time CSS transformation capabilities into the CSS if() polyfill.

## 🎯 Overview

The CSS if() polyfill now offers **two complementary approaches**:

1. **Runtime Polyfill** - Traditional JavaScript-based processing for dynamic conditions
2. **Build-time Transformation** - Static CSS transformation to native `@media` and `@supports` rules

## 🏗️ Architecture Changes

### New File Structure

```text
src/
├── index.js           # Main polyfill with integrated transformation
├── transform.js       # Build-time transformation engine
└── index.d.ts        # Updated TypeScript definitions

test/
├── integrated.test.js # Comprehensive integration tests
└── ...existing tests...

cli.js                 # Build-time transformation CLI tool
```

### Key Components

#### 1. Transform Engine (`src/transform.js`)

- **CSS Parser**: Robust parsing with comment and string handling
- **Condition Analyzer**: Distinguishes between native-transformable and runtime conditions
- **Native CSS Generator**: Outputs `@media` and `@supports` rules
- **Runtime Processor**: Handles `style()` conditions that need dynamic evaluation

#### 2. Integrated Polyfill (`src/index.js`)

- **Hybrid Processing**: Attempts native transformation first, falls back to runtime
- **Backwards Compatible**: Existing API remains unchanged
- **Performance Optimized**: Reduces runtime CSS processing when possible

#### 3. CLI Tool (`cli.js`)

- **Build Integration**: Process CSS files during build time
- **Statistics**: Reports transformation success rates
- **Minification**: Optional CSS minification

## 🔄 Processing Flow

```mermaid
graph TD
    A[CSS with if() functions] --> B{Build-time or Runtime?}
    B -->|Build-time| C[Transform Engine]
    B -->|Runtime| D[Polyfill Engine]

    C --> E{Condition Type}
    E -->|media/supports| F[Native @media/@supports]
    E -->|style| G[Runtime CSS]

    D --> H{Native Transform Enabled?}
    H -->|Yes| I[Try Native First]
    H -->|No| J[Pure Runtime Processing]

    I --> K{Success?}
    K -->|Yes| L[Native CSS + Runtime CSS]
    K -->|No| J

    F --> M[Final CSS Output]
    G --> M
    J --> M
    L --> M
```

## 🚀 Usage Examples

### Build-time Transformation

#### CLI Usage

```bash
# Transform CSS file
npx css-if-transform input.css output.css

# With minification and stats
npx css-if-transform input.css output.css --minify --stats

# Output to stdout
npx css-if-transform input.css --stats
```

#### Programmatic Usage

```javascript
import { buildTimeTransform } from "css-if-polyfill";

const css = `
  .button {
    background: if(media(min-width: 768px): blue; else: gray);
    color: if(style(--dark-mode): white; else: black);
  }
`;

const result = buildTimeTransform(css, { minify: true });

console.log("Native CSS:", result.nativeCSS);
console.log("Runtime CSS:", result.runtimeCSS);
console.log("Needs runtime?", result.hasRuntimeRules);
```

### Runtime Integration

#### Enhanced Polyfill

```javascript
import CSSIfPolyfill from "css-if-polyfill";

// Initialize with native transformation
CSSIfPolyfill.init({
	useNativeTransform: true,
	debug: true
});

// Process CSS (tries native first, falls back to runtime)
const processed = CSSIfPolyfill.processCSSText(cssText);
```

## 📊 Transformation Capabilities

### Native Transformations ✅

| Input                                            | Output                              |
| ------------------------------------------------ | ----------------------------------- |
| `if(media(min-width: 768px): blue; else: red)`   | `@media (min-width: 768px) { ... }` |
| `if(supports(display: grid): grid; else: block)` | `@supports (display: grid) { ... }` |

### Runtime Required ⚠️

| Condition                  | Reason                                     |
| -------------------------- | ------------------------------------------ |
| `style(--custom-property)` | Requires dynamic property evaluation       |
| `style(--theme: dark)`     | Needs runtime CSS custom property checking |

## 🎛️ Configuration Options

### Build-time Options

```javascript
const options = {
	minify: false, // Minify output CSS
	generateFallbacks: true, // Generate fallback rules
	optimizeMediaQueries: true // Optimize media query output
};
```

### Runtime Options

```javascript
const options = {
	debug: false, // Enable debug logging
	autoInit: true, // Auto-initialize on DOMContentLoaded
	useNativeTransform: true // Enable integrated native transformation
};
```

## 📈 Performance Benefits

### Build-time Transformation

- **Zero Runtime Cost**: Native CSS rules require no JavaScript
- **Better Caching**: Static CSS can be cached effectively
- **Reduced Bundle Size**: Less JavaScript processing needed
- **Improved Performance**: Browser-native CSS parsing and evaluation

### Hybrid Approach

- **Best of Both Worlds**: Static optimization + dynamic capabilities
- **Progressive Enhancement**: Graceful fallback to runtime processing
- **Selective Processing**: Only `style()` conditions processed at runtime

## 🔧 Migration Guide

### From v0.0 to v0.1

#### No Breaking Changes

Existing code continues to work without modifications:

```javascript
// v0.0 code - still works
import CSSIfPolyfill from "css-if-polyfill";
CSSIfPolyfill.init();
```

#### Opt-in Enhancements

Enable new features gradually:

```javascript
// Enable native transformation
CSSIfPolyfill.init({ useNativeTransform: true });

// Use build-time transformation
import { buildTimeTransform } from "css-if-polyfill";
const result = buildTimeTransform(cssText);
```

### Build Process Integration

#### Webpack Plugin Example

```javascript
// webpack.config.js
const { buildTimeTransform } = require("css-if-polyfill");

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
									function cssIfTransform() {
										return {
											postcssPlugin: "css-if-transform",
											Once(root) {
												const result =
													buildTimeTransform(
														root.toString()
													);
												root.removeAll();
												root.append(result.nativeCSS);
											}
										};
									}
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

#### Vite Plugin Example

```javascript
// vite.config.js
import { buildTimeTransform } from "css-if-polyfill";

export default {
	plugins: [
		{
			name: "css-if-transform",
			transform(code, id) {
				if (id.endsWith(".css")) {
					const result = buildTimeTransform(code);
					return {
						code: result.nativeCSS,
						map: null
					};
				}
			}
		}
	]
};
```

## 🧪 Testing Strategy

### Comprehensive Test Coverage

- **Unit Tests**: Individual transformation functions
- **Integration Tests**: End-to-end transformation scenarios
- **Edge Cases**: Malformed CSS, nested conditions, complex selectors
- **Performance Tests**: Large CSS file processing benchmarks

### Test Categories

1. **Build-time Transformation**: Static CSS processing
2. **Runtime Integration**: Hybrid processing scenarios
3. **Backwards Compatibility**: Existing functionality preservation
4. **Error Handling**: Graceful degradation

## 🎯 Future Roadmap

### Planned Enhancements

- **PostCSS Plugin**: Official plugin for build tools
- **Webpack Loader**: Dedicated webpack loader
- **Source Maps**: Support for CSS source maps
- **CSS Nesting**: Integration with CSS nesting proposals
- **Performance Dashboard**: Build-time optimization metrics

### Experimental Features

- **CSS Container Queries**: `if(container(width > 300px): ...)`
- **CSS Color Functions**: `if(supports(color: oklch(...)): ...)`
- **Advanced Conditions**: Complex boolean logic support

## 📚 Resources

- [NATIVE_CSS_APPROACH.md](NATIVE_CSS_APPROACH.md) - Technical deep dive
- [OPTIMIZATION_ANALYSIS.md](OPTIMIZATION_ANALYSIS.md) - Performance analysis
- [examples/](examples/) - Working examples and demos
- [test/](test/) - Comprehensive test suite

---

This integration represents a significant evolution of the CSS if() polyfill, providing both immediate performance benefits and a clear path toward future CSS standards adoption.
