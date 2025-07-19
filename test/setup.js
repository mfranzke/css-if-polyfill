// Test setup

/* global document */

import { vi } from 'vitest';

// Mock CSS.supports for testing
globalThis.CSS = {
	supports: vi.fn().mockImplementation((prop, value) => {
		// If testing if() function syntax, return false (no native support)
		if (value && value.includes('if(')) {
			return false;
		}

		// Mock based on common CSS features - return true for supported properties
		if (typeof prop === 'string') {
			// Single argument version: CSS.supports('display: grid')
			const supportedFeatures = [
				'display: grid',
				'display: flex',
				'transform: scale(1)',
				'transform: rotate(0deg)',
				'border-style: dashed',
				'background-image: linear-gradient(45deg, red, blue)',
				'box-shadow: 0 0 0 rgba(0,0,0,0.1)',
				'font-size: clamp(1rem, 5vw, 2rem)',
				'margin-inline: auto',
				'color: red'
			];
			return supportedFeatures.some((feature) =>
				prop.includes(feature.split(':')[0])
			);
		}

		// Two argument version: CSS.supports('display', 'grid')
		const supportedProps = [
			'transform',
			'display',
			'color',
			'background-color',
			'background-image',
			'border-style',
			'box-shadow',
			'font-size',
			'margin-inline'
		];
		return supportedProps.includes(prop);
	})
};

// Mock window.matchMedia - return true for common breakpoints
Object.defineProperty(globalThis, 'matchMedia', {
	writable: true,
	value: vi.fn().mockImplementation((query) => ({
		matches:
			query.includes('width >= 768px') ||
			query.includes('min-width: 1200px') ||
			query === 'prefers-color-scheme: dark',
		media: query,
		onchange: null,
		addListener: vi.fn(),
		removeListener: vi.fn(),
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		dispatchEvent: vi.fn()
	}))
});

// Mock document.styleSheets
Object.defineProperty(document, 'styleSheets', {
	writable: true,
	value: []
});
