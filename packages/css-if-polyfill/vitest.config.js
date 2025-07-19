import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		environment: 'jsdom',
		setupFiles: ['./test/setup.js'],
		include: ['test/**/*.test.js'],
		coverage: {
			include: ['src/**/*.js'],
			exclude: ['src/**/*.test.js'],
			provider: 'v8',
			reporter: ['text', 'json', 'html']
		},
		globals: true
	},
	resolve: {
		alias: {
			'@': new URL('src', import.meta.url).pathname
		}
	}
});
