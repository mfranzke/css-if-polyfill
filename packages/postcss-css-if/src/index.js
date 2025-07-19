/**
 * PostCSS plugin for transforming CSS if() functions to native CSS
 *
 * This plugin transforms CSS if() functions into native @media and @supports rules
 * using the css-if-polyfill transformation engine.
 *
 * @example
 * // Input CSS:
 * .example {
 *   color: if(media(max-width: 768px), blue, red);
 *   font-size: if(supports(display: grid), 1.2rem, 1rem);
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

import { buildTimeTransform } from '../../css-if-polyfill/src/index.js';

const PLUGIN_NAME = 'postcss-css-if';

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
function postcsscssif(options = {}) {
	const {
		preserveOriginal: _preserveOriginal = false,
		logTransformations = false,
		skipSelectors: _skipSelectors = []
	} = options;

	return {
		postcssPlugin: PLUGIN_NAME,
		Once(root, { result }) {
			// Collect all CSS text first
			const cssText = root.toString();

			// Check if there are any if() functions to transform
			if (!cssText.includes('if(')) {
				return;
			}

			// Apply transformation
			const transformed = buildTimeTransform(cssText);

			if (transformed.transformedCSS === cssText) {
				// No transformations were made
				return;
			}

			// Clear the original root
			root.removeAll();

			// Parse the transformed CSS and add it back
			try {
				const transformedRoot = result.processor.process(
					transformed.transformedCSS,
					{
						from: undefined,
						parser: result.processor.parser
					}
				).root;

				// Copy all nodes from transformed root to original root
				transformedRoot.each((node) => {
					root.append(node.clone());
				});

				// Log transformation statistics if requested
				if (logTransformations && transformed.stats) {
					const {
						totalTransformations,
						mediaTransformations,
						supportsTransformations,
						styleTransformations
					} = transformed.stats;
					console.log(`[${PLUGIN_NAME}] Transformation statistics:`);
					console.log(
						`  - Total transformations: ${totalTransformations}`
					);
					console.log(`  - Media queries: ${mediaTransformations}`);
					console.log(
						`  - Support queries: ${supportsTransformations}`
					);
					console.log(`  - Style functions: ${styleTransformations}`);
				}
			} catch (error) {
				throw new Error(
					`${PLUGIN_NAME}: Failed to parse transformed CSS - ${error.message}`
				);
			}
		}
	};
}

postcsscssif.postcss = true;

export default postcsscssif;
export { postcsscssif };
