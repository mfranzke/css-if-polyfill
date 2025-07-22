import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		environment: 'node',
		env: {
			POSTCSS_VERSION: '7'
		}
	}
});
