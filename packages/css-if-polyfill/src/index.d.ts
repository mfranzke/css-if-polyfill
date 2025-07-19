export { buildTimeTransform } from './transform.js';

/**
 * Initialize the polyfill
 */
export function init(options?: Record<string, unknown>): void;

/**
 * Process CSS text manually
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export function processCSSText(
	cssText: any,
	options?: Record<string, unknown>,
	element?: undefined
): any;

/**
 * Check if browser has native CSS if() support
 */
export function hasNativeSupport(): boolean;

/**
 * Public API to manually trigger processing
 */
export function refresh(): void;

/**
 * Clean up media query listeners
 */
export function cleanupMediaQueryListeners(): void;
