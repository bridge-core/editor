import { PackType } from 'mc-project-core'

export class CompatabilityPackType extends PackType<{ fileTypes: any }> {
	async setup(arg: { fileTypes: any }) {}
}
