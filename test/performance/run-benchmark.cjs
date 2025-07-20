#!/usr/bin/env node

const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const process = require('node:process');

(async () => {
	console.log('Starting performance benchmark...');

	const browser = await chromium.launch();
	console.log('Browser launched successfully');

	const page = await browser.newPage();
	console.log('New page created');

	const benchmarkPath = `file://${path.join(__dirname, 'benchmark.html')}`;
	console.log(`Loading benchmark from: ${benchmarkPath}`);

	await page.goto(benchmarkPath);
	console.log('Page loaded, waiting for results...');

	// Add console listener to see any errors from the page
	page.on('console', (message) => console.log('PAGE LOG:', message.text()));
	page.on('pageerror', (error) => console.error('PAGE ERROR:', error));

	// Wait for benchmark to complete with increased timeout
	await page.waitForFunction(
		() => {
			const results = globalThis.performanceResults;
			return (
				results &&
				typeof results.initTime === 'number' &&
				typeof results.processTime === 'number' &&
				typeof results.avgProcessTime === 'number'
			);
		},
		{
			timeout: 60_000
		}
	);
	console.log('Performance results available');

	// Get results
	const results = await page.evaluate(() => {
		const results = globalThis.performanceResults;
		if (
			!results ||
			typeof results.initTime !== 'number' ||
			typeof results.processTime !== 'number' ||
			typeof results.avgProcessTime !== 'number'
		) {
			throw new Error('Invalid performance results structure');
		}

		return results;
	});

	console.log('Performance Benchmark Results:');
	console.log(`Initialization time: ${results.initTime.toFixed(2)}ms`);
	console.log(
		`Total processing time (1000 iterations): ${results.processTime.toFixed(2)}ms`
	);
	console.log(
		`Average processing time per iteration: ${results.avgProcessTime.toFixed(4)}ms`
	);

	// Save results to file
	fs.writeFileSync(
		'test/performance/performance-results.json',
		JSON.stringify(results, null, 2)
	);

	// Check performance thresholds
	if (results.initTime > 100) {
		console.error('❌ Initialization time exceeded threshold (100ms)');
		process.exit(1);
	}

	if (results.avgProcessTime > 1) {
		console.error('❌ Average processing time exceeded threshold (1ms)');
		process.exit(1);
	}

	console.log('✅ All performance benchmarks passed');

	await browser.close();
})();
