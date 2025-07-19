# Native CSS Container Query Approach

## Current vs. Proposed Approach

### Current Approach (Runtime Rewriting)

```javascript
// JavaScript processes this at runtime:
// if(media(width >= 768px): blue; else: red)
// → Evaluates to: blue (if screen >= 768px) or red
```

### Proposed Approach (Native CSS)

```css
/* Transform to native CSS container queries */
@media (width >= 768px) {
	.element {
		color: blue;
	}
}
@media not (width >= 768px) {
	.element {
		color: red;
	}
}
```

## Implementation Strategy

### 1. For `media()` conditions

```css
/* Input */
.element {
	color: if(media(width >= 768px): blue; else: red);
}

/* Output */
@media (width >= 768px) {
	.element {
		color: blue;
	}
}
@media not (width >= 768px) {
	.element {
		color: red;
	}
}
```

### 2. For `supports()` conditions

```css
/* Input */
.element {
	display: if(supports(display: subgrid): subgrid; else: grid);
}

/* Output */
@supports (display: subgrid) {
	.element {
		display: subgrid;
	}
}
@supports not (display: subgrid) {
	.element {
		display: grid;
	}
}
```

### 3. For `style()` conditions (still needs runtime)

```css
/* Input */
.element {
	color: if(style(--theme: dark): white; else: black);
}

/* Still needs JavaScript for custom property evaluation */
/* But could use CSS custom properties more efficiently */
```

## Benefits

1. **Performance**: Native CSS parsing vs JavaScript runtime
2. **Reliability**: Browser handles edge cases
3. **Maintainability**: Less complex JavaScript
4. **Standards Compliance**: Uses established CSS features
5. **Future-proof**: Works with CSS engine optimizations

## Implementation Plan

```javascript
const transformToNativeCSS = (cssText) => {
	// Parse CSS and extract if() functions
	const rules = parseCSSRules(cssText);

	return rules
		.map((rule) => {
			if (hasIfFunction(rule)) {
				return transformIfToNativeCSS(rule);
			}
			return rule;
		})
		.join("\n");
};

const transformIfToNativeCSS = (rule) => {
	const ifConditions = extractIfConditions(rule);

	return ifConditions
		.map((condition) => {
			if (condition.type === "media") {
				return `@media (${condition.query}) {
        ${rule.selector} { ${rule.property}: ${condition.value}; }
      }`;
			}

			if (condition.type === "supports") {
				return `@supports (${condition.query}) {
        ${rule.selector} { ${rule.property}: ${condition.value}; }
      }`;
			}

			// style() still needs runtime processing
			if (condition.type === "style") {
				return processStyleConditionRuntime(condition, rule);
			}
		})
		.join("\n");
};
```

## Compatibility Considerations

- `@supports`: Chrome 28+, Firefox 22+, Safari 9+
- `@media`: Universal support

## Hybrid Approach

For maximum compatibility and performance:

1. **Native CSS transformation** for `media()` and `supports()`
2. **Runtime processing** only for `style()` conditions
3. **Fallback** to current approach for unsupported browsers

This would dramatically reduce the JavaScript processing overhead while maintaining full functionality.
