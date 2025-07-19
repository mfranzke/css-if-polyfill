/* global document, describe, test, expect, beforeEach, afterEach */

import { vi } from 'vitest';
import { processCSSText } from '../src/index.js';

describe('CSS if() Polyfill - Multiple Conditions', () => {
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

	describe('Multiple Conditions within Single if()', () => {
		test('should handle multiple style conditions with first match', () => {
			// Mock getComputedStyle to return specific values
			const mockComputedStyle = {
				getPropertyValue: vi.fn().mockImplementation((prop) => {
					if (prop === '--scheme') {
						return 'ice';
					}

					return '';
				})
			};

			vi.spyOn(globalThis, 'getComputedStyle').mockReturnValue(
				mockComputedStyle
			);

			const cssText = `.test {
        background: if(
          style(--scheme: ice): linear-gradient(#caf0f8, white);
          style(--scheme: fire): linear-gradient(#ffc971, white);
          else: gray;
        );
      }`;

			const result = processCSSText(cssText);
			expect(result).toContain('linear-gradient(#caf0f8, white)');

			globalThis.getComputedStyle.mockRestore();
		});

		test('should handle multiple style conditions with second match', () => {
			const mockComputedStyle = {
				getPropertyValue: vi.fn().mockImplementation((prop) => {
					if (prop === '--scheme') {
						return 'fire';
					}

					return '';
				})
			};

			vi.spyOn(globalThis, 'getComputedStyle').mockReturnValue(
				mockComputedStyle
			);

			const cssText = `.test {
        background: if(
          style(--scheme: ice): linear-gradient(#caf0f8, white);
          style(--scheme: fire): linear-gradient(#ffc971, white);
          else: gray;
        );
      }`;

			const result = processCSSText(cssText);
			expect(result).toContain('linear-gradient(#ffc971, white)');

			globalThis.getComputedStyle.mockRestore();
		});

		test('should fall back to else clause when no conditions match', () => {
			const mockComputedStyle = {
				getPropertyValue: vi.fn().mockReturnValue('')
			};

			vi.spyOn(globalThis, 'getComputedStyle').mockReturnValue(
				mockComputedStyle
			);

			const cssText = `.test {
        background: if(
          style(--scheme: ice): linear-gradient(#caf0f8, white);
          style(--scheme: fire): linear-gradient(#ffc971, white);
          else: gray;
        );
      }`;

			const result = processCSSText(cssText);
			expect(result).toContain('gray');

			globalThis.getComputedStyle.mockRestore();
		});

		test('should handle multiple media conditions', () => {
			globalThis.matchMedia.mockImplementation((query) => ({
				matches: query.includes('1200px')
					? false
					: Boolean(query.includes('768px'))
			}));

			const cssText = `.test {
        padding: if(
          media(width >= 1200px): 40px;
          media(width >= 768px): 30px;
          media(width >= 480px): 20px;
          else: 15px;
        );
      }`;

			const result = processCSSText(cssText);
			expect(result).toContain('30px');
		});

		test('should handle multiple supports conditions', () => {
			globalThis.CSS.supports.mockImplementation((feature) =>
				feature.includes('grid')
					? false
					: Boolean(feature.includes('flex'))
			);

			const cssText = `.test {
        display: if(
          supports(display: subgrid): subgrid;
          supports(display: grid): grid;
          supports(display: flex): flex;
          else: block;
        );
      }`;

			const result = processCSSText(cssText);
			expect(result).toContain('flex');
		});

		test('should handle mixed condition types', () => {
			const mockComputedStyle = {
				getPropertyValue: vi.fn().mockReturnValue('')
			};

			vi.spyOn(globalThis, 'getComputedStyle').mockReturnValue(
				mockComputedStyle
			);
			globalThis.matchMedia.mockReturnValue({ matches: true });
			globalThis.CSS.supports.mockReturnValue(false);

			const cssText = `.test {
        color: if(
          style(--theme: dark): white;
          media(width >= 768px): blue;
          supports(color: red): red;
          else: black;
        );
      }`;

			const result = processCSSText(cssText);
			expect(result).toContain('blue');

			globalThis.getComputedStyle.mockRestore();
		});
	});

	describe('Complex Parsing Scenarios', () => {
		test('should handle conditions with quoted values containing semicolons', () => {
			const mockComputedStyle = {
				getPropertyValue: vi.fn().mockImplementation((prop) => {
					if (prop === '--content') {
						return 'hello; world';
					}

					return '';
				})
			};

			vi.spyOn(globalThis, 'getComputedStyle').mockReturnValue(
				mockComputedStyle
			);

			const cssText = `.test {
        content: if(
          style(--content: "hello; world"): "matched";
          style(--content: "other"): "other";
          else: "default";
        );
      }`;

			const result = processCSSText(cssText);
			expect(result).toContain('"default"');

			globalThis.getComputedStyle.mockRestore();
		});

		test('should handle nested parentheses in values', () => {
			globalThis.CSS.supports.mockReturnValue(true);

			const cssText = `.test {
        background: if(
          supports(background-image: linear-gradient(45deg, red, blue)): linear-gradient(45deg, rgba(255, 0, 0, 0.5), rgba(0, 0, 255, 0.5));
          supports(background-color: red): red;
          else: transparent;
        );
      }`;

			const result = processCSSText(cssText);
			expect(result).toContain(
				'linear-gradient(45deg, rgba(255, 0, 0, 0.5), rgba(0, 0, 255, 0.5))'
			);
		});

		test('should handle conditions without else clause', () => {
			const mockComputedStyle = {
				getPropertyValue: vi.fn().mockReturnValue('')
			};

			vi.spyOn(globalThis, 'getComputedStyle').mockReturnValue(
				mockComputedStyle
			);

			const cssText = `.test {
        color: if(
          style(--theme: dark): white;
          style(--theme: light): black;
        );
      }`;

			const result = processCSSText(cssText);
			expect(result).toContain('color: ;');

			globalThis.getComputedStyle.mockRestore();
		});
	});

	describe('Shorthand Property Integration', () => {
		test('should work with multiple if() functions in shorthand', () => {
			const mockComputedStyle = {
				getPropertyValue: vi.fn().mockImplementation((prop) => {
					if (prop === '--scheme') {
						return 'ice';
					}

					return '';
				})
			};

			vi.spyOn(globalThis, 'getComputedStyle').mockReturnValue(
				mockComputedStyle
			);
			globalThis.CSS.supports.mockReturnValue(true);

			const cssText = `.test {
        border: if(
          style(--scheme: ice): 3px;
          style(--scheme: fire): 5px;
          else: 1px;
        ) if(
          supports(border-style: dashed): dashed;
          else: solid;
        ) red;
      }`;

			const result = processCSSText(cssText);
			expect(result).toContain('3px dashed red');

			globalThis.getComputedStyle.mockRestore();
		});

		test('should handle complex font shorthand with multiple conditions', () => {
			globalThis.matchMedia.mockReturnValue({ matches: true });
			globalThis.CSS.supports.mockReturnValue(true);

			const cssText = `.test {
        font: if(
          media(width >= 1200px): bold;
          media(width >= 768px): 600;
          else: normal;
        ) if(
          supports(font-size: clamp(1rem, 5vw, 2rem)): clamp(1rem, 5vw, 2rem);
          media(width >= 768px): 18px;
          else: 14px;
        )/1.5 system-ui, sans-serif;
      }`;

			const result = processCSSText(cssText);
			expect(result).toContain(
				'bold clamp(1rem, 5vw, 2rem)/1.5 system-ui, sans-serif'
			);
		});
	});

	describe('Error Handling and Edge Cases', () => {
		test('should handle malformed conditions gracefully', () => {
			const cssText = `.test {
        color: if(
          invalid-condition-format;
          style(--theme: dark): white;
          else: black;
        );
      }`;

			const mockComputedStyle = {
				getPropertyValue: vi.fn().mockImplementation((prop) => {
					if (prop === '--theme') {
						return 'dark';
					}

					return '';
				})
			};

			vi.spyOn(globalThis, 'getComputedStyle').mockReturnValue(
				mockComputedStyle
			);

			const result = processCSSText(cssText);
			expect(result).toContain('white');

			globalThis.getComputedStyle.mockRestore();
		});

		test('should handle empty conditions', () => {
			const cssText = `.test {
        color: if(
          style(--theme: dark): white;
          ;
          else: black;
        );
      }`;

			const mockComputedStyle = {
				getPropertyValue: vi.fn().mockReturnValue('')
			};

			vi.spyOn(globalThis, 'getComputedStyle').mockReturnValue(
				mockComputedStyle
			);

			const result = processCSSText(cssText);
			expect(result).toContain('black');

			globalThis.getComputedStyle.mockRestore();
		});
	});

	describe('Public API with Multiple Conditions', () => {
		test('should process multiple conditions via processCSSText function', () => {
			const result = processCSSText(`.test {
        color: if(
          true: red;
          false: blue;
          else: green;
        );
      }`);
			expect(result).toContain('red');
		});

		test('should handle complex real-world example', () => {
			const cssText = `
        .card {
          background: if(
            style(--scheme: ice): linear-gradient(135deg, #caf0f8, white, #caf0f8);
            style(--scheme: fire): linear-gradient(135deg, #ffc971, white, #ffc971);
            style(--scheme: earth): linear-gradient(135deg, #8fbc8f, white, #8fbc8f);
            else: linear-gradient(135deg, #e0e0e0, white, #e0e0e0);
          );

          border: if(
            media(width >= 1200px): 3px;
            media(width >= 768px): 2px;
            else: 1px;
          ) solid if(
            style(--scheme: ice): #0ea5e9;
            style(--scheme: fire): #f97316;
            style(--scheme: earth): #65a30d;
            else: #6b7280;
          );
        }
      `;

			const result = processCSSText(cssText);
			expect(result).toContain(
				'linear-gradient(135deg, #e0e0e0, white, #e0e0e0)'
			);
			expect(result).toContain('#6b7280');
		});
	});
});
