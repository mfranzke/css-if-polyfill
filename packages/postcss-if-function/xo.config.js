/** @type {import('xo').FlatXoConfig} */
const xoConfig = [
	{
		prettier: 'compat',
		rules: {
			'import-x/order': 0 // We use a prettier plugin to organize imports
		}
	}
];

export default xoConfig;
