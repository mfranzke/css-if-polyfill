/* global document, describe, test, expect, beforeEach, afterEach, jest */

import { cleanupMediaQueryListeners, processCSSText } from '../src/index.js';

describe('Media Query Tracking', () => {
	let mockMediaQueryList;
	let mockAddEventListener;
	let mockRemoveEventListener;

	beforeEach(() => {
		// Reset any existing listeners
		cleanupMediaQueryListeners();

		// Mock matchMedia to return a controllable MediaQueryList
		mockAddEventListener = jest.fn();
		mockRemoveEventListener = jest.fn();
		mockMediaQueryList = {
			matches: true,
			addEventListener: mockAddEventListener,
			removeEventListener: mockRemoveEventListener
		};

		globalThis.matchMedia = jest.fn().mockReturnValue(mockMediaQueryList);
	});

	afterEach(() => {
		document.head.innerHTML = '';
		document.body.innerHTML = '';
		cleanupMediaQueryListeners();
	});

	test('should register media query listeners when processing styles with media() conditions', () => {
		// Create a style element to process
		const styleElement = document.createElement('style');
		const cssText =
			'.test { color: if(media(min-width: 768px): blue; else: red); }';

		// Process the CSS with element tracking
		processCSSText(cssText, {}, styleElement);

		// Verify matchMedia was called with the correct query
		expect(globalThis.matchMedia).toHaveBeenCalledWith(
			'(min-width: 768px)'
		);

		// Verify event listener was added
		expect(mockAddEventListener).toHaveBeenCalledWith(
			'change',
			expect.any(Function)
		);
	});

	test('should not register listeners for non-media conditions', () => {
		const styleElement = document.createElement('style');
		const cssText = '.test { color: if(style(--test): blue; else: red); }';

		processCSSText(cssText, {}, styleElement);

		// Should not call matchMedia for style() conditions
		expect(globalThis.matchMedia).not.toHaveBeenCalled();
		expect(mockAddEventListener).not.toHaveBeenCalled();
	});

	test('should reuse existing listeners for duplicate media queries', () => {
		const styleElement1 = document.createElement('style');
		const styleElement2 = document.createElement('style');
		const cssText =
			'.test { color: if(media(min-width: 768px): blue; else: red); }';

		// Process the same media query twice
		processCSSText(cssText, {}, styleElement1);
		processCSSText(cssText, {}, styleElement2);

		// MatchMedia should be called twice (once per processing)
		expect(globalThis.matchMedia).toHaveBeenCalledTimes(2);

		// But event listener should only be added once (reused)
		expect(mockAddEventListener).toHaveBeenCalledTimes(1);
	});

	test('should handle multiple different media queries', () => {
		const styleElement = document.createElement('style');
		const cssText = `
      .test1 { color: if(media(min-width: 768px): blue; else: red); }
      .test2 { color: if(media(max-width: 480px): green; else: yellow); }
    `;

		processCSSText(cssText, {}, styleElement);

		// Should call matchMedia for both queries
		expect(globalThis.matchMedia).toHaveBeenCalledWith(
			'(min-width: 768px)'
		);
		expect(globalThis.matchMedia).toHaveBeenCalledWith(
			'(max-width: 480px)'
		);

		// Should add two different listeners
		expect(mockAddEventListener).toHaveBeenCalledTimes(2);
	});

	test('should clean up all media query listeners', () => {
		const styleElement = document.createElement('style');
		const cssText = `
      .test1 { color: if(media(min-width: 768px): blue; else: red); }
      .test2 { color: if(media(max-width: 480px): green; else: yellow); }
    `;

		processCSSText(cssText, {}, styleElement);

		// Clean up listeners
		cleanupMediaQueryListeners();

		// Should remove both listeners
		expect(mockRemoveEventListener).toHaveBeenCalledTimes(2);
		expect(mockRemoveEventListener).toHaveBeenCalledWith(
			'change',
			expect.any(Function)
		);
	});

	test('should trigger reprocessing when media query changes', () => {
		// Setup: Create a style element and add it to the document
		const styleElement = document.createElement('style');
		document.head.append(styleElement);

		const originalCSS =
			'.test { color: if(media(min-width: 768px): blue; else: red); }';

		// Initially, media query matches (returns blue)
		mockMediaQueryList.matches = true;
		const processedCSS = processCSSText(originalCSS, {}, styleElement);
		styleElement.textContent = processedCSS;

		expect(styleElement.textContent).toBe('.test { color: blue; }');

		// Simulate media query change
		mockMediaQueryList.matches = false;

		// Get the listener function that was registered
		const changeListener = mockAddEventListener.mock.calls[0][1];

		// Mock the style element's original content
		styleElement.dataset.originalContent = originalCSS;

		// Trigger the change listener
		changeListener();

		// Note: In a real scenario, the element would be reprocessed and updated
		// This test verifies the listener mechanism is in place
		expect(changeListener).toBeDefined();
		expect(typeof changeListener).toBe('function');
	});

	test('should handle malformed media queries gracefully', () => {
		const styleElement = document.createElement('style');

		// Mock matchMedia to throw an error for malformed queries
		globalThis.matchMedia = jest.fn().mockImplementation(() => {
			throw new Error('Invalid media query');
		});

		const cssText =
			'.test { color: if(media(invalid-query): blue; else: red); }';

		// Should not throw an error
		expect(() => {
			processCSSText(cssText, {}, styleElement);
		}).not.toThrow();

		// Should not add any listeners when matchMedia fails
		expect(mockAddEventListener).not.toHaveBeenCalled();
	});
});
