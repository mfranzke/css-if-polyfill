/**
 * PostCSS plugin for transforming CSS if() functions to native CSS
 *
 * This plugin transforms CSS if() functions into native @media and @supports rules
 * using the css-if-polyfill transformation engine.
 *
 * @example
 * // Input CSS:
 * .example {
 *   color: if(media(max-width: 768px): blue; else: red);
 *   font-size: if(supports(display: grid): 1.2rem; else: 1rem);
 * }
 *
 * // Output CSS:
 * .example {
 *   color: red;
 * }
 *
 * @media (max-width: 768px) {
 *   .example {
 *     color: blue;
 *   }
 * }
 *
 * @supports (display: grid) {
 *   .example {
 *     font-size: 1.2rem;
 *   }
 * }
 *
 * .example {
 *   font-size: 1rem;
 * }
 */

import { buildTimeTransform } from 'css-if-polyfill';

const PLUGIN_NAME = 'postcss-if-function';

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
function postcssIfFunction(options = {}) {
	const {
		preserveOriginal: _preserveOriginal = false,
		logTransformations = false,
		skipSelectors: _skipSelectors = []
	} = options;

	return {
		postcssPlugin: PLUGIN_NAME,
		async Once(root, { result }) {
			// Collect all CSS text first
			const cssText = root.toString();

			// Check if there are any if() functions to transform
			if (!cssText.includes('if(')) {
				return;
			}

			// Apply transformation
			const transformed = buildTimeTransform(cssText);

			if (transformed.nativeCSS === cssText) {
				// No transformations were made
				return;
			}

			// Clear the original root
			root.removeAll();

			// Note: Architectural optimization opportunity
			// This re-parsing step could be eliminated by modifying the transformation engine
			// to output PostCSS AST nodes directly instead of CSS strings, removing the
			// double parsing overhead identified by static analysis tools.

			try {
				const processed = await result.processor.process(
					transformed.nativeCSS,
					{
						from: undefined,
						parser: result.processor.parser
					}
				).root;

				const transformedRoot = processed.root;
				transformedRoot.each((node) => {
					root.append(node.clone());
				});

				// Log transformation statistics if requested
				if (logTransformations && transformed.stats) {
					const { totalRules, transformedRules } = transformed.stats;
					console.log(`[${PLUGIN_NAME}] Transformation statistics:`);
					console.log(`  - Total rules: ${totalRules}`);
					console.log(
						`  - Total transformations: ${transformedRules}`
					);
				}
			} catch (error) {
				throw new Error(
					`${PLUGIN_NAME}: Failed to parse transformed CSS - ${error.message}`
				);
			}
		}
	};
}

postcssIfFunction.postcss = true;

export { postcssIfFunction };
export default postcssIfFunction;
