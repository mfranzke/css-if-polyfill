/**
 * PostCSS plugin options
 */
export type PluginOptions = {
	/**
	 * - Whether to preserve original CSS alongside transformations
	 */
	preserveOriginal?: boolean | undefined;
	/**
	 * - Whether to log transformation statistics
	 */
	logTransformations?: boolean | undefined;
	/**
	 * - Array of selectors to skip transformation for
	 */
	skipSelectors?: string[] | undefined;
};
/**
 * PostCSS plugin options
 * @typedef {Object} PluginOptions
 * @property {boolean} [preserveOriginal=false] - Whether to preserve original CSS alongside transformations
 * @property {boolean} [logTransformations=false] - Whether to log transformation statistics
 * @property {string[]} [skipSelectors=[]] - Array of selectors to skip transformation for
 */
/**
 * Creates the PostCSS CSS if() plugin
 * @param {PluginOptions} [options={}] - Plugin configuration options
 * @returns {Object} PostCSS plugin
 */
export function postcssIfFunction(
	options?: PluginOptions
): Record<string, unknown>;
export namespace postcssIfFunction {
	const postcss: boolean;
}
