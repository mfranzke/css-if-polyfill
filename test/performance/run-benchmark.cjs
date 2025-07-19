#!/usr/bin/env node

const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const process = require('node:process');

(async () => {
	const browser = await chromium.launch();
	const page = await browser.newPage();

	await page.goto(`file://${path.join(__dirname, 'benchmark.html')}`);

	// Wait for benchmark to complete
	await page.waitForFunction(() => globalThis.performanceResults);

	// Get results
	const results = await page.evaluate(() => globalThis.performanceResults);

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
		'performance-results.json',
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
