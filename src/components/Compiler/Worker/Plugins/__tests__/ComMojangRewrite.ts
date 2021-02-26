import { TCompilerPlugin } from '../../Plugins'
import { ComMojangRewrite } from '../ComMojangRewrite'
import { FileSystem } from '/@/components/FileSystem/FileSystem'

describe('ComMojangRewrite Compiler Plugin', () => {
	const fileSystem = new FileSystem()
	const rewrite = <TCompilerPlugin>ComMojangRewrite({
		options: { mode: 'build' },
		fileSystem,
	})

	it('should put BP into correct folder', () => {
		expect(rewrite.transformPath('BP/entities/test.json')).toEqual(
			'builds/dist/development_behavior_packs/Bridge BP/entities/test.json'
		)
	})
	it('should put RP into correct folder', () => {
		expect(rewrite.transformPath('RP/entity/test.json')).toEqual(
			'builds/dist/development_resource_packs/Bridge RP/entity/test.json'
		)
	})
	it('should put SP into correct folder', () => {
		expect(rewrite.transformPath('SP/textures/skin1.png')).toEqual(
			'builds/dist/skin_packs/Bridge SP/textures/skin1.png'
		)
	})
})
