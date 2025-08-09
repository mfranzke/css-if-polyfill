import { describe, expect, it } from 'vitest';
import {
	loadFixture,
	normalizeCSS,
	postcssFixtureTests
} from '../../../test/scripts/fixture-utils.js';
import { transform } from '../src/index.js';

describe('lightningcss-plugin-if-function plugin', () => {
	function run(input, output, options = {}) {
		// Use TextEncoder instead of Buffer for better cross-platform compatibility
		const encoder = new TextEncoder();
		const result = transform({
			code: encoder.encode(input),
			// Test-specific options to preserve semantic CSS syntax
			minify: false,
			...options
		});
		expect(normalizeCSS(result.code.toString('utf8'))).toBe(
			normalizeCSS(output)
		);
	}

	// Generate tests for each shared fixture
	for (const { fixture, description } of postcssFixtureTests) {
		it(`should ${description}`, async () => {
			const { input, expected } = loadFixture(fixture);
			run(input, expected);
		});
	}

	it('should handle malformed CSS gracefully', async () => {
		const input = `
.broken {
  color: if(media(invalid-query): blue; else: red);
}`;

		// Should not throw an error, but may not transform properly
		const encoder = new TextEncoder();
		const result = transform({
			code: encoder.encode(input),
			// Test-specific options to preserve semantic CSS syntax
			minify: false
		});

		expect(result.code).toBeDefined();
	});
});
