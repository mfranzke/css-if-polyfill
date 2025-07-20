# CSS if() Polyfill Test Fixtures

This document demonstrates the centralized test fixture system that provides a single source of truth for CSS test cases across all test suites.

## Basic Media Query

<!-- FIXTURE: basic-media -->

<!-- Note: This content is automatically generated from test fixtures. Do not edit the code blocks directly - they will be overwritten during the build process. To modify test cases, edit the corresponding .input.css and .expected.css files in the test/fixtures/ directory. To regenerate this documentation, run npm run build:docs -->

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

<!-- /FIXTURE -->

## Basic Supports Query

<!-- FIXTURE: basic-supports -->

<!-- Note: This content is automatically generated from test fixtures. Do not edit the code blocks directly - they will be overwritten during the build process. To modify test cases, edit the corresponding .input.css and .expected.css files in the test/fixtures/ directory. To regenerate this documentation, run npm run build:docs -->

**Input CSS:**

```css
.grid {
	display: if(supports(display: grid): grid; else: block);
}
```

**Expected Output:**

```css
.grid {
	display: block;
}
@supports (display: grid) {
	.grid {
		display: grid;
	}
}
```

<!-- /FIXTURE -->

## Basic Style Query (Runtime Processing)

<!-- FIXTURE: basic-style -->

<!-- Note: This content is automatically generated from test fixtures. Do not edit the code blocks directly - they will be overwritten during the build process. To modify test cases, edit the corresponding .input.css and .expected.css files in the test/fixtures/ directory. To regenerate this documentation, run npm run build:docs -->

**Input CSS:**

```css
.test {
	color: if(style(--theme): var(--primary); else: blue);
}
```

**Expected Output:**

```css
.test {
	color: blue;
}
```

<!-- /FIXTURE -->

## Multiple Functions in One Rule

<!-- FIXTURE: multiple-functions-one-rule -->

<!-- Note: This content is automatically generated from test fixtures. Do not edit the code blocks directly - they will be overwritten during the build process. To modify test cases, edit the corresponding .input.css and .expected.css files in the test/fixtures/ directory. To regenerate this documentation, run npm run build:docs -->

**Input CSS:**

```css
.example {
	color: if(media(max-width: 768px): blue; else: red);
	font-size: if(supports(display: grid): 1.2rem; else: 1rem);
}
```

**Expected Output:**

```css
.example {
	color: red;
}
@media (max-width: 768px) {
	.example {
		color: blue;
	}
}
.example {
	font-size: 1rem;
}
@supports (display: grid) {
	.example {
		font-size: 1.2rem;
	}
}
```

<!-- /FIXTURE -->

## Multiple Concatenated Conditions

<!-- FIXTURE: multiple-concatenated-conditions -->

<!-- Note: This content is automatically generated from test fixtures. Do not edit the code blocks directly - they will be overwritten during the build process. To modify test cases, edit the corresponding .input.css and .expected.css files in the test/fixtures/ directory. To regenerate this documentation, run npm run build:docs -->

**Input CSS:**

```css
.responsive {
	padding: if(
		media(width >= 1200px): 40px; media(width >= 768px): 30px;
			media(width >= 480px): 20px; else: 15px
	);
}
```

**Expected Output:**

```css
.responsive {
	padding: 15px;
}
@media (width >= 480px) {
	.responsive {
		padding: 20px;
	}
}
@media (width >= 768px) {
	.responsive {
		padding: 30px;
	}
}
@media (width >= 1200px) {
	.responsive {
		padding: 40px;
	}
}
```

<!-- /FIXTURE -->

## Mixed Conditions (Build-time and Runtime)

<!-- FIXTURE: mixed-conditions -->

<!-- Note: This content is automatically generated from test fixtures. Do not edit the code blocks directly - they will be overwritten during the build process. To modify test cases, edit the corresponding .input.css and .expected.css files in the test/fixtures/ directory. To regenerate this documentation, run npm run build:docs -->

**Input CSS:**

```css
.test {
	color: if(media(min-width: 768px): blue; else: red);
	background: if(style(--dark-mode): black; else: white);
}
```

**Expected Output:**

```css
.test {
	color: red;
}
@media (min-width: 768px) {
	.test {
		color: blue;
	}
}
.test {
	background: white;
}
```

<!-- /FIXTURE -->

## Complex Media Query

<!-- FIXTURE: complex-media-query -->

<!-- Note: This content is automatically generated from test fixtures. Do not edit the code blocks directly - they will be overwritten during the build process. To modify test cases, edit the corresponding .input.css and .expected.css files in the test/fixtures/ directory. To regenerate this documentation, run npm run build:docs -->

**Input CSS:**

```css
.responsive {
	width: if(
		media((min-width: 768px) and (max-width: 1024px)): 50%; else: 100%
	);
}
```

**Expected Output:**

```css
.responsive {
	width: 100%;
}
@media ((min-width: 768px) and (max-width: 1024px)) {
	.responsive {
		width: 50%;
	}
}
```

<!-- /FIXTURE -->

## CSS with Comments Preserved

<!-- FIXTURE: with-comments -->

<!-- Note: This content is automatically generated from test fixtures. Do not edit the code blocks directly - they will be overwritten during the build process. To modify test cases, edit the corresponding .input.css and .expected.css files in the test/fixtures/ directory. To regenerate this documentation, run npm run build:docs -->

**Input CSS:**

```css
/* Header styles */
.header {
	background: blue;
}

.conditional {
	color: if(media(max-width: 768px): red; else: blue);
}

/* Footer styles */
.footer {
	background: gray;
}
```

**Expected Output:**

```css
/* Header styles */
.header {
	background: blue;
}
.conditional {
	color: blue;
}
@media (max-width: 768px) {
	.conditional {
		color: red;
	}
}
/* Footer styles */
.footer {
	background: gray;
}
```

<!-- /FIXTURE -->

## CSS Without if() Functions

<!-- FIXTURE: no-if-functions -->

<!-- Note: This content is automatically generated from test fixtures. Do not edit the code blocks directly - they will be overwritten during the build process. To modify test cases, edit the corresponding .input.css and .expected.css files in the test/fixtures/ directory. To regenerate this documentation, run npm run build:docs -->

**Input CSS:**

```css
.normal {
	color: red;
	font-size: 1rem;
}
```

**Expected Output:**

```css
.normal {
	color: red;
	font-size: 1rem;
}
```

<!-- /FIXTURE -->

---

**Note:** This content is automatically generated from test fixtures. Do not edit the code blocks directly - they will be overwritten during the build process. To modify test cases, edit the corresponding `.input.css` and `.expected.css` files in the `test/fixtures/` directory.

To regenerate this documentation, run:

```bash
npm run build:docs
```
