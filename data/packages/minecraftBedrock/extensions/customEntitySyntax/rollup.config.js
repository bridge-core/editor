import pkg from './package.json'
import commonjs from '@rollup/plugin-commonjs'
import { terser } from 'rollup-plugin-terser'
import { nodeResolve } from '@rollup/plugin-node-resolve'

export default {
	input: 'src/customEntitySyntax.js',
	output: [
		{
			file: pkg.module,
			format: 'es',
		},
	],
	plugins: [
		nodeResolve(),
		commonjs(),
		terser(),
	],
}