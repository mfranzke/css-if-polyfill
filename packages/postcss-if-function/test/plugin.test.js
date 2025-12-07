import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import postcss from 'postcss';
import { describe, expect, it, vi } from 'vitest';
import {
	loadFixture,
	normalizeCSS,
	postcssFixtureTests
} from '../../../test/scripts/fixture-utils.js';
import { postcssIfFunction } from '../src/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = path.join(__dirname, '../../../test/fixtures');

describe('postcss-if-function plugin', () => {
	async function run(input, output, options = {}) {
		const result = await postcss([postcssIfFunction(options)]).process(
			input,
			{
				from: undefined
			}
		);
		expect(normalizeCSS(result.css)).toBe(normalizeCSS(output));
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

	it('should properly forward the from option when processing files', async () => {
		const { input, expected } = loadFixture('basic-media');
		const inputPath = path.join(FIXTURES_DIR, 'basic-media.input.css');

		// Process with actual file path
		const result = await postcss([postcssIfFunction()]).process(input, {
			from: inputPath
		});

		expect(normalizeCSS(result.css)).toBe(normalizeCSS(expected));
		expect(result.warnings()).toHaveLength(0);

		// Verify the from option was properly set in the result
		expect(result.opts.from).toBe(inputPath);
	});

	it('should not trigger PostCSS warnings about missing from option', async () => {
		const inputPath = path.join(FIXTURES_DIR, 'basic-media.input.css');
		const css = loadFixture('basic-media').input;

		// Track warnings
		const warnings = [];
		const result = await postcss([postcssIfFunction()]).process(css, {
			from: inputPath
		});

		result.warnings().forEach((warning) => {
			warnings.push(warning.text);
		});

		// Should not have any warnings about missing from option
		expect(warnings).toHaveLength(0);
		expect(
			warnings.some((w) => w.includes('did not pass the `from` option'))
		).toBe(false);
	});
});
