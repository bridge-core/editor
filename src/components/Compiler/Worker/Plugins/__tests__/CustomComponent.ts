import { TCompilerPlugin } from '../../Plugins'
import { CustomEntityComponentPlugin } from '../CustomComponent/Plugin'
import { FileSystem } from '/@/components/FileSystem/FileSystem'

describe('CustomComponent Compiler Plugin', () => {
	const fileSystem = new FileSystem()
	const customComponent = <TCompilerPlugin>CustomEntityComponentPlugin({
		options: { mode: 'dev' },
		fileSystem,
	})

	it('should omit custom components from build output', () => {
		expect(customComponent.transformPath('BP/components/test.ts')).toBe(
			null
		)
	})
})
