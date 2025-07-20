import { describe, expect, test } from 'vitest';
import {
	extractIfFunctions,
	parseIfFunction,
	transformPropertyToNative,
	transformToNativeCSS
} from '../src/transform.js';

describe('CSS Transform Engine - Detailed Testing', () => {
	describe('if() Function Extraction', () => {
		test('extracts simple if() functions correctly', () => {
			const testCases = [
				'if(media(min-width: 768px): blue; else: red)',
				'if(supports(display: grid): transparent; else: white)',
				'if(style(--large): 24px; else: 16px)'
			];

			for (const testCase of testCases) {
				const extracted = extractIfFunctions(testCase);
				expect(extracted).toHaveLength(1);
				expect(extracted[0].fullFunction).toBe(testCase);
				expect(extracted[0].content).toBe(testCase.slice(3, -1)); // Remove 'if(' and ')'
			}
		});

		test('extracts multiple if() functions from complex values', () => {
			const complexValue =
				'if(media(min-width: 768px): blue; else: red) if(supports(grid): 1fr; else: auto)';
			const extracted = extractIfFunctions(complexValue);

			expect(extracted).toHaveLength(2);
			expect(extracted[0].fullFunction).toBe(
				'if(media(min-width: 768px): blue; else: red)'
			);
			expect(extracted[1].fullFunction).toBe(
				'if(supports(grid): 1fr; else: auto)'
			);
		});

		test('handles nested parentheses correctly', () => {
			const nestedValue =
				'if(supports(color: lab(50% 20 -30)): lab(50% 20 -30); else: blue)';
			const extracted = extractIfFunctions(nestedValue);

			expect(extracted).toHaveLength(1);
			expect(extracted[0].content).toBe(
				'supports(color: lab(50% 20 -30)): lab(50% 20 -30); else: blue'
			);
		});
	});

	describe('if() Function Parsing', () => {
		test('parses media() conditions correctly', () => {
			const content = 'media(min-width: 768px): blue; else: red';
			const parsed = parseIfFunction(content);

			expect(parsed).toEqual({
				conditions: [
					{
						conditionType: 'media',
						conditionExpression: 'min-width: 768px',
						value: 'blue'
					}
				],
				elseValue: 'red',
				isMultipleConditions: false
			});
		});

		test('parses supports() conditions correctly', () => {
			const content = 'supports(display: grid): transparent; else: white';
			const parsed = parseIfFunction(content);

			expect(parsed).toEqual({
				conditions: [
					{
						conditionType: 'supports',
						conditionExpression: 'display: grid',
						value: 'transparent'
					}
				],
				elseValue: 'white',
				isMultipleConditions: false
			});
		});

		test('parses style() conditions correctly', () => {
			const content = 'style(--large): 24px; else: 16px';
			const parsed = parseIfFunction(content);

			expect(parsed).toEqual({
				conditions: [
					{
						conditionType: 'style',
						conditionExpression: '--large',
						value: '24px'
					}
				],
				elseValue: '16px',
				isMultipleConditions: false
			});
		});

		test('handles complex values with spaces and punctuation', () => {
			const content =
				'media(min-width: 768px): linear-gradient(to right, blue, navy); else: solid red';
			const parsed = parseIfFunction(content);

			expect(parsed.conditions[0].value).toBe(
				'linear-gradient(to right, blue, navy)'
			);
			expect(parsed.elseValue).toBe('solid red');
		});

		test('throws error for malformed if() functions', () => {
			expect(() =>
				parseIfFunction('media(min-width: 768px): blue')
			).toThrow('missing else clause');
			expect(() =>
				parseIfFunction('invalid-condition: blue; else: red')
			).toThrow('unknown condition type');
			expect(() => parseIfFunction('blue; else: red')).toThrow(
				'missing colon'
			);
		});
	});

	describe('Property Transformation', () => {
		test('transforms media() conditions to native CSS', () => {
			const result = transformPropertyToNative(
				'.test',
				'color',
				'if(media(min-width: 768px): blue; else: red)'
			);

			expect(result.nativeCSS).toContain('@media (min-width: 768px)');
			expect(result.nativeCSS).toContain('color: blue');
			expect(result.nativeCSS).toContain('color: red');
			expect(result.hasRuntimeRules).toBe(false);
		});

		test('transforms supports() conditions to native CSS', () => {
			const result = transformPropertyToNative(
				'.test',
				'display',
				'if(supports(display: grid): grid; else: block)'
			);

			expect(result.nativeCSS).toContain('@supports (display: grid)');
			expect(result.nativeCSS).toContain('display: grid');
			expect(result.nativeCSS).toContain('display: block');
			expect(result.hasRuntimeRules).toBe(false);
		});

		test('routes style() conditions to runtime processing', () => {
			const result = transformPropertyToNative(
				'.test',
				'font-size',
				'if(style(--large): 24px; else: 16px)'
			);

			expect(result.hasRuntimeRules).toBe(true);
			expect(result.runtimeCSS).toContain(
				'font-size: if(style(--large): 24px; else: 16px)'
			);
			expect(result.nativeCSS).toBe('');
		});

		test('handles properties without if() functions', () => {
			const result = transformPropertyToNative('.test', 'margin', '20px');

			expect(result.nativeCSS).toBe('.test { margin: 20px; }');
			expect(result.hasRuntimeRules).toBe(false);
		});
	});

	describe('Full CSS Transformation', () => {
		test('transforms complete CSS with mixed conditions', () => {
			const css = `
        .card {
          background: if(media(min-width: 768px): blue; else: gray);
          display: if(supports(display: grid): grid; else: block);
          font-size: if(style(--large): 24px; else: 16px);
        }

        .button {
          padding: 10px;
          margin: if(media(max-width: 480px): 5px; else: 10px);
        }
      `;

			const result = transformToNativeCSS(css);

			// Should contain native media and supports queries
			expect(result.nativeCSS).toContain('@media (min-width: 768px)');
			expect(result.nativeCSS).toContain('@supports (display: grid)');
			expect(result.nativeCSS).toContain('@media (max-width: 480px)');

			// Should preserve non-if() properties
			expect(result.nativeCSS).toContain('padding: 10px');

			// Should route style() to runtime
			expect(result.hasRuntimeRules).toBe(true);
			expect(result.runtimeCSS).toContain('style(--large)');

			// Should have statistics
			expect(result.stats.totalRules).toBeGreaterThan(0);
			expect(result.stats.transformedRules).toBeGreaterThan(0);
		});

		test('handles CSS with no if() functions', () => {
			const css = `
        .normal {
          color: blue;
          background: white;
        }
      `;

			const result = transformToNativeCSS(css);

			expect(result.nativeCSS).toContain('color: blue');
			expect(result.nativeCSS).toContain('background: white');
			expect(result.hasRuntimeRules).toBe(false);
			expect(result.runtimeCSS).toBe('');
		});

		test('gracefully handles malformed CSS', () => {
			const css = `
        .broken {
          color: if(invalid: blue;
        }
      `;

			// Should not throw, should handle gracefully
			expect(() => transformToNativeCSS(css)).not.toThrow();
		});
	});

	describe('Edge Cases and Error Handling', () => {
		test('handles empty CSS input', () => {
			const result = transformToNativeCSS('');
			expect(result.nativeCSS).toBe('');
			expect(result.runtimeCSS).toBe('');
			expect(result.hasRuntimeRules).toBe(false);
		});

		test('handles CSS with only comments', () => {
			const css = `
        /* This is a comment */
        /* Another comment */
      `;

			const result = transformToNativeCSS(css);
			expect(result.nativeCSS).toContain('/* This is a comment */');
		});

		test('preserves CSS structure and formatting', () => {
			const css = `
        @import url('fonts.css');

        .test {
          color: if(media(min-width: 768px): blue; else: red);
        }

        @keyframes slide {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `;

			const result = transformToNativeCSS(css);
			expect(result.nativeCSS).toContain('@import');
			expect(result.nativeCSS).toContain('@keyframes');
		});
	});
});
