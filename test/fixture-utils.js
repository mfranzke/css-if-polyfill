/**
 * Test fixture utilities for loading CSS test data
 */
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = path.join(__dirname, 'fixtures');

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
