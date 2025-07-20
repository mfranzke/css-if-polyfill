import postcss from 'postcss';
import { describe, expect, it, vi } from 'vitest';
import { loadFixture } from '../../../test/fixture-utils.js';
import { postcssIfFunction } from '../src/index.js';

describe('postcss-if-function plugin', () => {
	async function run(input, output, options = {}) {
		const result = await postcss([postcssIfFunction(options)]).process(
			input,
			{
				from: undefined
			}
		);
		expect(result.css).toBe(output);
		expect(result.warnings()).toHaveLength(0);
	}

	it('should transform media() functions to @media rules', async () => {
		const { input, expected } = loadFixture('basic-media');
		await run(input, expected);
	});

	it('should transform supports() functions to @supports rules', async () => {
		const { input, expected } = loadFixture('basic-supports');
		await run(input, expected);
	});

	it('should handle multiple if() functions in one rule', async () => {
		const { input, expected } = loadFixture('multiple-functions-one-rule');
		await run(input, expected);
	});

	it('should handle multiple separate if() functions', async () => {
		const { input, expected } = loadFixture('multiple-separate-functions');
		await run(input, expected);
	});

	it('should handle complex media queries', async () => {
		const { input, expected } = loadFixture('complex-media-query');
		await run(input, expected);
	});

	it('should handle multiple if() conditions', async () => {
		const { input, expected } = loadFixture(
			'multiple-concatenated-conditions'
		);
		await run(input, expected);
	});

	it('should handle CSS that does not contain if() functions', async () => {
		const { input, expected } = loadFixture('no-if-functions');
		await run(input, expected);
	});

	it('should preserve other CSS rules and comments', async () => {
		const { input, expected } = loadFixture('with-comments');
		await run(input, expected);
	});

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
