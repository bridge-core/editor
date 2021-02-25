import { TCompilerPlugin } from '../../Plugins'
import { CustomEntityComponentPlugin } from '../CustomComponent/Plugin'
import { FileSystem } from '/@/components/FileSystem/FileSystem'

describe('CustomComponent Compiler Plugin', () => {
	const fileSystem = new FileSystem()
	const customComponent = <TCompilerPlugin>CustomEntityComponentPlugin({
		options: { mode: 'dev' },
		fileSystem,
		getFiles: () => new Map(),
		resolve: async (_: string) => {},
	})

	it('should omit custom components from build output', () => {
		expect(
			customComponent.finalizeBuild('BP/components/test.ts', 'something')
		).toBe(null)
	})
})
