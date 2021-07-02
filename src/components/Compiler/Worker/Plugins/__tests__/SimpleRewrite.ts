import { TCompilerPlugin } from '../../TCompilerPlugin'
import { SimpleRewrite } from '../simpleRewrite'
import { FileSystem } from '/@/components/FileSystem/FileSystem'

const tests: Record<string, [string, string, string]> = {
	'BP/entities/test.json': [
		'builds/dist/Bridge BP/entities/test.json',
		'builds/dev/Bridge BP/entities/test.json',
		'development_behavior_packs/Bridge BP/entities/test.json',
	],
	'RP/animations/test/anim.animation.json': [
		'builds/dist/Bridge RP/animations/test/anim.animation.json',
		'builds/dev/Bridge RP/animations/test/anim.animation.json',
		'development_resource_packs/Bridge RP/animations/test/anim.animation.json',
	],
	'SP/textures/skin1.png': [
		'builds/dist/Bridge SP/textures/skin1.png',
		'builds/dev/Bridge SP/textures/skin1.png',
		'skin_packs/Bridge SP/textures/skin1.png',
	],
	'WT/volumes/test/volume1.json': [
		'builds/dist/Bridge WT/volumes/test/volume1.json',
		'builds/dev/Bridge WT/volumes/test/volume1.json',
		'minecraftWorlds/Bridge WT/volumes/test/volume1.json',
	],
}

describe('ComMojangRewrite Compiler Plugin', () => {
	const fileSystem = new FileSystem()
	const rewrite = <TCompilerPlugin>SimpleRewrite(<any>{
		options: { mode: 'build' },
		fileSystem,
		compileFiles: async () => {},
		getAliases: () => [],
	})
	const devRewrite = <TCompilerPlugin>SimpleRewrite(<any>{
		options: { mode: 'dev' },
		fileSystem,
		compileFiles: async () => {},
		getAliases: () => [],
	})
	const comMojangDevRewrite = <TCompilerPlugin>SimpleRewrite(<any>{
		options: { mode: 'dev' },
		fileSystem,
		compileFiles: async () => {},
		getAliases: () => [],
		hasComMojangDirectory: true,
	})

	it('should transform paths correctly', () => {
		for (const filePath in tests) {
			const [matchDefault, matchDev, matchComMojang] = tests[filePath]

			expect(rewrite.transformPath(filePath)).toEqual(matchDefault)
			expect(devRewrite.transformPath(filePath)).toEqual(matchDev)
			expect(comMojangDevRewrite.transformPath(filePath)).toEqual(
				matchComMojang
			)
		}
	})
})
