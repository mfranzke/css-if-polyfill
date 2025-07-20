import postcss from 'postcss';
import { postcssIfFunction } from './src/index.js';

const css = `
.example {
  color: if(media(max-width: 768px): blue; else: red);
  font-size: if(supports(display: grid): 1.2rem; else: 1rem);
}

.card {
  background: if(media(prefers-color-scheme: dark): #333; else: #fff);
}
`;

async function demo() {
	console.log('=== Original CSS ===');
	console.log(css);

	const result = await postcss([
		postcssIfFunction({
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
