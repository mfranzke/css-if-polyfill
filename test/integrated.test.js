import { beforeEach, describe, expect, test } from 'vitest';
import { buildTimeTransform, init, processCSSText } from '../src/index.js';

describe('Integrated CSS if() Polyfill', () => {
	beforeEach(() => {
		// Initialize with native transformation enabled
		init({
			debug: false,
			autoInit: false,
			useNativeTransform: true
		});
	});

	describe('Build-time transformation', () => {
		test('transforms media queries to native CSS', () => {
			const css = `
				.test {
					color: if(media(min-width: 768px): blue; else: red);
				}
			`;

			const result = buildTimeTransform(css);

			expect(result.nativeCSS).toContain('@media (min-width: 768px)');
			expect(result.nativeCSS).toContain('color: blue');
			expect(result.nativeCSS).toContain('color: red');
			expect(result.hasRuntimeRules).toBe(false);
		});

		test('transforms supports queries to native CSS', () => {
			const css = `
				.test {
					display: if(supports(display: grid): grid; else: block);
				}
			`;

			const result = buildTimeTransform(css);

			expect(result.nativeCSS).toContain('@supports (display: grid)');
			expect(result.nativeCSS).toContain('display: grid');
			expect(result.nativeCSS).toContain('display: block');
			expect(result.hasRuntimeRules).toBe(false);
		});

		test('keeps style() conditions for runtime processing', () => {
			const css = `
				.test {
					color: if(style(--theme): var(--primary); else: blue);
				}
			`;

			const result = buildTimeTransform(css);

			expect(result.hasRuntimeRules).toBe(true);
			expect(result.runtimeCSS).toContain('style(--theme)');
		});

		test('handles mixed conditions', () => {
			const css = `
				.test {
					color: if(media(min-width: 768px): blue; else: red);
					background: if(style(--dark-mode): black; else: white);
				}
			`;

			const result = buildTimeTransform(css);

			expect(result.nativeCSS).toContain('@media (min-width: 768px)');
			expect(result.hasRuntimeRules).toBe(true);
			expect(result.runtimeCSS).toContain('style(--dark-mode)');
		});

		test('minifies output when requested', () => {
			const css = `
				.test {
					color: if(media(min-width: 768px): blue; else: red);
				}
			`;

			const result = buildTimeTransform(css, { minify: true });

			// Minified CSS should have reduced whitespace
			expect(result.nativeCSS).not.toContain('\n  ');
			expect(result.nativeCSS.length).toBeLessThan(css.length);
		});

		test('reports transformation statistics', () => {
			const css = `
				.test {
					color: if(media(min-width: 768px): blue; else: red);
					font-size: 16px;
				}
				.other {
					background: if(supports(display: grid): transparent; else: white);
				}
			`;

			const result = buildTimeTransform(css);

			expect(result.stats).toBeDefined();
			expect(result.stats.totalRules).toBeGreaterThan(0);
			expect(result.stats.transformedRules).toBeGreaterThan(0);
		});
	});

	describe('Runtime processing integration', () => {
		test('processes CSS text with native transformation enabled', () => {
			const css = `
				.test {
					color: if(style(--theme): var(--primary); else: blue);
				}
			`;

			// This should work with the integrated approach
			const result = processCSSText(css, { useNativeTransform: true });

			// For style() conditions, should still process with polyfill
			expect(result).toBeDefined();
			expect(typeof result).toBe('string');
		});

		test('falls back to polyfill when native transformation fails', () => {
			const css = `
				.test {
					color: if(invalid-condition: blue; else: red);
				}
			`;

			// Should handle malformed if() gracefully
			const result = processCSSText(css, { useNativeTransform: true });

			expect(result).toBeDefined();
			expect(typeof result).toBe('string');
		});
	});

	describe('Complex scenarios', () => {
		test('handles nested if() functions', () => {
			const css = `
				.test {
					color: if(media(min-width: 768px): if(supports(color: lab(50% 20 -30)): lab(50% 20 -30); else: blue); else: red);
				}
			`;

			const result = buildTimeTransform(css);

			// Should handle nested conditions appropriately
			expect(result.nativeCSS || result.runtimeCSS).toBeDefined();
		});

		test('handles multiple if() in same property', () => {
			const css = `
				.test {
					margin: if(media(min-width: 768px): 20px; else: 10px) if(supports(margin-inline: 0): 0; else: auto);
				}
			`;

			const result = buildTimeTransform(css);

			expect(result.nativeCSS).toContain('@media (min-width: 768px)');
			expect(result.nativeCSS).toContain('@supports (margin-inline: 0)');
		});

		test('preserves non-if() CSS rules', () => {
			const css = `
				.header {
					background: blue;
					font-size: 24px;
				}

				.test {
					color: if(media(min-width: 768px): blue; else: red);
				}

				.footer {
					padding: 20px;
				}
			`;

			const result = buildTimeTransform(css);

			// Should preserve non-if() rules
			expect(result.nativeCSS).toContain('background: blue');
			expect(result.nativeCSS).toContain('font-size: 24px');
			expect(result.nativeCSS).toContain('padding: 20px');
		});
	});

	describe('Error handling', () => {
		test('handles malformed if() functions gracefully', () => {
			const css = `
				.test {
					color: if(media(min-width: 768px): blue);
				}
			`;

			const result = buildTimeTransform(css);

			// Should not throw, should handle gracefully
			expect(result).toBeDefined();
		});

		test('handles invalid condition types', () => {
			const css = `
				.test {
					color: if(unknown(test): blue; else: red);
				}
			`;

			const result = buildTimeTransform(css);

			// Should fall back to runtime processing or leave unchanged
			expect(result).toBeDefined();
		});
	});
});
