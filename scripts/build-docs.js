#!/usr/bin/env node

/**
 * Build script to inject CSS test fixtures into documentation
 * Usage: node build-docs.js
 */

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');
const fixturesDir = path.join(projectRoot, 'test', 'fixtures');

/**
 * Process a markdown file and replace fixture placeholders
 * @param {string} filePath - Path to the markdown file
 */
function processMarkdownFile(filePath) {
	console.log(`Processing ${filePath}...`);

	let content = readFileSync(filePath, 'utf8');
	let modified = false;

	// Find fixture placeholders: <!-- FIXTURE: fixture-name -->
	const fixtureRegex =
		/<!-- FIXTURE: ([^>]+) -->([\s\S]*?)<!-- \/FIXTURE -->/g;

	content = content.replaceAll(
		fixtureRegex,
		(match, fixtureName, _existingContent) => {
			try {
				const inputPath = path.join(
					fixturesDir,
					`${fixtureName}.input.css`
				);
				const expectedPath = path.join(
					fixturesDir,
					`${fixtureName}.expected.css`
				);

				const inputCSS = readFileSync(inputPath, 'utf8').trim();
				const expectedCSS = readFileSync(expectedPath, 'utf8').trim();

				const newContent = `

<!-- Note: This content is automatically generated from test fixtures. Do not edit the code blocks directly - they will be overwritten during the build process. To modify test cases, edit the corresponding .input.css and .expected.css files in the test/fixtures/ directory -->

**Input CSS:**

\`\`\`css
${inputCSS}
\`\`\`

**Expected Output:**

\`\`\`css
${expectedCSS}
\`\`\`
`;

				modified = true;
				return `<!-- FIXTURE: ${fixtureName} -->${newContent}
<!-- /FIXTURE -->`;
			} catch (error) {
				console.warn(
					`Warning: Could not load fixture "${fixtureName}": ${error.message}`
				);
				return match; // Keep existing content if fixture can't be loaded
			}
		}
	);

	if (modified) {
		writeFileSync(filePath, content, 'utf8');
		console.log(`✅ Updated ${filePath}`);
	} else {
		console.log(`⏭️  No changes needed for ${filePath}`);
	}
}

/**
 * Find and process all markdown files in the entire codebase
 */
function processAllDocs() {
	function processDirectory(dirPath) {
		// Skip node_modules, .git, dist, coverage and other build directories
		const dirName = path.basename(dirPath);
		const skipDirs = ['node_modules', '.git', 'dist', 'coverage'];

		if (skipDirs.includes(dirName)) {
			return;
		}

		const items = readdirSync(dirPath, { withFileTypes: true });

		for (const item of items) {
			const fullPath = path.join(dirPath, item.name);

			if (item.isDirectory()) {
				processDirectory(fullPath);
			} else if (item.isFile() && item.name.endsWith('.md')) {
				// Check if the file contains fixture placeholders before processing
				try {
					const content = readFileSync(fullPath, 'utf8');
					if (content.includes('<!-- FIXTURE:')) {
						processMarkdownFile(fullPath);
					}
				} catch (error) {
					console.warn(
						`Warning: Could not read ${fullPath}: ${error.message}`
					);
				}
			}
		}
	}

	// Start processing from the project root
	processDirectory(projectRoot);
}

// Generate fixture list for docs
function generateFixtureList() {
	const fixtures = readdirSync(fixturesDir)
		.filter((file) => file.endsWith('.input.css'))
		.map((file) => file.replace('.input.css', ''))
		.sort();

	console.log('\n📋 Available fixtures:');
	for (const fixture of fixtures) {
		console.log(`   - ${fixture}`);
	}

	console.log(
		`\n💡 To use in docs: <!-- FIXTURE: fixture-name -->\n<!-- /FIXTURE -->`
	);
}

// Main execution
console.log('🔧 CSS if() Polyfill Documentation Builder\n');

try {
	generateFixtureList();
	processAllDocs();
	console.log('\n✅ Documentation build completed!');
} catch (error) {
	console.error('❌ Build failed:', error.message);
	process.exit(1);
}
