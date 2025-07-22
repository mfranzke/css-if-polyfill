/**
 * Test fixture utilities for loading CSS test data
 */
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = path.join(__dirname, '..', 'fixtures');

/**
 * Load a test fixture pair (input and expected)
 * @param {string} name - The fixture name (without .input/.expected suffix)
 * @returns {{ input: string, expected: string }}
 */
export function loadFixture(name) {
	const inputPath = path.join(FIXTURES_DIR, `${name}.input.css`);
	const expectedPath = path.join(FIXTURES_DIR, `${name}.expected.css`);

	try {
		const input = readFileSync(inputPath, 'utf8').trim();
		const expected = readFileSync(expectedPath, 'utf8').trim();

		return { input, expected };
	} catch (error) {
		throw new Error(`Failed to load fixture "${name}": ${error.message}`);
	}
}

/**
 * Get a list of all available fixtures
 * @returns {string[]} Array of fixture names
 */
export function getAvailableFixtures() {
	const fixtures = readdirSync(FIXTURES_DIR)
		.filter((file) => file.endsWith('.input.css'))
		.map((file) => file.replace('.input.css', ''));

	return fixtures.sort();
}

/**
 * Load fixture for documentation/build systems
 * @param {string} fixturePath - Relative path to fixture file from project root
 * @returns {string} File contents
 */
export function loadFixtureForDocs(fixturePath) {
	const projectRoot = path.join(__dirname, '..');
	const fullPath = path.join(projectRoot, fixturePath);

	try {
		return readFileSync(fullPath, 'utf8').trim();
	} catch (error) {
		throw new Error(
			`Failed to load fixture for docs "${fixturePath}": ${error.message}`
		);
	}
}

/**
 * Generate fixture documentation block
 * @param {string} name - Fixture name
 * @param {string} description - Description of the test case
 * @returns {string} Markdown documentation block
 */
export function generateFixtureDoc(name, description) {
	const { input, expected } = loadFixture(name);

	return `
## ${description}

**Input CSS:**
\`\`\`css
${input}
\`\`\`

**Expected Output:**
\`\`\`css
${expected}
\`\`\`
`.trim();
}

/**
 * Normalize CSS for comparison by removing formatting differences
 * @param {string} css - CSS string to normalize
 * @returns {string} Normalized CSS string
 */
export function normalizeCSS(css) {
	return css
		.replaceAll(/\s+/g, ' ') // Replace multiple whitespace/newlines with single space
		.replaceAll(/\s*{\s*/g, '{') // Remove spaces around opening braces
		.replaceAll(/\s*}\s*/g, '}') // Remove spaces around closing braces
		.replaceAll(/\s*;\s*/g, ';') // Remove spaces around semicolons
		.trim();
}

/**
 * Standard test configurations for shared fixtures
 */
export const basicFixtureTests = [
	{
		fixture: 'basic-media',
		description: 'transform media queries to native CSS'
	},
	{
		fixture: 'basic-supports',
		description: 'transform supports queries to native CSS'
	},
	{
		fixture: 'complex-media-query',
		description: 'handle complex media queries'
	},
	{
		fixture: 'multiple-functions-one-rule',
		description: 'handle multiple functions in one rule'
	},
	{
		fixture: 'with-comments',
		description: 'handle CSS with comments'
	},
	{
		fixture: 'no-if-functions',
		description: 'preserve CSS without if() functions'
	},
	{
		fixture: 'complex-supports',
		description: 'handle complex supports conditions with multiple values'
	},
	{
		fixture: 'nested-media-features',
		description: 'handle complex nested media feature queries'
	}
];

/**
 * Runtime-only test configurations for features that cannot be transformed at build time
 */
export const runtimeOnlyFixtureTests = [
	{
		fixture: 'empty-token-stream',
		description:
			'handle if() functions without else clause (empty token stream)'
	},
	{
		fixture: 'cyclic-substitution',
		description: 'prevent cyclic substitution context in style queries'
	},
	{
		fixture: 'boolean-negation',
		description: 'handle boolean negation in conditions'
	},
	{
		fixture: 'multiple-mixed-conditions',
		description:
			'handle multiple mixed condition types in single if() function'
	}
];

/**
 * PostCSS-specific test configurations (includes additional fixtures used only by PostCSS)
 */
export const postcssFixtureTests = [
	...basicFixtureTests,
	{
		fixture: 'multiple-separate-functions',
		description: 'handle multiple separate if() functions'
	},
	{
		fixture: 'multiple-concatenated-conditions',
		description: 'handle multiple if() conditions'
	}
];
