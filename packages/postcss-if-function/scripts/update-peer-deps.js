#!/usr/bin/env node

import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packageJsonPath = path.join(__dirname, '..', 'package.json');
const examplesDir = path.join(__dirname, '..', 'examples');

// PostCSS versions to test
const versions = [
	{ dir: 'postcss-version-7', range: '^7.0.0' },
	{ dir: 'postcss-version-8', range: '^8.0.0' }
	// Add more versions here as they become available and supported
	// { dir: 'postcss-version-9', range: '^9.0.0' }
];

async function testVersion(versionDir) {
	const versionPath = path.join(examplesDir, versionDir);

	try {
		console.log(`Testing PostCSS version in ${versionDir}...`);

		// Install dependencies
		execSync('npm install', {
			cwd: versionPath,
			stdio: 'inherit'
		});

		// Run tests
		execSync('npm test', {
			cwd: versionPath,
			stdio: 'inherit'
		});

		console.log(`✅ PostCSS ${versionDir} tests passed`);
		return true;
	} catch (error) {
		console.error(`❌ PostCSS ${versionDir} tests failed:`, error.message);
		return false;
	}
}

async function updatePeerDependencies() {
	console.log('Testing PostCSS version compatibility...\n');

	const testedVersions = [];

	// Test versions sequentially to avoid conflicts
	for (const version of versions) {
		const success = await testVersion(version.dir); // eslint-disable-line no-await-in-loop
		if (success) {
			testedVersions.push(version.range);
		}
	}

	if (testedVersions.length === 0) {
		console.error('No PostCSS versions passed tests!');
		process.exit(1);
	}

	// Update package.json with supported versions
	const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

	// Create a version range that includes all tested versions
	const minVersion = testedVersions.sort()[0]; // Get the lowest version
	const maxVersion = testedVersions.sort().reverse()[0]; // Get the highest version

	// Extract major version numbers
	const minMajor = Number.parseInt(minVersion.match(/\^?(\d+)/)[1], 10);
	const maxMajor = Number.parseInt(maxVersion.match(/\^?(\d+)/)[1], 10);

	// Create a range that covers all tested major versions
	const peerDependencyRange =
		minMajor === maxMajor
			? `^${minMajor}.0.0`
			: `>=${minMajor}.0.0 <${maxMajor + 1}.0.0`;

	packageJson.peerDependencies.postcss = peerDependencyRange;

	writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');

	console.log(
		`\n✅ Updated peerDependencies.postcss to: ${peerDependencyRange}`
	);
	console.log(`Tested versions: ${testedVersions.join(', ')}`);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
	try {
		await updatePeerDependencies();
	} catch (error) {
		console.error('Error:', error);
		process.exit(1);
	}
}
