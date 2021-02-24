import { TCompilerPlugin } from '../../Plugins'
import { TypeScriptPlugin } from '../TypeScript'
import { FileSystem } from '/@/components/FileSystem/FileSystem'

describe('TypeScript Compiler Plugin', () => {
	const fileSystem = new FileSystem()
	const typeScript = <TCompilerPlugin>TypeScriptPlugin({
		options: { mode: 'dev' },
		fileSystem,
		resolve: async (_: string) => {},
	})

	it('should transpile TypeScript to JavaScript', () => {
		expect(
			typeScript.transform('test.ts', "let x: string = 'Hello World';")
		).toEqual("let x = 'Hello World';\n")
	})

	it('should replace .js extension with .ts', async () => {
		expect(await typeScript.transformPath('test.ts')).toMatch(
			/test_(.+)\.js/
		)
	})
})
