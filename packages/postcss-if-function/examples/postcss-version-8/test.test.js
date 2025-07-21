import process from 'node:process';
import postcss from 'postcss';
import { postcssIfFunction } from 'postcss-if-function';
import { describe, expect, it } from 'vitest';

describe(`postcss-if-function compatibility (PostCSS ${process.env.POSTCSS_VERSION || 'unknown'})`, () => {
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

	// Core functionality tests
	it('should transform basic media() functions', async () => {
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

	it('should transform basic supports() functions', async () => {
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

	it('should handle mixed conditions', async () => {
		const input = `
.mixed {
  color: if(media(max-width: 768px): blue; else: red);
  display: if(supports(display: grid): grid; else: block);
}`;

		const expected = `.mixed { color: red; }
@media (max-width: 768px) {
  .mixed { color: blue; }
}
.mixed { display: block; }
@supports (display: grid) {
  .mixed { display: grid; }
}`;

		await run(input, expected);
	});

	it('should preserve CSS without if() functions', async () => {
		const input = `
.normal {
  color: blue;
  margin: 10px;
}`;

		const expected = `
.normal {
  color: blue;
  margin: 10px;
}`;

		await run(input, expected);
	});

	it('should handle comments correctly', async () => {
		const input = `
/* Header styles */
.header {
  color: if(media(max-width: 768px): blue; else: red);
}`;

		const expected = `/* Header styles */
.header { color: red; }
@media (max-width: 768px) {
  .header { color: blue; }
}`;

		await run(input, expected);
	});

	// PostCSS version specific tests
	it('should work with PostCSS basic API', async () => {
		const css =
			'.test { color: if(media(max-width: 768px): blue; else: red); }';
		const result = await postcss([postcssIfFunction()]).process(css, {
			from: undefined
		});

		expect(result.css).toContain('@media (max-width: 768px)');
		expect(result.css).toContain('color: blue');
		expect(result.css).toContain('color: red');
	});

	it('should preserve PostCSS metadata', async () => {
		const css =
			'.test { color: if(media(max-width: 768px): blue; else: red); }';
		const result = await postcss([postcssIfFunction()]).process(css, {
			from: 'test.css',
			to: 'output.css'
		});

		expect(result.opts.from).toBe('test.css');
		expect(result.opts.to).toBe('output.css');
	});
});
