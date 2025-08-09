import postcss from 'postcss';
import { describe, expect, it, vi } from 'vitest';
import {
	loadFixture,
	normalizeCSS,
	postcssFixtureTests
} from '../../../test/scripts/fixture-utils.js';
import { postcssIfFunction } from '../src/index.js';

describe('postcss-if-function plugin', () => {
	async function run(input, output, options = {}) {
		const result = await postcss([postcssIfFunction(options)]).process(
			input,
			{
				from: undefined
			}
		);
		// Manually strip comments from result to match Lightning CSS behavior
		let cssWithoutComments = result.css.replace(/\/\*[\s\S]*?\*\//g, '');

		// Normalize PostCSS output to match expected format:
		// Remove extra parentheses in complex media queries: ((condition)) -> (condition)
		cssWithoutComments = cssWithoutComments.replace(
			/\(\(([^)]+)\)\)/g,
			'($1)'
		);

		expect(normalizeCSS(cssWithoutComments)).toBe(normalizeCSS(output));
		expect(result.warnings()).toHaveLength(0);
	}

	// Generate tests for each shared fixture
	for (const { fixture, description } of postcssFixtureTests) {
		it(`should ${description}`, async () => {
			const { input, expected } = loadFixture(fixture);
			await run(input, expected);
		});
	}

	it('should work with logTransformations option', async () => {
		const { input, expected } = loadFixture('basic-media');

		// Spy on console.log
		const logSpy = vi.spyOn(console, 'log');

		await run(input, expected, { logTransformations: true });

		expect(logSpy).toHaveBeenCalledWith(
			'[postcss-if-function] Transformation statistics:'
		);
		expect(
			logSpy.mock.calls.some((call) =>
				call[0].includes('Total transformations: 1')
			)
		).toBe(true);

		logSpy.mockRestore();
	});

	it('should handle malformed CSS gracefully', async () => {
		const input = `
.broken {
  color: if(media(invalid-query): blue; else: red);
}`;

		// Should not throw an error, but may not transform properly
		const result = await postcss([postcssIfFunction()]).process(input, {
			from: undefined
		});

		expect(result.css).toBeDefined();
	});
});
