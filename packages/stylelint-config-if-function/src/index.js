const config = {
	rules: {
		'declaration-property-value-no-unknown': [
			true,
			{
				ignoreProperties: {
					'/.+/': [String.raw`/^if\((?:[^;]+:[^;]*;?)+\)$/`]
				}
			}
		],
		'function-no-unknown': [
			true,
			{
				ignoreFunctions: ['if', 'media', 'supports', 'style']
			}
		]
	}
};

export default config;
