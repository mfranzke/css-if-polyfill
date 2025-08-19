#!/usr/bin/env node

/**
 * Fixture Test Runner
 *
 * This script helps validate CSS if() polyfill fixtures by running them through
 * a real browser environment using Playwright.
 *
 * Usage:
 *   node scripts/validate-fixtures.js [fixture-name]
 *
 * Examples:
 *   node scripts/validate-fixtures.js                    # Run all fixtures
 *   node scripts/validate-fixtures.js basic-media       # Run specific fixture
 */

import { execSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDir = path.join(__dirname, '..', 'test', 'fixtures');

function getAvailableFixtures() {
	const files = readdirSync(fixturesDir);
	const inputFiles = files.filter((file) => file.endsWith('.input.css'));
	return inputFiles.map((file) => file.replace('.input.css', ''));
}

function runFixtureTests(fixtureName = null) {
	console.log('🎭 CSS if() Polyfill Fixture Validation');
	console.log('==========================================\n');

	const availableFixtures = getAvailableFixtures();

	if (fixtureName) {
		if (!availableFixtures.includes(fixtureName)) {
			console.error(`❌ Fixture "${fixtureName}" not found.`);
			console.log('\nAvailable fixtures:');
			for (const name of availableFixtures) console.log(`  - ${name}`);
			process.exit(1);
		}

		console.log(`🧪 Running fixture: ${fixtureName}\n`);
	} else {
		console.log(`🧪 Running all ${availableFixtures.length} fixtures:\n`);
		for (const name of availableFixtures) console.log(`  ✓ ${name}`);
		console.log('');
	}

	try {
		// Run Playwright tests
		const grepPattern = fixtureName
			? `--grep "validates ${fixtureName} fixture"`
			: '';
		const command = `npx playwright test test/fixtures-validation/fixture-validation.test.js --config=test/fixtures-validation/fixture-validation.playwright.config.js ${grepPattern}`;

		console.log('🚀 Starting browser-based validation...\n');

		execSync(command, {
			stdio: 'inherit',
			cwd: path.join(__dirname, '..')
		});

		console.log('\n✅ All fixture validations passed!');
		console.log('\nThis means:');
		console.log('  • Your polyfill correctly transforms input CSS');
		console.log('  • Browser rendering matches expected output');
		console.log('  • Media queries work responsively');
		console.log('  • @supports queries function properly');
	} catch {
		console.error('\n❌ Fixture validation failed!');
		console.error('Please check the test output above for details.');
		process.exit(1);
	}
}

// Parse command line arguments
const fixtureName = process.argv[2];

// Show help if requested
if (fixtureName === '--help' || fixtureName === '-h') {
	console.log('CSS if() Polyfill Fixture Validator\n');
	console.log('Usage:');
	console.log('  node scripts/validate-fixtures.js [fixture-name]\n');
	console.log('Examples:');
	console.log(
		'  node scripts/validate-fixtures.js                    # Run all fixtures'
	);
	console.log(
		'  node scripts/validate-fixtures.js basic-media       # Run specific fixture'
	);
	console.log(
		'  node scripts/validate-fixtures.js --list            # List available fixtures\n'
	);
	process.exit(0);
}

// List fixtures if requested
if (fixtureName === '--list' || fixtureName === '-l') {
	console.log('Available fixtures:');
	for (const name of getAvailableFixtures()) console.log(`  ${name}`);
	process.exit(0);
}

// Run the tests
runFixtureTests(fixtureName);
