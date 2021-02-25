import { run } from '/@/components/Extensions/Scripts/run'
import { deepMerge, deepMergeAll } from '/@/utils/deepmerge'

export type TTemplate = (
	componentArgs: any,
	opts: {
		create: (t: any, loc: string) => any
		location: string
	}
) => any

export class Component {
	protected _name?: string
	protected schema?: any
	protected templates: TTemplate[] = []
	constructor(
		protected fileHandle: FileSystemFileHandle,
		protected _filePath: string
	) {}

	//#region Getters
	get name() {
		return this._name
	}
	get filePath() {
		return this._filePath
	}
	//#endregion

	async load() {
		const file = await this.fileHandle.getFile()
		const src = await file.text()

		const module = { exports: {} }
		run(
			src.replace('export default ', 'module.exports = '),
			[module],
			['module']
		)

		if (typeof module.exports !== 'function') return

		const name = (name: string) => (this._name = name)
		const schema = (schema: any) => (this.schema = schema)
		const template = (func: TTemplate) => this.templates.push(func)

		await module.exports({ name, schema, template })
	}

	create(fileContent: any, template: any, location?: string) {
		const keys = (location ?? '').split('/')

		let current: any = fileContent

		while (keys.length > 1) {
			const key = keys.shift()!

			if (current[key] === undefined) {
				if (current[Number(key)] !== undefined) {
					current = current[Number(key)]
				} else {
					current[key] = {}
					current = current[key]
				}
			} else {
				current = current[key]
			}
		}

		current[keys[0]] = deepMerge(current[keys[0]] ?? {}, template ?? {})
	}

	processTemplates(fileContent: any, componentArgs: any, location: string) {
		for (const template of this.templates) {
			template(componentArgs, {
				create: (template: any, location?: string) =>
					this.create(fileContent, template, location),
				location,
			})
		}
	}
}
