# GitHub Copilot Instructions for CSS if() Polyfill

## Project Overview

This is a JavaScript polyfill and PostCSS plugin for [CSS if() functionality](https://developer.mozilla.org/en-US/docs/Web/CSS/if). The polyfill provides browser support for the CSS if() function with style(), media(), and supports() conditions as specified in the WCAG (Web Content Accessibility Guidelines).

<!-- TODO: Update this section if the official specification changes.
https://drafts.csswg.org/css-values-5/#if-notation -->

## Official WCAG CSS if() Function Specification

8.3. Conditional Value Selection: the if() notation
The if() function is an arbitrary substitution function that represents conditional values. Its argument consists of an ordered semi-colon–separated list of statements, each consisting of a condition followed by a colon followed by a value. An if() function represents the value corresponding to the first condition in its argument list to be true; if no condition matches, then the if() function represents an empty token stream.

The if() function’s syntax is defined as follows:

<if()> = if( [ <if-branch> ; ]\* <if-branch> ;? )
<if-branch> = <if-condition> : <declaration-value>?
<if-condition> = <boolean-expr[ <if-test> ]> | else
<if-test> =
supports( [ <ident> : <declaration-value> ] | <supports-condition> ) |
media( <media-feature> | <media-condition> ) |
style( <style-query> )
The else keyword represents a condition that is always true.

The if() function’s argument grammar is:

<if-args> = if( [ <if-args-branch> ; ]\* <if-args-branch> ;? )
<if-args-branch> = <declaration-value> : <declaration-value>?
To replace an if() function, given a list of arguments:
For each <if-args-branch> branch in arguments:

Substitute arbitrary substitution functions in the first <declaration-value> of branch, then parse the result as an <if-condition>. If parsing returns failure, continue; otherwise, let the result be condition.

Evaluate condition.

If a <style-query> in condition tests the value of a property, and guarding a substitution context «"property", referenced-property-name» would mark it as a cyclic substitution context, that query evaluates to false.

For example, in --foo: if(style(--foo: bar): baz); the style() query is automatically false, since property replacement has already established a «"property", "--foo"» substitution context.
If the result of condition is false, continue.

Substitute arbitrary substitution functions in the second <declaration-value> of branch, and return the result.

Return nothing (an empty sequence of component values).

Note: Unlike using @media/@supports/@container rules, which just ignore their contents when they’re false and let the cascade determine what values otherwise apply, declarations with if() do not roll back the cascade if the conditions are false; any fallback values must be provided inline. However, see the revert-rule CSS-wide keyword.

## Project Structure and Key Components

### Core Packages

- `packages/css-if-polyfill/` - Main JavaScript polyfill
- `packages/postcss-if-function/` - PostCSS plugin for build-time transformation

### Key Files

- `packages/css-if-polyfill/src/index.js` - Main polyfill runtime
- `packages/css-if-polyfill/src/transform.js` - CSS transformation logic
- `test/fixtures/` - CSS test fixture pairs (_.input.css / _.expected.css)
- `test/fixtures-validation/` - Playwright-based browser validation tests

### Testing Infrastructure

- Vitest for unit tests
- Playwright for browser-based fixture validation
- XO for linting (strict ESLint configuration)

## Syntax Rules and Implementation Guidelines

### CSS if() Function Syntax

When working with CSS if() functions, always follow the official WCAG specification syntax as included in the previous section "Official WCAG CSS if() Function Specification".

### Code Style Requirements

- Use ES modules with modern JavaScript syntax
- Follow XO linting rules (extends ESLint strict configuration)
- Use `/* eslint-disable rule-name */` blocks only when necessary for browser automation
- Prefer functional programming patterns
- Use meaningful variable names and comprehensive JSDoc comments

### Testing Requirements

- All new CSS syntax must have corresponding fixture pairs in `test/fixtures/`
- Fixture files must follow naming convention: `name.input.css` / `name.expected.css`
- Browser validation tests must pass in Chromium, Firefox, and WebKit
- Unit tests should cover edge cases and error conditions

### Browser Compatibility

- Support modern browsers with ES module capability
- Graceful degradation for older browsers via UMD build
- Auto-initialization in browser environments
- Clean cleanup of event listeners and observers

## Development Workflow

1. **CSS Syntax Changes**: Update both polyfill logic and PostCSS plugin
2. **New Features**: Add fixture tests first, then implement functionality
3. **Bug Fixes**: Create minimal reproduction test case before fixing
4. **Performance**: Profile with large CSS files and many DOM elements

## Important Implementation Notes

### Polyfill Behavior

- Must evaluate conditions at runtime based on current browser state
- Should handle dynamic viewport changes for media queries
- Must respect CSS cascade and specificity rules
- Should not interfere with native CSS if() support when available

### Error Handling

- Debug mode should provide helpful error messages
- Should not break page rendering on malformed CSS

### Performance Considerations

- Minimize DOM queries and style recalculations
- Cache compiled CSS transformations when possible

## File Naming and Organization

- Use kebab-case for files and directories
- Suffix test files with `.test.js`
- Suffix fixture files with `.input.css` / `.expected.css`
- Group related functionality in dedicated directories
- Keep configuration files at appropriate levels (root, package, or feature-specific)

## When Making Changes

1. **Always** check the WCAG specification above for syntax correctness
2. **Always** add fixture tests for new CSS functionality
3. **Always** run the full test suite including browser validation
4. **Always** update documentation when changing public APIs
5. **Always** bear in mind that the developer's main job is to read, not write, code. Therefore, avoid unnecessary complexity, abbreviations and short forms of parameters, for example in CLI usage.
6. **Consider** performance impact on large stylesheets and DOM trees

This project aims to provide a complete, specification-compliant implementation of CSS if() functionality for browsers that don't yet support it natively.
