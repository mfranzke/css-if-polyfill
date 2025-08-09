# CSS if() Polyfill Fixture Validation

This document explains the fixture validation system for the CSS if() polyfill, which ensures that your CSS transformations work correctly in real browser environments.

## Overview

The fixture validation system uses **Playwright** to test CSS fixture pairs in a headless Chromium browser. This approach validates that:

1. **Input CSS** (with `if()` functions) gets properly transformed by the polyfill
2. **Expected CSS** (the desired output) produces the same visual results
3. **Media queries** respond correctly to viewport changes
4. **@supports queries** work as expected

## How It Works

### 1. Fixture Structure

Fixtures come in pairs located in `test/fixtures/`:

- `*.input.css` - CSS containing `if()` functions
- `*.expected.css` - Expected transformation result

Example:

```text
test/fixtures/
├── basic-media.input.css     # if(media(max-width: 768px): 100%; else: 50%)
├── basic-media.expected.css  # Standard media query equivalent
├── basic-style.input.css     # if(style(--theme): var(--primary); else: blue)
└── basic-style.expected.css  # Resolved conditional styles
```

### 2. Browser Testing Process

For each fixture pair, the system:

1. **Creates an HTML page** with both input and expected CSS
2. **Loads the polyfill** and applies it to the input CSS
3. **Captures computed styles** from the polyfilled version
4. **Switches to expected CSS** and captures those styles
5. **Compares the results** to ensure they match

### 3. Validation Types

#### Basic Style Validation

Compares computed styles for properties like:

- `color`
- `width`
- `display`
- `backgroundColor`
- `fontSize`
- `margin`, `padding`, `border`

#### Media Query Testing

Tests responsive behavior at different viewports:

- Desktop (1200x800)
- Tablet (768x600)
- Mobile (375x667)

#### @supports Testing

Validates CSS feature detection with properties like:

- `display: grid`
- `display: flex`
- `color: color(display-p3 1 0 0)`

## Running Tests

### Command Line

```bash
# Run all fixture tests
pnpm run test:fixtures

# Run specific fixture with config
pnpm exec playwright test --config=test/fixtures-validation/fixture-validation.playwright.config.js --grep "basic-media"

# Run with browser UI (for debugging)
pnpm exec playwright test --config=test/fixtures-validation/fixture-validation.playwright.config.js --ui
```

### Using the Helper Script

```bash
# Run all fixtures
node scripts/validate-fixtures.js

# Run specific fixture
node scripts/validate-fixtures.js basic-media

# List available fixtures
node scripts/validate-fixtures.js --list

# Show help
node scripts/validate-fixtures.js --help
```

## Adding New Fixtures

1. **Create input CSS** with `if()` functions:

    ```css
    /* my-feature.input.css */
    .element {
    	color: if(
    		supports(color: lab(50% 20 -30)): lab(50% 20 -30) ; else: #blue
    	);
    }
    ```

2. **Create expected CSS** with the desired output:

    ```css
    /* my-feature.expected.css */
    .element {
    	color: #blue;
    }
    @supports (color: lab(50% 20 -30)) {
    	.element {
    		color: lab(50% 20 -30);
    	}
    }
    ```

3. **Test automatically** - the validation will pick up new fixtures

## Understanding Test Results

### ✅ Passing Tests

All computed styles match between polyfill and expected CSS.

### ❌ Failing Tests

Common failure reasons:

1. **Style Mismatch**: Polyfill produces different computed values

    ```text
    Property 'width' should match between polyfill and expected CSS
    Expected: "400px"
    Received: "50%"
    ```

2. **Media Query Issues**: Responsive behavior doesn't match

    ```text
    Property 'width' should match at mobile viewport (375x667)
    ```

3. **Polyfill Errors**: JavaScript errors in the polyfill code
    ```text
    Error: if() function parsing failed
    ```

## Browser Support

The tests run on:

- **Chromium** (primary - matches most real-world usage)
- **Firefox** (cross-browser validation)
- **WebKit** (Safari compatibility)

## Benefits

This validation system provides:

1. **Real Browser Testing** - No mocking, actual CSS computation
2. **Visual Accuracy** - Ensures polyfill produces identical rendering
3. **Regression Detection** - Catches breaking changes automatically
4. **Cross-Browser Validation** - Tests on multiple engines
5. **Responsive Testing** - Validates media query behavior
6. **Feature Detection** - Ensures @supports works correctly

## Troubleshooting

### Tests Won't Start

- Ensure Playwright is installed: `npx playwright install`
- Check that fixtures exist in `test/fixtures/`

### Style Mismatches

- Check if polyfill is correctly transforming CSS
- Verify expected CSS is accurate
- Test manually in browser to confirm behavior

### Performance Issues

- Tests run in parallel by default
- Use `--workers=1` to run sequentially if needed
- Consider reducing viewport testing for faster runs

This fixture validation system gives you confidence that your CSS if() polyfill works correctly across different browsers and scenarios, providing the same visual results as native CSS would.
