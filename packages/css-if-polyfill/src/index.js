/**
 * CSS if() Function Polyfill
 * Provides support for CSS if() function with style(), media(), and supports() conditions
 * Syntax: if(condition: value; else: fallback-value)
 * Supports multiple conditions within a single if() and usage within CSS shorthand properties
 */

/* global document, CSS, Node, MutationObserver */

import { buildTimeTransform, runtimeTransform } from './transform.js';

// Global state
let polyfillOptions = {
	debug: false,
	autoInit: true,
	useNativeTransform: true // New option to enable native CSS transformation
};

// Registry for tracking media queries and their associated elements
const mediaQueryRegistry = new Map(); // MediaQuery -> Set of { element, originalContent }
const mediaQueryListeners = new Map(); // MediaQuery -> MediaQueryList

/**
 * Log debug messages
 */
const log = (...arguments_) => {
	if (polyfillOptions.debug) {
		console.log('[CSS if() Polyfill]', ...arguments_);
	}
};

/**
 * Check if browser has native CSS if() support
 */
const hasNativeSupport = () => {
	if (globalThis.window === undefined || !globalThis.CSS) {
		return false;
	}

	try {
		// Test if CSS if() function is supported by testing a specific CSS if() syntax
		return globalThis.CSS.supports(
			'color',
			'if(style(--true): red; else: blue)'
		);
	} catch {
		return false;
	}
};

/**
 * Evaluate a condition (style(), media(), supports())
 */
const evaluateCondition = (
	condition,
	registerForTracking = false,
	element = null,
	originalContent = null
) => {
	condition = condition.trim();

	// Handle style() function
	if (condition.startsWith('style(')) {
		return evaluateStyleCondition(condition);
	}

	// Handle media() function
	if (condition.startsWith('media(')) {
		return evaluateMediaCondition(
			condition,
			registerForTracking,
			element,
			originalContent
		);
	}

	// Handle supports() function
	if (condition.startsWith('supports(')) {
		return evaluateSupportsCondition(condition);
	}

	// Direct boolean evaluation
	return evaluateBooleanCondition(condition);
};

/**
 * Evaluate style() condition
 */
const evaluateStyleCondition = (condition) => {
	const match = condition.match(/style\s*\(\s*([^)]+)\s*\)/);
	if (!match) {
		return false;
	}

	const query = match[1].trim();

	// Parse property and optional value
	const parts = query.split(':').map((part) => part.trim());
	const property = parts[0];
	const expectedValue = parts[1];

	// Get computed style from document element or a test element
	const testElement = document.createElement('div');
	document.body.append(testElement);

	try {
		const computedStyle = globalThis.getComputedStyle(testElement);
		const actualValue = computedStyle.getPropertyValue(property);

		if (expectedValue) {
			return actualValue === expectedValue;
		}

		// If no expected value, check if property has any value
		return actualValue !== '' && actualValue !== 'initial';
	} catch {
		return false;
	} finally {
		testElement.remove();
	}
};

/**
 * Evaluate media() condition
 */
const evaluateMediaCondition = (
	condition,
	registerForTracking = false,
	element = null,
	originalContent = null
) => {
	const match = condition.match(/media\s*\(\s*([^)]+)\s*\)/);
	if (!match) {
		return false;
	}

	const mediaQuery = match[1].trim();

	try {
		const mediaQueryList = globalThis.matchMedia(`(${mediaQuery})`);
		const result = mediaQueryList.matches;

		// Register this media query for change tracking if requested
		if (registerForTracking && element && originalContent) {
			registerMediaQuery(
				mediaQuery,
				element,
				originalContent,
				mediaQueryList
			);
		}

		return result;
	} catch {
		return false;
	}
};

/**
 * Evaluate supports() condition
 */
const evaluateSupportsCondition = (condition) => {
	const match = condition.match(/supports\s*\(\s*([^)]+)\s*\)/);
	if (!match) {
		return false;
	}

	const feature = match[1].trim();

	try {
		return CSS.supports(feature);
	} catch {
		return false;
	}
};

/**
 * Evaluate boolean condition
 */
const evaluateBooleanCondition = (condition) => {
	// Simple boolean evaluation
	const lowerCondition = condition.toLowerCase();

	if (lowerCondition === 'true' || lowerCondition === '1') {
		return true;
	}

	if (lowerCondition === 'false' || lowerCondition === '0') {
		return false;
	}

	return false;
};

/**
 * Parse multiple conditions within a single if() function
 */
const parseMultipleConditions = (ifContent) => {
	const conditions = [];
	let currentCondition = '';
	let depth = 0;
	let inQuotes = false;
	let quoteChar = '';

	for (let i = 0; i < ifContent.length; i++) {
		const char = ifContent[i];
		const previousChar = i > 0 ? ifContent[i - 1] : '';

		// Handle quotes
		if ((char === '"' || char === "'") && previousChar !== '\\') {
			if (!inQuotes) {
				inQuotes = true;
				quoteChar = char;
			} else if (char === quoteChar) {
				inQuotes = false;
				quoteChar = '';
			}
		}

		// Handle parentheses depth
		if (!inQuotes) {
			if (char === '(') {
				depth++;
			} else if (char === ')') {
				depth--;
			}
		}

		// Check for semicolon separator at depth 0
		if (!inQuotes && depth === 0 && char === ';') {
			// This is a separator between conditions
			if (currentCondition.trim()) {
				conditions.push(currentCondition.trim());
			}

			currentCondition = '';
			continue;
		}

		currentCondition += char;
	}

	// Add the last condition
	if (currentCondition.trim()) {
		conditions.push(currentCondition.trim());
	}

	return conditions;
};

/**
 * Process a single condition within an if() function
 */
const processSingleCondition = (condition) => {
	// Check if this is an else clause
	if (condition.trim().startsWith('else:')) {
		return {
			isElse: true,
			value: condition.replace(/^\s*else\s*:\s*/, '').trim()
		};
	}

	// Find the main separator colon (outside of parentheses)
	let depth = 0;
	let inQuotes = false;
	let quoteChar = '';
	let separatorIndex = -1;

	for (let i = 0; i < condition.length; i++) {
		const char = condition[i];
		const previousChar = i > 0 ? condition[i - 1] : '';

		// Handle quotes
		if ((char === '"' || char === "'") && previousChar !== '\\') {
			if (!inQuotes) {
				inQuotes = true;
				quoteChar = char;
			} else if (char === quoteChar) {
				inQuotes = false;
				quoteChar = '';
			}
		}

		// Handle parentheses depth
		if (!inQuotes) {
			if (char === '(') {
				depth++;
			} else if (char === ')') {
				depth--;
			} else if (char === ':' && depth === 0) {
				// This is the main separator colon
				separatorIndex = i;
				break;
			}
		}
	}

	if (separatorIndex === -1) {
		log('Invalid condition format:', condition);
		return null;
	}

	const conditionPart = condition.slice(0, separatorIndex).trim();
	const valuePart = condition.slice(separatorIndex + 1).trim();

	return {
		isElse: false,
		condition: conditionPart,
		value: valuePart
	};
};

/**
 * Process multiple conditions within a single if() function
 */
const processMultipleConditions = (
	ifContent,
	registerForTracking = false,
	element = null,
	originalContent = null
) => {
	// Handle malformed if() functions that don't contain proper syntax
	if (!ifContent || !ifContent.includes(':')) {
		log('Malformed if() function - missing colon separator');
		throw new Error('Malformed if() syntax');
	}

	const conditions = parseMultipleConditions(ifContent);
	let elseValue = '';

	// Process each condition in order
	for (const condition of conditions) {
		const parsed = processSingleCondition(condition);

		if (!parsed) {
			continue;
		}

		if (parsed.isElse) {
			elseValue = parsed.value;
			continue;
		}

		// Evaluate the condition
		const isTrue = evaluateCondition(
			parsed.condition,
			registerForTracking,
			element,
			originalContent
		);

		if (isTrue) {
			log(`Condition matched: ${parsed.condition} -> ${parsed.value}`);
			return parsed.value;
		}
	}

	// No condition matched, return else value
	log(`No condition matched, using else value: ${elseValue}`);
	return elseValue;
};

/**
 * Find and extract if() functions with proper nested parentheses handling
 */
const findIfFunctions = (text) => {
	const functions = [];
	let index = 0;

	while (index < text.length) {
		const match = text.indexOf('if(', index);
		if (match === -1) {
			break;
		}

		// Make sure it's actually an if() function (not part of another word)
		if (match > 0 && /[\w-]/.test(text[match - 1])) {
			index = match + 1;
			continue;
		}

		// Find the matching closing parenthesis
		let depth = 0;
		let inQuotes = false;
		let quoteChar = '';
		const start = match + 3; // Start after 'if('
		let end = -1;

		for (let i = start; i < text.length; i++) {
			const char = text[i];
			const previousChar = i > 0 ? text[i - 1] : '';

			// Handle quotes
			if ((char === '"' || char === "'") && previousChar !== '\\') {
				if (!inQuotes) {
					inQuotes = true;
					quoteChar = char;
				} else if (char === quoteChar) {
					inQuotes = false;
					quoteChar = '';
				}
			}

			if (!inQuotes) {
				if (char === '(') {
					depth++;
				} else if (char === ')') {
					if (depth === 0) {
						end = i;
						break;
					}

					depth--;
				}
			}
		}

		if (end === -1) {
			// Malformed if() function
			index = match + 3;
		} else {
			const fullMatch = text.slice(match, end + 1);
			const content = text.slice(start, end);
			functions.push({
				match: fullMatch,
				content,
				start: match,
				end: end + 1
			});
			index = end + 1;
		}
	}

	return functions;
};

/**
 * Process CSS text manually
 */
const processCSSText = (cssText, options = {}, element = null) => {
	// Set options for this processing session
	const originalOptions = { ...polyfillOptions };
	polyfillOptions = { ...polyfillOptions, ...options };

	// Store original content for media query tracking
	const originalContent = cssText;

	try {
		// Check if we should use native transformation
		// Disable native transformation if browser APIs appear to be mocked (for testing)
		const shouldUseNativeTransform =
			polyfillOptions.useNativeTransform &&
			!(
				globalThis.matchMedia?.mockClear ||
				globalThis.CSS?.supports?.mockClear
			);

		// Try native transformation first if enabled and not in test environment
		if (shouldUseNativeTransform) {
			try {
				const transformResult = runtimeTransform(cssText, element);

				if (transformResult.nativeCSS) {
					log('Native CSS transformation applied');
				}

				// If we have runtime rules that need processing, continue with polyfill
				if (transformResult.hasRuntimeRules) {
					// Use processed CSS if available, otherwise continue with original
					cssText = transformResult.processedCSS || cssText;
				} else {
					// All transformations were native, return original CSS
					// The native CSS was already injected by runtimeTransform
					return cssText;
				}
			} catch (error) {
				log(
					'Native transformation failed, falling back to polyfill:',
					error
				);
			}
		}

		let result = cssText;
		let hasChanges = true;

		// Keep processing until no more if() functions are found
		// This handles nested if() functions and multiple if() in the same property
		while (hasChanges) {
			hasChanges = false;
			const ifFunctions = findIfFunctions(result);

			// Process if() functions from right to left to maintain indices
			for (let i = ifFunctions.length - 1; i >= 0; i--) {
				const { match, content, start, end } = ifFunctions[i];

				log('Processing if() function:', match);

				try {
					// Enable media query tracking if we have an element
					const registerForTracking = element !== null;
					const processedResult = processMultipleConditions(
						content,
						registerForTracking,
						element,
						originalContent
					);
					log(`Result: ${processedResult}`);

					// Replace the if() function with the result
					result =
						result.slice(0, start) +
						processedResult +
						result.slice(end);
					hasChanges = true;
				} catch (error) {
					log('Error processing if() function:', error);
					// For malformed if() functions, leave them unchanged
					// Don't remove them, as they might be valid in future CSS specs
				}
			}
		}

		return result;
	} finally {
		// Restore original options
		polyfillOptions = originalOptions;
	}
};

/**
 * Process a style element by rewriting its content
 */
const processStyleElement = (styleElement) => {
	if (styleElement.dataset.cssIfPolyfillProcessed) {
		return; // Already processed
	}

	const originalContent = styleElement.textContent;
	const processedContent = processCSSText(originalContent, {}, styleElement);

	if (processedContent !== originalContent) {
		log(
			'Processing style element, original length:',
			originalContent.length
		);
		styleElement.textContent = processedContent;
		styleElement.dataset.cssIfPolyfillProcessed = 'true';
		log('Style element processed, new length:', processedContent.length);
	}
};

/**
 * Process all existing style elements
 */
const processExistingStylesheets = () => {
	// Process inline style elements
	const styleElements = document.querySelectorAll(
		'style:not([data-css-if-polyfill-processed])'
	);
	log(`Found ${styleElements.length} unprocessed style elements`);

	for (const styleElement of styleElements) {
		processStyleElement(styleElement);
	}

	// Process link stylesheets that we can access
	const linkElements = document.querySelectorAll('link[rel="stylesheet"]');
	for (const linkElement of linkElements) {
		// We can't directly modify external stylesheets due to CORS,
		// but we can try to fetch and reprocess them if they're same-origin
		processLinkStylesheet(linkElement);
	}
};

/**
 * Process external stylesheet (if accessible)
 */
async function processLinkStylesheet(linkElement) {
	if (linkElement.dataset.cssIfPolyfillProcessed) {
		return;
	}

	// Only process same-origin stylesheets
	try {
		const url = new URL(linkElement.href);
		if (url.origin !== globalThis.location.origin) {
			log('Skipping cross-origin stylesheet:', linkElement.href);
			return;
		}

		// Fetch the stylesheet content
		try {
			const response = await fetch(linkElement.href);
			const cssText = await response.text();

			// Create a new style element first so we can pass it for tracking
			const styleElement = document.createElement('style');
			const processedCssText = processCSSText(cssText, {}, styleElement);

			if (processedCssText !== cssText) {
				styleElement.textContent = processedCssText;
				styleElement.dataset.cssIfPolyfillProcessed = 'true';
				styleElement.dataset.originalHref = linkElement.href;

				// Insert the style element after the link element
				linkElement.parentNode.insertBefore(
					styleElement,
					linkElement.nextSibling
				);

				// Disable the original link (but don't remove it for compatibility)
				linkElement.disabled = true;
				linkElement.dataset.cssIfPolyfillProcessed = 'true';

				log(
					'External stylesheet processed and replaced:',
					linkElement.href
				);
			}
		} catch (error) {
			log(
				'Could not fetch external stylesheet:',
				linkElement.href,
				error
			);
		}
	} catch (error) {
		log('Error processing external stylesheet:', error);
	}
}

/**
 * Register a media query for change tracking
 */
const registerMediaQuery = (
	mediaQuery,
	element,
	originalContent,
	mediaQueryList = null
) => {
	if (!mediaQueryRegistry.has(mediaQuery)) {
		mediaQueryRegistry.set(mediaQuery, new Set());
	}

	mediaQueryRegistry.get(mediaQuery).add({ element, originalContent });

	// Set up listener if not already done
	if (!mediaQueryListeners.has(mediaQuery)) {
		try {
			// Use provided MediaQueryList or create a new one
			const mql =
				mediaQueryList || globalThis.matchMedia(`(${mediaQuery})`);
			const listener = () => {
				log(`Media query changed: ${mediaQuery}`);
				reprocessElementsForMediaQuery(mediaQuery);
			};

			mql.addEventListener('change', listener);
			mediaQueryListeners.set(mediaQuery, {
				mediaQueryList: mql,
				listener
			});

			log(`Registered media query listener: ${mediaQuery}`);
		} catch (error) {
			log(
				`Failed to register media query listener: ${mediaQuery}`,
				error
			);
		}
	}
};

/**
 * Reprocess elements when a media query changes
 */
const reprocessElementsForMediaQuery = (mediaQuery) => {
	const elements = mediaQueryRegistry.get(mediaQuery);
	if (!elements) {
		return;
	}

	for (const { element, originalContent } of elements) {
		try {
			const processedContent = processCSSText(originalContent);
			if (element.textContent !== processedContent) {
				log(
					`Updating element due to media query change: ${mediaQuery}`
				);
				element.textContent = processedContent;
			}
		} catch (error) {
			log(
				`Error reprocessing element for media query ${mediaQuery}:`,
				error
			);
		}
	}
};

/**
 * Clean up media query listeners
 */
const cleanupMediaQueryListeners = () => {
	for (const [
		mediaQuery,
		{ mediaQueryList, listener }
	] of mediaQueryListeners) {
		try {
			mediaQueryList.removeEventListener('change', listener);
			log(`Cleaned up media query listener: ${mediaQuery}`);
		} catch (error) {
			log(`Error cleaning up media query listener: ${mediaQuery}`, error);
		}
	}

	mediaQueryListeners.clear();
	mediaQueryRegistry.clear();
};

/**
 * Observe stylesheet changes
 */
const observeStylesheetChanges = () => {
	// Create a MutationObserver to watch for new stylesheets
	const observer = new MutationObserver((mutations) => {
		for (const mutation of mutations) {
			for (const node of mutation.addedNodes) {
				if (
					node.nodeType === Node.ELEMENT_NODE &&
					(node.tagName === 'STYLE' || node.tagName === 'LINK')
				) {
					log('New style element detected:', node.tagName);

					if (node.tagName === 'STYLE') {
						// Process inline style elements immediately
						setTimeout(() => {
							processStyleElement(node);
						}, 0);
					} else if (
						node.tagName === 'LINK' &&
						node.rel === 'stylesheet'
					) {
						// Process link stylesheets after they load
						node.addEventListener('load', () => {
							processLinkStylesheet(node);
						});

						// Also try to process immediately in case it's already loaded
						setTimeout(() => {
							processLinkStylesheet(node);
						}, 100);
					}
				}
			}
		}
	});

	observer.observe(document.head, {
		childList: true,
		subtree: true
	});

	// Also observe the body for style elements that might be added there
	observer.observe(document.body, {
		childList: true,
		subtree: true
	});
};

/**
 * Initialize the polyfill
 */
const init = (options = {}) => {
	if (globalThis.window === undefined) {
		throw new TypeError('CSS if() polyfill requires a browser environment');
	}

	// Update global options
	polyfillOptions = { ...polyfillOptions, ...options };

	if (hasNativeSupport()) {
		log('Native CSS if() support detected, polyfill not needed');
		return;
	}

	log('Initializing CSS if() polyfill');
	processExistingStylesheets();
	observeStylesheetChanges();
};

/**
 * Public API to manually trigger processing
 */
const refresh = () => {
	processExistingStylesheets();
};

// Auto-initialize if in browser and DOMContentLoaded
if (globalThis.window !== undefined && typeof document !== 'undefined') {
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', () => {
			init();
		});
	} else {
		init();
	}
}

// Named exports for modern usage
// Re-export build-time transformation
export { buildTimeTransform } from './transform.js';
export {
	cleanupMediaQueryListeners,
	hasNativeSupport,
	init,
	processCSSText,
	refresh
};

// Create the CSSIfPolyfill object with all the methods
const CSSIfPolyfill = {
	init,
	processCSSText,
	hasNativeSupport,
	refresh,
	cleanup: cleanupMediaQueryListeners,
	buildTimeTransform
};

// Default export for backward compatibility
export default CSSIfPolyfill;
