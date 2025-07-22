#!/usr/bin/env node

/**
 * Generate expected outputs for new fixtures
 */

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Import the transform function
import { buildTimeTransform } from './packages/css-if-polyfill/src/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDir = path.join(__dirname, 'test', 'fixtures');

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
