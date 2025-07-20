/* global document, describe, test, expect, beforeEach, afterEach */

import { vi } from 'vitest';
import { hasNativeSupport, init, processCSSText } from '../src/index.js';

describe('CSS if() Polyfill', () => {
	beforeEach(() => {
		// Reset CSS.supports mock
		globalThis.CSS.supports.mockClear();

		// Reset matchMedia mock
		globalThis.matchMedia.mockClear();
	});

	afterEach(() => {
		document.head.innerHTML = '';
		document.body.innerHTML = '';
	});

	describe('Initialization', () => {
		test('should have named function exports', () => {
			expect(typeof init).toBe('function');
			expect(typeof processCSSText).toBe('function');
			expect(typeof hasNativeSupport).toBe('function');
		});

		test('should have named function exports', () => {
			expect(typeof init).toBe('function');
			expect(typeof processCSSText).toBe('function');
			expect(typeof hasNativeSupport).toBe('function');
		});
	});

	describe('Native Support Detection', () => {
		test('should detect lack of native support', () => {
			expect(hasNativeSupport()).toBe(false);
		});

		test('should use exported function', () => {
			expect(hasNativeSupport()).toBe(false);
		});
	});

	describe('Condition Evaluation', () => {
		test('should evaluate boolean conditions through processCSSText', () => {
			let result = processCSSText(
				'.test { color: if(style(--true): red; else: blue); }'
			);
			expect(result).toBe('.test { color: blue; }');

			result = processCSSText(
				'.test { color: if(false: red; else: blue); }'
			);
			expect(result).toBe('.test { color: blue; }');
		});

		test('should evaluate media conditions through processCSSText', () => {
			// Mock a matching media query
			globalThis.matchMedia.mockReturnValue({ matches: true });

			const result = processCSSText(
				'.test { color: if(media(width >= 768px): red; else: blue); }'
			);
			expect(result).toBe('.test { color: red; }');
			expect(globalThis.matchMedia).toHaveBeenCalledWith(
				'(width >= 768px)'
			);
		});

		test('should evaluate supports conditions through processCSSText', () => {
			// Mock CSS.supports to return true
			globalThis.CSS.supports.mockReturnValue(true);

			const result = processCSSText(
				'.test { color: if(supports(display: grid): red; else: blue); }'
			);
			expect(result).toBe('.test { color: red; }');
			expect(globalThis.CSS.supports).toHaveBeenCalledWith(
				'display: grid'
			);
		});

		test('should evaluate style conditions through processCSSText', () => {
			// Create a test element
			const testElement = document.createElement('div');
			testElement.style.color = 'red';
			document.body.append(testElement);

			// Mock getComputedStyle
			const mockComputedStyle = {
				getPropertyValue: vi.fn().mockReturnValue('red')
			};

			vi.spyOn(globalThis, 'getComputedStyle').mockReturnValue(
				mockComputedStyle
			);

			const result = processCSSText(
				'.test { color: if(style(color: red): green; else: blue); }'
			);
			expect(result).toBe('.test { color: green; }');

			// Cleanup
			testElement.remove();
			globalThis.getComputedStyle.mockRestore();
		});
	});

	describe('CSS Text Processing', () => {
		test('should process simple if() function with new syntax', () => {
			const cssText =
				'.test { color: if(style(--true): red; else: blue); }';
			const result = processCSSText(cssText);

			expect(result).toBe('.test { color: blue; }');
		});

		test('should process if() without else clause', () => {
			const cssText = '.test { color: if(style(--true): red); }';
			const result = processCSSText(cssText);

			expect(result).toBe('.test { color: ; }');
		});

		test('should process if() with media condition', () => {
			// Mock media query to match
			globalThis.matchMedia.mockReturnValue({ matches: true });

			const cssText =
				'.test { display: if(media(width >= 768px): block; else: none); }';
			const result = processCSSText(cssText);

			expect(result).toBe('.test { display: block; }');
		});

		test('should process if() with supports condition', () => {
			globalThis.CSS.supports.mockReturnValue(true);

			const cssText =
				'.test { display: if(supports(display: grid): grid; else: block); }';
			const result = processCSSText(cssText);

			expect(result).toBe('.test { display: grid; }');
		});

		test('should process multiple if() functions', () => {
			const cssText =
				'.test { color: if(style(--true): red; else: blue); background: if(style(--false): white; else: black); }';
			const result = processCSSText(cssText);

			expect(result).toBe('.test { color: blue; background: black; }');
		});

		test('should handle false condition with no else clause', () => {
			const cssText = '.test { color: if(false: red); }';
			const result = processCSSText(cssText);

			expect(result).toBe('.test { color: ; }');
		});
	});

	describe('Public API', () => {
		test('should export init function', () => {
			expect(typeof init).toBe('function');
		});

		test('should export processCSSText function', () => {
			const result = processCSSText(
				'.test { color: if(style(--true): red; else: blue); }'
			);
			expect(result).toBe('.test { color: blue; }');
		});

		test('should handle processCSSText with options', () => {
			const result = processCSSText(
				'.test { color: if(style(--true): red; else: blue); }',
				{ debug: true }
			);
			expect(result).toBe('.test { color: blue; }');
		});
	});

	describe('Error Handling', () => {
		test('should handle invalid conditions gracefully', () => {
			const cssText =
				'.test { color: if(invalid-condition: red; else: blue); }';
			const result = processCSSText(cssText);

			expect(result).toBe('.test { color: blue; }');
		});

		test('should handle malformed if() functions', () => {
			const cssText = '.test { color: if(true, red); }'; // Old syntax should remain unchanged
			const result = processCSSText(cssText);

			expect(result).toBe('.test { color: if(true, red); }'); // Should remain unchanged
		});

		test('should handle CSS.supports errors', () => {
			globalThis.CSS.supports.mockImplementation(() => {
				throw new Error('CSS.supports error');
			});

			const result = processCSSText(
				'.test { color: if(supports(invalid-property): red; else: blue); }'
			);
			expect(result).toBe('.test { color: blue; }');
		});
	});
});
