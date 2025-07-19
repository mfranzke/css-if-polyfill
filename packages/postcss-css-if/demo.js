import postcss from 'postcss';
import postcssCssIf from './src/index.js';

const css = `
.example {
  color: if(media(max-width: 768px), blue, red);
  font-size: if(supports(display: grid), 1.2rem, 1rem);
}

.card {
  background: if(media(prefers-color-scheme: dark), #333, #fff);
}
`;

async function demo() {
	console.log('=== Original CSS ===');
	console.log(css);

	const result = await postcss([
		postcssCssIf({
			logTransformations: true
		})
	]).process(css, { from: undefined });

	console.log('\n=== Transformed CSS ===');
	console.log(result.css);
}

try {
	await demo();
} catch (error) {
	console.error(error);
}
