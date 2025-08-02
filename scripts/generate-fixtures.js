#!/usr/bin/env node

/**
 * Generate expected outputs for new fixtures
 *
 * This development utility script helps generate expected output files for new test fixtures
 * by running input CSS through the polyfill transformation engine.
 *
 * Usage:
 *   1. Create your .input.css files in test/fixtures/
 *   2. Add the fixture names to the newFixtures array below
 *   3. Run: node scripts/generate-fixtures.js
 *   4. Review and adjust the generated .expected.css files as needed
 *
 * Note: Always review the generated outputs to ensure they match expected behavior.
 */

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Import the transform function
import { buildTimeTransform } from '../packages/css-if-polyfill/src/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDir = path.join(__dirname, '..', 'test', 'fixtures');

// Configure which fixtures to process
// Add fixture names (without .input.css suffix) to generate expected outputs
const newFixtures = [
	'empty-token-stream',
	'cyclic-substitution',
	'complex-supports',
	'boolean-negation',
	'multiple-mixed-conditions',
	'nested-media-features'
];

async function generateExpectedOutputs() {
	const results = await Promise.all(
		newFixtures.map(async (fixture) => {
			const inputPath = path.join(fixturesDir, `${fixture}.input.css`);
			const expectedPath = path.join(
				fixturesDir,
				`${fixture}.expected.css`
			);

			try {
				const input = await readFile(inputPath, 'utf8');
				console.log(`Processing ${fixture}...`);
				console.log('Input:', input);

				const result = buildTimeTransform(input);
				console.log('Output:', result);

				// Extract the appropriate CSS output (nativeCSS for static transforms, runtimeCSS for dynamic)
				const outputCSS = result.nativeCSS || result.runtimeCSS || '';

				await writeFile(expectedPath, outputCSS);
				console.log(`✓ Generated ${fixture}.expected.css\n`);
				return { fixture, success: true };
			} catch (error) {
				console.error(`✗ Failed to process ${fixture}:`, error.message);
				return { fixture, success: false, error };
			}
		})
	);

	return results;
}

await generateExpectedOutputs();
