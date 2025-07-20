/**
 * CSS if() Transformation Engine
 * Integrated solution combining runtime polyfill with build-time transformation
 */

/* global document */

/**
 * Handle string parsing in CSS
 */
const handleStrings = (char, previousChar, parseState) => {
	if ((char === '"' || char === "'") && previousChar !== '\\') {
		if (!parseState.inString) {
			parseState.inString = true;
			parseState.stringChar = char;
		} else if (char === parseState.stringChar) {
			parseState.inString = false;
			parseState.stringChar = '';
		}
	}

	return parseState.inString;
};

/**
 * Parse CSS rules with proper handling of nested structures
 */
const parseCSSRules = (cssText) => {
	const rules = [];
	let currentRule = '';
	let braceCount = 0;
	let inRule = false;

	const parseState = {
		inString: false,
		stringChar: '',
		inComment: false
	};

	for (let i = 0; i < cssText.length; i++) {
		const char = cssText[i];
		const nextChar = cssText[i + 1];
		const previousChar = cssText[i - 1];

		// Handle comment start
		if (
			!parseState.inString &&
			!parseState.inComment &&
			char === '/' &&
			nextChar === '*'
		) {
			// If we have accumulated content before the comment, save it
			if (currentRule.trim() && !inRule) {
				rules.push(currentRule.trim());
				currentRule = '';
			}

			parseState.inComment = true;
			currentRule += char;
			continue;
		}

		// Handle comment end
		if (parseState.inComment && char === '*' && nextChar === '/') {
			currentRule += char + nextChar;
			parseState.inComment = false;

			// Save the complete comment as a rule
			rules.push(currentRule.trim());
			currentRule = '';
			i++; // Skip the next character
			continue;
		}

		if (parseState.inComment) {
			currentRule += char;
			continue;
		}

		// Handle strings
		handleStrings(char, previousChar, parseState);

		// Handle braces (only when not in string)
		if (!parseState.inString) {
			if (char === '{') {
				braceCount++;
				inRule = true;
			} else if (char === '}') {
				braceCount--;
			}
		}

		currentRule += char;

		// Complete rule found
		if (inRule && braceCount === 0 && char === '}') {
			rules.push(currentRule.trim());
			currentRule = '';
			inRule = false;
		}
	}

	// Handle any remaining content
	if (currentRule.trim()) {
		rules.push(currentRule.trim());
	}

	return rules;
};

/**
 * Extract if() functions from CSS text
 */
const extractIfFunctions = (cssText) => {
	const functions = [];
	let index = 0;

	while (index < cssText.length) {
		const ifMatch = cssText.indexOf('if(', index);
		if (ifMatch === -1) {
			break;
		}

		// Ensure it's actually an if() function
		if (ifMatch > 0 && /[\w-]/.test(cssText[ifMatch - 1])) {
			index = ifMatch + 1;
			continue;
		}

		// Find matching closing parenthesis
		let depth = 0;
		let inQuotes = false;
		let quoteChar = '';
		const start = ifMatch + 3;
		let end = -1;

		for (let i = start; i < cssText.length; i++) {
			const char = cssText[i];
			const previousChar = i > 0 ? cssText[i - 1] : '';

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
			index = ifMatch + 1;
		} else {
			const fullFunction = cssText.slice(ifMatch, end + 1);
			const content = cssText.slice(start, end);

			functions.push({
				fullFunction,
				content,
				start: ifMatch,
				end: end + 1
			});

			index = end + 1;
		}
	}

	return functions;
};

/**
 * Parse if() function content - supports both single conditions and multiple chained conditions
 */
const parseIfFunction = (content) => {
	// Split content by semicolons, but respect parentheses and quotes
	const segments = [];
	let currentSegment = '';
	let parenDepth = 0;
	let inQuotes = false;
	let quoteChar = '';

	for (let i = 0; i < content.length; i++) {
		const char = content[i];
		const previousChar = i > 0 ? content[i - 1] : '';

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
				parenDepth++;
			} else if (char === ')') {
				parenDepth--;
			} else if (char === ';' && parenDepth === 0) {
				// End of segment
				segments.push(currentSegment.trim());
				currentSegment = '';
				continue;
			}
		}

		currentSegment += char;
	}

	// Add the last segment
	if (currentSegment.trim()) {
		segments.push(currentSegment.trim());
	}

	// Parse segments into conditions and values
	const conditions = [];
	let elseValue = null;

	for (const segment of segments) {
		// Check if this is an else clause
		const elseMatch = segment.match(/^else:\s*(.*)$/);
		if (elseMatch) {
			elseValue = elseMatch[1].trim();
			continue;
		}

		// Parse condition: value format
		let colonIndex = -1;
		let parenDepth = 0;
		let inQuotes = false;
		let quoteChar = '';

		// Find the colon that's outside of parentheses and quotes
		for (let i = 0; i < segment.length; i++) {
			const char = segment[i];
			const previousChar = i > 0 ? segment[i - 1] : '';

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
					parenDepth++;
				} else if (char === ')') {
					parenDepth--;
				} else if (char === ':' && parenDepth === 0) {
					colonIndex = i;
					break;
				}
			}
		}

		if (colonIndex === -1) {
			throw new Error('Invalid if() function: missing colon in segment');
		}

		const conditionPart = segment.slice(0, colonIndex).trim();
		const valuePart = segment.slice(colonIndex + 1).trim();

		// Parse the condition type and expression
		const conditionMatch = conditionPart.match(
			/^(style|media|supports)\((.*)\)$/
		);
		if (!conditionMatch) {
			throw new Error(
				`Invalid if() function: unknown condition type in "${conditionPart}"`
			);
		}

		conditions.push({
			conditionType: conditionMatch[1],
			conditionExpression: conditionMatch[2],
			value: valuePart
		});
	}

	if (!elseValue) {
		throw new Error('Invalid if() function: missing else clause');
	}

	// For backward compatibility, if there's only one condition, return the old format
	if (conditions.length === 1) {
		return {
			conditionType: conditions[0].conditionType,
			conditionExpression: conditions[0].conditionExpression,
			trueValue: conditions[0].value,
			falseValue: elseValue
		};
	}

	// For multiple conditions, return the new format
	return {
		conditions,
		falseValue: elseValue,
		isMultipleConditions: true
	};
};

/**
 * Transform property with if() to native CSS
 */
const transformPropertyToNative = (selector, property, value) => {
	const ifFunctions = extractIfFunctions(value);

	if (ifFunctions.length === 0) {
		return {
			nativeCSS: `${selector} { ${property}: ${value}; }`,
			runtimeCSS: '',
			hasRuntimeRules: false
		};
	}

	const nativeRules = [];
	const runtimeRules = [];

	// Process each if() function
	for (const ifFunc of ifFunctions) {
		try {
			const parsed = parseIfFunction(ifFunc.content);

			// Handle multiple conditions format
			if (parsed.isMultipleConditions) {
				// Check if any condition uses style() - if so, needs runtime processing
				const hasStyleCondition = parsed.conditions.some(
					(condition) => condition.conditionType === 'style'
				);

				if (hasStyleCondition) {
					// If any condition uses style(), fall back to runtime processing
					runtimeRules.push({
						selector,
						property,
						value,
						condition: parsed
					});
					continue;
				}

				// All conditions are media() or supports() - can transform to native CSS
				// Create fallback rule first
				const fallbackValue = value.replace(
					ifFunc.fullFunction,
					parsed.falseValue
				);
				nativeRules.push({
					condition: null, // No condition = fallback
					rule: `${selector} { ${property}: ${fallbackValue}; }`
				});

				// Create conditional rules for each condition (in reverse order for CSS cascade)
				const { conditions } = parsed;
				for (let i = conditions.length - 1; i >= 0; i--) {
					const condition = conditions[i];
					const nativeCondition =
						condition.conditionType === 'media'
							? `@media (${condition.conditionExpression})`
							: `@supports (${condition.conditionExpression})`;

					const conditionalValue = value.replace(
						ifFunc.fullFunction,
						condition.value
					);
					nativeRules.push({
						condition: nativeCondition,
						rule: `${selector} { ${property}: ${conditionalValue}; }`
					});
				}

				continue;
			}

			// Handle single condition format (backward compatibility)
			if (parsed.conditionType === 'style') {
				// Style() conditions need runtime processing
				runtimeRules.push({
					selector,
					property,
					value,
					condition: parsed
				});
				continue;
			}

			// Media() and supports() can be transformed to native CSS
			const nativeCondition =
				parsed.conditionType === 'media'
					? `@media (${parsed.conditionExpression})`
					: `@supports (${parsed.conditionExpression})`;

			// Create conditional rule with true value
			const trueValue = value.replace(
				ifFunc.fullFunction,
				parsed.trueValue
			);
			nativeRules.push({
				condition: nativeCondition,
				rule: `${selector} { ${property}: ${trueValue}; }`
			});

			// Create fallback rule with false value
			const falseValue = value.replace(
				ifFunc.fullFunction,
				parsed.falseValue
			);
			nativeRules.push({
				condition: null, // No condition = fallback
				rule: `${selector} { ${property}: ${falseValue}; }`
			});
		} catch (error) {
			// If parsing fails, fall back to runtime processing
			runtimeRules.push({
				selector,
				property,
				value,
				error: error.message
			});
		}
	}

	// Generate native CSS
	let nativeCSS = '';
	const fallbackRules = [];

	for (const rule of nativeRules) {
		if (rule.condition) {
			nativeCSS += `${rule.condition} {\n  ${rule.rule}\n}\n`;
		} else {
			fallbackRules.push(rule.rule);
		}
	}

	// Add fallback rules first (mobile-first approach)
	if (fallbackRules.length > 0) {
		nativeCSS = fallbackRules.join('\n') + '\n' + nativeCSS;
	}

	// Generate runtime CSS
	let runtimeCSS = '';
	if (runtimeRules.length > 0) {
		runtimeCSS = runtimeRules
			.map(
				(rule) =>
					`${rule.selector} { ${rule.property}: ${rule.value}; }`
			)
			.join('\n');
	}

	return {
		nativeCSS: nativeCSS.trim(),
		runtimeCSS: runtimeCSS.trim(),
		hasRuntimeRules: runtimeRules.length > 0
	};
};

/**
 * Parse a CSS declaration string into property-value pairs
 */
const parseDeclaration = (declaration) => {
	const colonIndex = declaration.indexOf(':');
	if (colonIndex === -1) {
		return null;
	}

	const property = declaration.slice(0, colonIndex).trim();
	const value = declaration.slice(colonIndex + 1).trim();

	if (property && value) {
		return { property, value };
	}

	return null;
};

/**
 * Parse a CSS rule and extract selector and properties
 */
const parseRule = (ruleText) => {
	const openBrace = ruleText.indexOf('{');
	const closeBrace = ruleText.lastIndexOf('}');

	if (openBrace === -1 || closeBrace === -1) {
		return null;
	}

	const selector = ruleText.slice(0, openBrace).trim();
	const declarations = ruleText.slice(openBrace + 1, closeBrace).trim();

	const properties = [];

	// Parse declarations with proper handling of semicolons in parentheses
	let currentDeclaration = '';
	let depth = 0;
	let inQuotes = false;
	let quoteChar = '';

	for (let i = 0; i < declarations.length; i++) {
		const char = declarations[i];
		const previousChar = i > 0 ? declarations[i - 1] : '';

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
				depth--;
			}
		}

		if (char === ';' && depth === 0 && !inQuotes) {
			// This is a real property separator
			if (currentDeclaration.trim()) {
				const parsed = parseDeclaration(currentDeclaration);
				if (parsed) {
					properties.push(parsed);
				}
			}

			currentDeclaration = '';
		} else {
			currentDeclaration += char;
		}
	}

	// Handle the last declaration
	if (currentDeclaration.trim()) {
		const parsed = parseDeclaration(currentDeclaration);
		if (parsed) {
			properties.push(parsed);
		}
	}

	return {
		selector,
		properties
	};
};

/**
 * Transform CSS text to native CSS where possible
 */
const transformToNativeCSS = (cssText) => {
	const rules = parseCSSRules(cssText);
	let nativeCSS = '';
	let runtimeCSS = '';
	let hasRuntimeRules = false;

	for (const ruleText of rules) {
		const rule = parseRule(ruleText);

		if (!rule) {
			// Keep non-rule content as-is
			nativeCSS += ruleText + '\n';
			continue;
		}

		let hasIfConditions = false;
		const nonIfProperties = [];

		for (const { property, value } of rule.properties) {
			if (value.includes('if(')) {
				hasIfConditions = true;
				const transformed = transformPropertyToNative(
					rule.selector,
					property,
					value
				);

				if (transformed.nativeCSS) {
					nativeCSS += transformed.nativeCSS + '\n';
				}

				if (transformed.hasRuntimeRules) {
					runtimeCSS += transformed.runtimeCSS + '\n';
					hasRuntimeRules = true;
				}
			} else {
				// Collect non-if() properties to preserve them
				nonIfProperties.push(`${property}: ${value}`);
			}
		}

		// If we have non-if() properties in a rule that also has if() properties,
		// we need to create a base rule with those properties
		if (hasIfConditions && nonIfProperties.length > 0) {
			nativeCSS += `${rule.selector} { ${nonIfProperties.join('; ')}; }\n`;
		} else if (!hasIfConditions) {
			// Keep rules without if() conditions as-is
			nativeCSS += ruleText + '\n';
		}
	}

	return {
		nativeCSS: nativeCSS.trim(),
		runtimeCSS: runtimeCSS.trim(),
		hasRuntimeRules,
		stats: {
			totalRules: rules.length,
			transformedRules: rules.filter((rule) => rule.includes('if('))
				.length
		}
	};
};

/**
 * Build-time transformation utility
 */
const buildTimeTransform = (cssText, options = {}) => {
	const {
		_generateFallbacks = true,
		_optimizeMediaQueries = true,
		minify = false
	} = options;

	const result = transformToNativeCSS(cssText);

	if (minify) {
		result.nativeCSS = result.nativeCSS
			.replaceAll(/\s+/g, ' ')
			.replaceAll(/;\s*}/g, '}')
			.replaceAll(/{\s+/g, '{')
			.trim();
	}

	return result;
};

/**
 * Runtime transformation utility (for integration with existing polyfill)
 */
const runtimeTransform = (cssText, element) => {
	const result = transformToNativeCSS(cssText);

	// Apply native CSS immediately if we have it
	if (result.nativeCSS && element) {
		const style = document.createElement('style');
		style.textContent = result.nativeCSS;
		style.dataset.cssIfNative = 'true';
		document.head.append(style);
	}

	// Return runtime CSS for further processing by the polyfill
	return {
		processedCSS: result.runtimeCSS,
		hasRuntimeRules: result.hasRuntimeRules,
		nativeCSS: result.nativeCSS
	};
};

export {
	buildTimeTransform,
	extractIfFunctions,
	parseCSSRules,
	parseIfFunction,
	parseRule,
	runtimeTransform,
	transformPropertyToNative,
	transformToNativeCSS
};
