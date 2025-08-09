/**
 * Fixture Validation Tests
 *
 * This test suite validates CSS fixture pairs by:
 * 1. Loading the input CSS with the polyfill
 * 2. Loading the expected CSS directly
 * 3. Comparing the computed styles in a real browser environment
 */

import { expect, test } from '@playwright/test';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDir = path.join(__dirname, '..', 'fixtures');
const polyfillUmdPath = path.join(
	__dirname,
	'..',
	'..',
	'packages',
	'css-if-polyfill',
	'dist',
	'index.umd.js'
);

// Read polyfill UMD build once at module load
const polyfillUmdJs = readFileSync(polyfillUmdPath, 'utf8');

// Get all fixture pairs
const _getFixturePairs = () => {
	const files = readdirSync(fixturesDir);
	const inputFiles = files.filter((file) => file.endsWith('.input.css'));

	return inputFiles.map((inputFile) => {
		const baseName = inputFile.replace('.input.css', '');
		const expectedFile = `${baseName}.expected.css`;

		if (!files.includes(expectedFile)) {
			throw new Error(`Missing expected file for ${inputFile}`);
		}

		return {
			name: baseName,
			inputFile: path.join(fixturesDir, inputFile),
			expectedFile: path.join(fixturesDir, expectedFile),
			inputCSS: readFileSync(path.join(fixturesDir, inputFile), 'utf8'),
			expectedCSS: readFileSync(
				path.join(fixturesDir, expectedFile),
				'utf8'
			)
		};
	});
};

/**
 * Test media query responsive behavior
 */
async function testMediaQueryBehavior(page) {
	// Test at different viewport sizes
	const viewports = [
		{ width: 1200, height: 800, name: 'desktop' },
		{ width: 768, height: 600, name: 'tablet' },
		{ width: 375, height: 667, name: 'mobile' }
	];

	/* eslint-disable no-await-in-loop */
	for (const viewport of viewports) {
		await page.setViewportSize(viewport);
		await page.waitForTimeout(100); // Allow media queries to apply

		// Re-enable polyfill styles for this test
		await page.evaluate(() => {
			globalThis.document.querySelector('#polyfill-styles').disabled =
				false;
			globalThis.document.querySelector('#expected-styles').disabled =
				true;
		});

		await page.waitForTimeout(50);

		const polyfillStyles = await page.evaluate(() => {
			const testElement =
				globalThis.document.querySelector('.test, .responsive');
			if (!testElement) return null;

			const computed = globalThis.getComputedStyle(testElement);
			return {
				width: computed.width,
				color: computed.color,
				display: computed.display
			};
		});

		// Switch to expected styles
		await page.evaluate(() => {
			globalThis.document.querySelector('#polyfill-styles').disabled =
				true;
			globalThis.document.querySelector('#expected-styles').disabled =
				false;
		});

		await page.waitForTimeout(50);

		const expectedStyles = await page.evaluate(() => {
			const testElement =
				globalThis.document.querySelector('.test, .responsive');
			if (!testElement) return null;

			const computed = globalThis.getComputedStyle(testElement);
			return {
				width: computed.width,
				color: computed.color,
				display: computed.display
			};
		});

		// Compare styles at this viewport
		if (polyfillStyles && expectedStyles) {
			for (const [property, expectedValue] of Object.entries(
				expectedStyles
			)) {
				expect(
					polyfillStyles[property],
					`Property '${property}' should match at ${viewport.name} viewport (${viewport.width}x${viewport.height})`
				).toBe(expectedValue);
			}
		}
	}
	/* eslint-enable no-await-in-loop */
}

/**
 * Test @supports query behavior
 */
async function testSupportsQueryBehavior(page) {
	// Test different CSS support scenarios
	const supportTests = [
		{ property: 'display', value: 'grid' },
		{ property: 'display', value: 'flex' },
		{ property: 'color', value: 'color(display-p3 1 0 0)' }
	];

	/* eslint-disable no-await-in-loop */
	for (const supportTest of supportTests) {
		const supportsResult = await page.evaluate(
			({ property, value }) => globalThis.CSS.supports(property, value),
			supportTest
		);

		// Re-test styles knowing the actual support status
		await page.evaluate(() => {
			globalThis.document.querySelector('#polyfill-styles').disabled =
				false;
			globalThis.document.querySelector('#expected-styles').disabled =
				true;
		});

		await page.waitForTimeout(50);

		const polyfillStyles = await page.evaluate(() => {
			const testElement = globalThis.document.querySelector('.test');
			if (!testElement) return null;

			const computed = globalThis.getComputedStyle(testElement);
			return {
				color: computed.color,
				display: computed.display,
				width: computed.width
			};
		});

		// This test mainly ensures the polyfill doesn't break @supports functionality
		expect(polyfillStyles).toBeTruthy();
		expect(supportsResult).toBeDefined();
	}
	/* eslint-enable no-await-in-loop */
}

// Test configuration for different scenarios
test.describe('CSS if() Polyfill Fixture Validation', () => {
	test.beforeEach(async ({ page }) => {
		// Set up server to serve static files
		await page.route('/packages/**', async (route) => {
			const url = route.request().url();
			const filePath = url.replace(
				/^.*\/packages\//,
				path.join(__dirname, '..', '..', 'packages')
			);

			try {
				const content = readFileSync(filePath, 'utf8');
				const contentType = filePath.endsWith('.js')
					? 'application/javascript'
					: 'text/plain';

				await route.fulfill({
					status: 200,
					contentType,
					body: content
				});
			} catch {
				await route.fulfill({
					status: 404,
					body: `File not found: ${filePath}`
				});
			}
		});
	});

	// Create individual test for each fixture
	test('validates basic-style fixture', async ({ page }) => {
		await testFixture(page, 'basic-style');
	});

	test('validates basic-media fixture', async ({ page }) => {
		await testFixture(page, 'basic-media');
	});

	test('validates basic-supports fixture', async ({ page }) => {
		await testFixture(page, 'basic-supports');
	});

	test('validates complex-media-query fixture', async ({ page }) => {
		await testFixture(page, 'complex-media-query');
	});

	test('validates mixed-conditions fixture', async ({ page }) => {
		await testFixture(page, 'mixed-conditions');
	});

	test('validates multiple-concatenated-conditions fixture', async ({
		page
	}) => {
		await testFixture(page, 'multiple-concatenated-conditions');
	});

	test('validates multiple-functions-one-rule fixture', async ({ page }) => {
		await testFixture(page, 'multiple-functions-one-rule');
	});

	test('validates multiple-separate-functions fixture', async ({ page }) => {
		await testFixture(page, 'multiple-separate-functions');
	});

	test('validates no-if-functions fixture', async ({ page }) => {
		await testFixture(page, 'no-if-functions');
	});

	test('validates with-comments fixture', async ({ page }) => {
		await testFixture(page, 'with-comments');
	});
});

async function testFixture(page, fixtureName) {
	// Read fixture files
	const inputCSS = readFileSync(
		path.join(fixturesDir, `${fixtureName}.input.css`),
		'utf8'
	);
	const expectedCSS = readFileSync(
		path.join(fixturesDir, `${fixtureName}.expected.css`),
		'utf8'
	);

	// Create HTML page with polyfill and test content
	const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>CSS if() Polyfill Test - ${fixtureName}</title>
      <style id="polyfill-styles">
        ${inputCSS}
      </style>
      <style id="expected-styles" disabled>
        ${expectedCSS}
      </style>
    </head>
    <body>
      <div class="test responsive">Test Element</div>
      <div class="test-container">
        <div class="nested-test">Nested Test</div>
      </div>
      <script>
        // Inline the polyfill UMD build
        ${polyfillUmdJs}

        // Signal that polyfill is ready (UMD build auto-initializes)
        globalThis.polyfillReady = true;
      </script>
    </body>
    </html>
  `;

	// Set up the page content
	await page.setContent(htmlContent, {
		waitUntil: 'domcontentloaded'
	});

	// Wait for polyfill to be ready
	await page.waitForFunction(() => globalThis.polyfillReady === true, {
		timeout: 5000
	});

	// Give polyfill time to process
	await page.waitForTimeout(100);

	// Get computed styles after polyfill processing
	const polyfillStyles = await page.evaluate(() => {
		const testElement = globalThis.document.querySelector('.test');
		if (!testElement) return null;

		const computed = globalThis.getComputedStyle(testElement);

		return {
			color: computed.color,
			width: computed.width,
			display: computed.display,
			backgroundColor: computed.backgroundColor,
			fontSize: computed.fontSize,
			margin: computed.margin,
			padding: computed.padding,
			border: computed.border
		};
	});

	// Now test with expected CSS
	await page.evaluate(() => {
		// Disable polyfill styles and enable expected styles
		globalThis.document.querySelector('#polyfill-styles').disabled = true;
		globalThis.document.querySelector('#expected-styles').disabled = false;
	});

	// Wait a bit for styles to apply
	await page.waitForTimeout(50);

	// Get computed styles with expected CSS
	const expectedStyles = await page.evaluate(() => {
		const testElement = globalThis.document.querySelector('.test');
		if (!testElement) return null;

		const computed = globalThis.getComputedStyle(testElement);

		return {
			color: computed.color,
			width: computed.width,
			display: computed.display,
			backgroundColor: computed.backgroundColor,
			fontSize: computed.fontSize,
			margin: computed.margin,
			padding: computed.padding,
			border: computed.border
		};
	});

	// Compare the styles
	expect(polyfillStyles).toBeTruthy();
	expect(expectedStyles).toBeTruthy();

	// Compare each style property
	for (const [property, expectedValue] of Object.entries(expectedStyles)) {
		expect(
			polyfillStyles[property],
			`Property '${property}' should match between polyfill and expected CSS`
		).toBe(expectedValue);
	}

	// Test responsive behavior for media query fixtures
	if (fixtureName.includes('media')) {
		await testMediaQueryBehavior(page);
	}

	// Test supports() functionality
	if (fixtureName.includes('supports')) {
		await testSupportsQueryBehavior(page);
	}
}
