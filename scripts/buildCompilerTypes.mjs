import { exec } from 'child_process'
import { promises as fs } from 'fs'
import { join } from 'path'

// Build TypeScript declaration files for compiler plugins
;(async () => {
	const { version } = JSON.parse(
		await fs.readFile(join(process.cwd(), './package.json'))
	)
	await fs.rmdir('./compilerTypes/', { recursive: true })

	exec(
		'tsc src/components/Compiler/Worker/TCompilerPluginFactory.ts --declaration --outDir ./compilerTypes/ --emitDeclarationOnly --esModuleInterop --target ES6 --moduleResolution node',
		async (error) => {
			if (error) throw error

			await fs.writeFile(
				'./compilerTypes/package.json',
				JSON.stringify(
					{
						name: 'bridge-compiler-plugin-types',
						version,
					},
					null,
					'\t'
				)
			)
		}
	)
})()
