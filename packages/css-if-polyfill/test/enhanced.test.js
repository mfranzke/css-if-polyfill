/* global document, describe, test, expect, beforeEach, afterEach */

import { processCSSText } from '../src/index.js';

describe('Enhanced CSS if() Polyfill - Shorthand Properties', () => {
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

	describe('Shorthand Property Support', () => {
		test('should handle if() in border shorthand', () => {
			const cssText =
				'.test { border: 2px if(supports(border-style: dashed): dashed; else: solid) red; }';

			globalThis.CSS.supports.mockReturnValue(true);

			const result = processCSSText(cssText);
			expect(result).toBe('.test { border: 2px dashed red; }');
		});

		test('should handle if() in font shorthand', () => {
			const cssText =
				'.test { font: if(media(width >= 768px): bold; else: normal) if(media(width >= 768px): 18px; else: 14px)/1.5 Arial, sans-serif; }';

			globalThis.matchMedia.mockReturnValue({ matches: true });

			const result = processCSSText(cssText);
			expect(result).toBe(
				'.test { font: bold 18px/1.5 Arial, sans-serif; }'
			);
		});

		test('should handle if() in background shorthand', () => {
			const cssText =
				'.test { background: if(media(prefers-color-scheme: dark): #333; else: #fff) if(supports(background-image: linear-gradient(45deg, red, blue)): linear-gradient(45deg, red, blue); else: none) no-repeat center; }';

			globalThis.matchMedia.mockReturnValue({ matches: false });
			globalThis.CSS.supports.mockReturnValue(true);

			const result = processCSSText(cssText);
			expect(result).toBe(
				'.test { background: #fff linear-gradient(45deg, red, blue) no-repeat center; }'
			);
		});

		test('should handle if() in margin shorthand', () => {
			const cssText =
				'.test { margin: if(media(width >= 768px): 20px; else: 10px) if(supports(margin-inline: auto): auto; else: 0); }';

			globalThis.matchMedia.mockReturnValue({ matches: true });
			globalThis.CSS.supports.mockReturnValue(true);

			const result = processCSSText(cssText);
			expect(result).toBe('.test { margin: 20px auto; }');
		});

		test('should handle if() in box-shadow with multiple shadows', () => {
			const cssText =
				'.test { box-shadow: if(supports(box-shadow: 0 0 0 rgba(0,0,0,0.1)): 0 2px 4px rgba(0,0,0,0.1); else: none), if(media(width >= 768px): 0 8px 16px rgba(0,0,0,0.1); else: none); }';

			globalThis.CSS.supports.mockReturnValue(true);
			globalThis.matchMedia.mockReturnValue({ matches: true });

			const result = processCSSText(cssText);
			expect(result).toBe(
				'.test { box-shadow: 0 2px 4px rgba(0,0,0,0.1), 0 8px 16px rgba(0,0,0,0.1); }'
			);
		});
	});

	describe('Multiple Conditions in Shorthand', () => {
		test('should handle multiple conditions within shorthand if()', () => {
			const cssText =
				'.test { border: if(media(width >= 1200px): 4px; media(width >= 768px): 2px; else: 1px) solid red; }';

			globalThis.matchMedia.mockImplementation((query) => ({
				matches: query.includes('768px') && !query.includes('1200px')
			}));

			const result = processCSSText(cssText);
			expect(result).toBe('.test { border: 2px solid red; }');
		});

		test('should handle complex font shorthand with multiple conditions', () => {
			const cssText =
				'.test { font: if(media(width >= 1200px): bold; media(width >= 768px): 600; else: normal) if(media(width >= 768px): 18px; else: 14px)/1.5 system-ui, sans-serif; }';

			globalThis.matchMedia.mockImplementation((query) => ({
				matches: query.includes('768px')
			}));

			const result = processCSSText(cssText);
			expect(result).toBe(
				'.test { font: 600 18px/1.5 system-ui, sans-serif; }'
			);
		});

		test('should handle transform with multiple operations', () => {
			const cssText =
				'.test { transform: if(supports(transform: scale(1)): scale(1.1); else: none) if(supports(transform: rotate(0deg)): rotate(5deg); else: none); }';

			globalThis.CSS.supports.mockReturnValue(true);

			const result = processCSSText(cssText);
			expect(result).toBe(
				'.test { transform: scale(1.1) rotate(5deg); }'
			);
		});
	});

	describe('Complex Parsing Scenarios', () => {
		test('should handle if() with quoted values containing semicolons', () => {
			const cssText =
				'.test { content: if(media(width >= 768px): "Hello; World"; else: "Hi"); }';

			globalThis.matchMedia.mockReturnValue({ matches: true });

			const result = processCSSText(cssText);
			expect(result).toBe('.test { content: "Hello; World"; }');
		});

		test('should handle if() with nested parentheses', () => {
			const cssText =
				'.test { background: if(supports(background-image: linear-gradient(45deg, red, blue)): linear-gradient(45deg, rgba(255, 0, 0, 0.5), rgba(0, 0, 255, 0.5)); else: red); }';

			globalThis.CSS.supports.mockReturnValue(true);

			const result = processCSSText(cssText);
			expect(result).toBe(
				'.test { background: linear-gradient(45deg, rgba(255, 0, 0, 0.5), rgba(0, 0, 255, 0.5)); }'
			);
		});

		test('should handle empty if() results in shorthand', () => {
			const cssText =
				'.test { margin: if(false: 20px) if(media(width >= 768px): 10px; else: 5px); }';

			globalThis.matchMedia.mockReturnValue({ matches: true });

			const result = processCSSText(cssText);
			expect(result).toBe('.test { margin:  10px; }');
		});
	});

	describe('Error Handling', () => {
		test('should handle malformed if() in shorthand gracefully', () => {
			const cssText =
				'.test { margin: if(invalid-syntax) if(media(width >= 768px): 10px; else: 5px); }';

			globalThis.matchMedia.mockReturnValue({ matches: true });

			const result = processCSSText(cssText);
			expect(result).toBe('.test { margin: if(invalid-syntax) 10px; }');
		});

		test('should handle complex CSS with multiple properties', () => {
			const cssText = `
        .test {
          margin: if(media(width >= 768px): 20px; else: 10px) auto;
          border: if(supports(border-style: dashed): 2px; else: 1px) if(supports(border-style: dashed): dashed; else: solid) red;
          transform: if(supports(transform: scale(1)): scale(1.1); else: none) if(supports(transform: rotate(0deg)): rotate(5deg); else: none);
        }
      `;

			globalThis.matchMedia.mockReturnValue({ matches: true });
			globalThis.CSS.supports.mockReturnValue(true);

			const result = processCSSText(cssText);

			expect(result).toContain('margin: 20px auto');
			expect(result).toContain('border: 2px dashed red');
			expect(result).toContain('transform: scale(1.1) rotate(5deg)');
		});
	});

	describe('Public API with Enhanced Features', () => {
		test('should process shorthand via processCSSText function', () => {
			const result = processCSSText(
				'.test { border: if(style(--true): 2px; else: 1px) if(style(--true): solid; else: dashed) red; }'
			);
			expect(result).toBe('.test { border: 1px dashed red; }');
		});

		test('should handle complex shorthand via processCSSText function', () => {
			const result = processCSSText(
				'.test { font: if(style(--true): bold; else: normal) if(style(--true): 18px; else: 14px)/1.5 Arial; }'
			);
			expect(result).toBe('.test { font: normal 14px/1.5 Arial; }');
		});
	});
});
