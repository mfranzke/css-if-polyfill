import { exec } from 'node:child_process';
import { readFile, unlink, writeFile } from 'node:fs/promises';
import { promisify } from 'node:util';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

const execAsync = promisify(exec);

describe('CLI Tool', () => {
	const testInputFile = 'test-cli-input.css';
	const testOutputFile = 'test-cli-output.css';

	beforeEach(async () => {
		// Create test input file
		const testCSS = `
.test {
  color: if(media(min-width: 768px): blue; else: red);
  background: if(supports(display: grid): transparent; else: white);
  font-size: if(style(--large): 24px; else: 16px);
}
`;
		await writeFile(testInputFile, testCSS);
	});

	afterEach(async () => {
		// Clean up test files
		try {
			await unlink(testInputFile);
			await unlink(testOutputFile);
		} catch {
			// Files might not exist
		}
	});

	test('transforms CSS file with output to file', async () => {
		const { stdout } = await execAsync(
			`node bin/cli.js ${testInputFile} ${testOutputFile} --stats`
		);

		expect(stdout).toContain('Reading CSS from');
		expect(stdout).toContain('Transformation Statistics');
		expect(stdout).toContain('Transformed CSS written to');

		// Check output file exists and contains transformed CSS
		const outputContent = await readFile(testOutputFile, 'utf8');
		expect(outputContent).toContain('@media (min-width: 768px)');
		expect(outputContent).toContain('@supports (display: grid)');
		expect(outputContent).toContain('Runtime-processed rules');
	});

	test('outputs to stdout when no output file specified', async () => {
		const { stdout } = await execAsync(
			`node bin/cli.js ${testInputFile} --stats`
		);

		expect(stdout).toContain('Transformation Statistics');
		expect(stdout).toContain('Transformed CSS:');
		expect(stdout).toContain('@media (min-width: 768px)');
	});

	test('shows help when no arguments provided', async () => {
		const { stdout } = await execAsync('node bin/cli.js --help');

		expect(stdout).toContain('CSS if() Build-time Transformation CLI');
		expect(stdout).toContain('Usage:');
		expect(stdout).toContain('Options:');
	});

	test('handles minification option', async () => {
		const { stdout } = await execAsync(
			`node bin/cli.js ${testInputFile} ${testOutputFile} --minify --stats`
		);

		expect(stdout).toContain('CSS was minified');

		const outputContent = await readFile(testOutputFile, 'utf8');
		// Minified CSS should have less whitespace
		expect(outputContent.includes('\n  ')).toBe(false);
	});

	test('handles non-existent input file gracefully', async () => {
		try {
			await execAsync('node bin/cli.js non-existent.css');
			expect.fail('Should have thrown an error');
		} catch (error) {
			expect(error.stdout || error.stderr).toContain('Error');
		}
	});
});
