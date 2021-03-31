import { TCompilerPlugin } from '../../TCompilerPlugin'
import { SimpleRewrite } from '../simpleRewrite'
import { FileSystem } from '/@/components/FileSystem/FileSystem'

describe('ComMojangRewrite Compiler Plugin', () => {
	const fileSystem = new FileSystem()
	const rewrite = <TCompilerPlugin>SimpleRewrite(<any>{
		options: { mode: 'build' },
		fileSystem,
		compileFiles: async () => {},
		getAliases: () => [],
	})

	it('should put BP into correct folder', () => {
		expect(rewrite.transformPath('BP/entities/test.json')).toEqual(
			'builds/dist/Bridge BP/entities/test.json'
		)
	})
	it('should put RP into correct folder', () => {
		expect(rewrite.transformPath('RP/entity/test.json')).toEqual(
			'builds/dist/Bridge RP/entity/test.json'
		)
	})
	it('should put SP into correct folder', () => {
		expect(rewrite.transformPath('SP/textures/skin1.png')).toEqual(
			'builds/dist/Bridge SP/textures/skin1.png'
		)
	})

	const devRewrite = <TCompilerPlugin>SimpleRewrite(<any>{
		options: { mode: 'dev' },
		fileSystem,
		compileFiles: async () => {},
		getAliases: () => [],
		hasComMojangDirectory: true,
	})

	it('should put BP into correct folder in dev mode & with access to com.mojang folder', () => {
		expect(devRewrite.transformPath('BP/entities/test.json')).toEqual(
			'development_behavior_packs/Bridge BP/entities/test.json'
		)
	})
	it('should put RP into correct folder in dev mode & with access to com.mojang folder', () => {
		expect(devRewrite.transformPath('RP/entity/test.json')).toEqual(
			'development_resource_packs/Bridge RP/entity/test.json'
		)
	})
	it('should put SP into correct folder in dev mode & with access to com.mojang folder', () => {
		expect(devRewrite.transformPath('SP/textures/skin1.png')).toEqual(
			'skin_packs/Bridge SP/textures/skin1.png'
		)
	})
})
