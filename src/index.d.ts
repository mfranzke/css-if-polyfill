export type CssIfPolyfillOptions = {
	debug?: boolean;
	autoInit?: boolean;
};

// Named function exports (modern functional API)
export declare function init(options?: CssIfPolyfillOptions): void;
// eslint-disable-next-line @typescript-eslint/naming-convention
export declare function processCSSText(
	cssText: string,
	options?: CssIfPolyfillOptions,
	element?: HTMLElement
): string;
export declare function hasNativeSupport(): boolean;
export declare function refresh(): void;
export declare function cleanupMediaQueryListeners(): void;

// CSSIfPolyfill object type for default export

export type CssIfPolyfillObject = {
	init: typeof init;
	processCSSText: typeof processCSSText;
	hasNativeSupport: typeof hasNativeSupport;
	refresh: typeof refresh;
	cleanup: typeof cleanupMediaQueryListeners;
};

// Default export - object containing all functions for backward compatibility

declare const cssIfPolyfill: CssIfPolyfillObject;
export default cssIfPolyfill;
