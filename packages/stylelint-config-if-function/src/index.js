const config = {
	rules: {
		'declaration-property-value-no-unknown': [
			true,
			{
				ignoreProperties: {
					'/.+/': ['/^if(.*)/']
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
