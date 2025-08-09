import { buildTimeTransform } from 'css-if-polyfill';
import { transform as lightningTransform } from 'lightningcss';

/**
 * Transforms CSS with if() functions using css-if-polyfill and then processes it with Lightning CSS.
 *
 * @param {import('lightningcss').TransformOptions} options - The options for Lightning CSS transform.
 * @returns {import('lightningcss').TransformResult} The result from Lightning CSS transform.
 */
export function transform(options) {
	const decoder = new TextDecoder();
	const cssText = decoder.decode(options.code);

	// Early return if no if() functions to transform
	if (!cssText.includes('if(')) {
		return lightningTransform(options);
	}

	const transformed = buildTimeTransform(cssText);

	// Use TextEncoder instead of Buffer for better cross-platform compatibility
	const encoder = new TextEncoder();
	const newOptions = {
		...options,
		code: encoder.encode(transformed.nativeCSS)
	};

	return lightningTransform(newOptions);
}

// It's good practice to provide a default export as well.
export default transform;
