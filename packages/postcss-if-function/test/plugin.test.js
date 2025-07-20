import postcss from 'postcss';
import { describe, expect, it } from 'vitest';
import { postcssIfFunction } from '../src/index.js';

describe('postcss-if-function plugin', () => {
	async function run(input, output, options = {}) {
		const result = await postcss([postcssIfFunction(options)]).process(
			input,
			{
				from: undefined
			}
		);
		expect(result.css).toBe(output);
		expect(result.warnings()).toHaveLength(0);
	}

	it('should transform media() functions to @media rules', async () => {
		const input = `
.example {
  color: if(media(max-width: 768px): blue; else: red);
}`;

		const expected = `.example { color: red; }
@media (max-width: 768px) {
  .example { color: blue; }
}`;

		await run(input, expected);
	});

	it('should transform supports() functions to @supports rules', async () => {
		const input = `
.grid {
  display: if(supports(display: grid): grid; else: block);
}`;

		const expected = `.grid { display: block; }
@supports (display: grid) {
  .grid { display: grid; }
}`;

		await run(input, expected);
	});

	it('should handle multiple if() functions in one rule', async () => {
		const input = `
.example {
  color: if(media(max-width: 768px): blue; else: red);
  font-size: if(supports(display: grid): 1.2rem; else: 1rem);
}`;

		const expected = `.example { color: red; }
@media (max-width: 768px) {
  .example { color: blue; }
}
.example { font-size: 1rem; }
@supports (display: grid) {
  .example { font-size: 1.2rem; }
}`;

		await run(input, expected);
	});

	it('should handle multiple separate if() functions', async () => {
		const input = `
.nested {
  color: if(media(max-width: 768px): blue; else: red);
  background: if(supports(color: lab(50% 20 -30)): lab(50% 20 -30); else: transparent);
}`;

		const expected = `.nested { color: red; }
@media (max-width: 768px) {
  .nested { color: blue; }
}
.nested { background: transparent; }
@supports (color: lab(50% 20 -30)) {
  .nested { background: lab(50% 20 -30); }
}`;

		await run(input, expected);
	});

	it('should handle complex media queries', async () => {
		const input = `
.responsive {
  width: if(media(min-width: 768px and max-width: 1024px): 50%; else: 100%);
}`;

		const expected = `.responsive { width: 100%; }
@media (min-width: 768px and max-width: 1024px) {
  .responsive { width: 50%; }
}`;

		await run(input, expected);
	});

	it('should handle CSS that does not contain if() functions', async () => {
		const input = `
.normal {
  color: red;
  font-size: 1rem;
}`;

		const expected = `
.normal {
  color: red;
  font-size: 1rem;
}`;

		await run(input, expected);
	});

	it('should preserve other CSS rules and comments', async () => {
		const input = `
/* Header styles */
.header {
  background: blue;
}

.conditional {
  color: if(media(max-width: 768px): red; else: blue);
}

/* Footer styles */
.footer {
  background: gray;
}`;

		const expected = `/* Header styles */
.header {
  background: blue;
}
.conditional { color: blue; }
@media (max-width: 768px) {
  .conditional { color: red; }
}
/* Footer styles */
.footer {
  background: gray;
}`;

		await run(input, expected);
	});

	it('should work with logTransformations option', async () => {
		const input = `
.example {
  color: if(media(max-width: 768px): blue; else: red);
}`;

		const expected = `.example { color: red; }
@media (max-width: 768px) {
  .example { color: blue; }
}`;

		// Capture console output
		const consoleLogs = [];
		const originalLog = console.log;
		console.log = (...args) => {
			consoleLogs.push(args.join(' '));
		};

		await run(input, expected, { logTransformations: true });

		console.log = originalLog;

		expect(consoleLogs).toContain(
			'[postcss-if-function] Transformation statistics:'
		);
		expect(
			consoleLogs.some((log) => log.includes('Total transformations: 1'))
		).toBe(true);
	});

	it('should handle malformed CSS gracefully', async () => {
		const input = `
.broken {
  color: if(media(invalid-query): blue; else: red);
}`;

		// Should not throw an error, but may not transform properly
		const result = await postcss([postcssIfFunction()]).process(input, {
			from: undefined
		});

		expect(result.css).toBeDefined();
	});
});
