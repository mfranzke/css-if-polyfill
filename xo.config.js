/** @type {import('xo').FlatXoConfig} */
const xoConfig = [
	{
		prettier: 'compat',
		rules: {
			'import-x/order': 0 // We use a prettier plugin to organize imports
		}
	},
	// Provide an overwrite for bin/cli.js to not check for n/no-unpublished-bin rule
	// This is needed because the bin/cli.js file is actually published to npm, so it seems to be a false positive
	{
		files: ['bin/cli.js'],
		rules: {
			'n/no-unpublished-bin': 0
		}
	}
];

export default xoConfig;
