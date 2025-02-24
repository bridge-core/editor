import { Runtime } from '@bridge-editor/js-runtime'
import { compileScript, compileTemplate, parse } from '@vue/compiler-sfc'
import { Component, defineComponent } from 'vue'
import { fileSystem } from '@/libs/fileSystem/FileSystem'

export async function compileSFC(path: string, runtime: Runtime): Promise<Component> {
	const source = await fileSystem.readFileText(path)

	const parseResult = parse(source)

	const compiledScript: any = compileScript(parseResult.descriptor, { id: path })

	const templateResult = compileTemplate({
		source,
		filename: path,
		id: path,
		isProd: true,
		compilerOptions: {
			hmr: false,
			nodeTransforms: [
				(node, context) => {
					if (node.type === 0) {
						//@ts-ignore
						node.children = node.children[0].children
					}
				},
			],
		},
	})

	runtime.clearCache()
	const setupModule = await runtime.run(path, {}, compiledScript.content)

	runtime.clearCache()
	const renderModule = await runtime.run(path, {}, templateResult.code)

	const componentOptions = setupModule.__default__

	componentOptions.render = renderModule.render

	console.log(compiledScript.content)
	console.log(templateResult.code)

	const component = defineComponent(componentOptions)

	return component
}
