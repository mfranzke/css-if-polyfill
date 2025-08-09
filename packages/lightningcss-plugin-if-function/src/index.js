import { buildTimeTransform } from 'css-if-polyfill';
import { transform as lightningTransform } from 'lightningcss';
import Buffer from 'node:buffer';

/**
 * Transforms CSS with if() functions using css-if-polyfill and then processes it with Lightning CSS.
 *
 * @param {import('lightningcss').TransformOptions} options - The options for Lightning CSS transform.
 * @returns {import('lightningcss').TransformResult} The result from Lightning CSS transform.
 */
export function transform(options) {
	const cssText = options.code.toString('utf8');

	// Avoid transformation if not needed
	if (!cssText.includes('if(')) {
		return lightningTransform(options);
	}

	const transformed = buildTimeTransform(cssText);

	const newOptions = {
		...options,
		code: Buffer.from(transformed.nativeCSS)
	};

	return lightningTransform(newOptions);
}

// It's good practice to provide a default export as well.
export default transform;
