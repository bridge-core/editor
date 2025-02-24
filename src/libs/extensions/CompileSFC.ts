import { compileScript, compileTemplate, parse } from '@vue/compiler-sfc'
import { defineComponent } from 'vue'

export async function compile(path: string) {
	// const uiPath = join(this.path, 'ui')
	// const source = await fileSystem.readFileText(entry.path)
	// console.log(source)
	// const parseResult = parse(source)
	// console.log(parseResult.descriptor)
	// const componentOptions: any = compileScript(parseResult.descriptor, { id: entry.path })
	// const templateResult = compileTemplate({
	// 	source,
	// 	filename: entry.path,
	// 	id: entry.path,
	// })
	// const runtime = new ExtensionVueComponentRuntime()
	// const module = await runtime.run(
	// 	entry.path,
	// 	{
	// 		vue: vue,
	// 	},
	// 	templateResult.code
	// )
	// console.log(module)
	// componentOptions.render = module.render
	// const component = defineComponent(componentOptions)
	// console.log(component)
	// this.ui[basename(entry.path, '.vue')] = component
}
