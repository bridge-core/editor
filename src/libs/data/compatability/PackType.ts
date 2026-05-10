import { PackType } from 'mc-project-core'

export class CompatabilityPackType extends PackType<{
	fileTypes: any
	packTypes: any
}> {
	async setup(arg: { fileTypes: any; packTypes: any }) {
		this.packTypes = arg.packTypes
	}
}
