import { FileType } from 'mc-project-core'

export class CompatabilityFileType extends FileType<{ fileTypes: any }> {
	async setup(arg: { fileTypes: any }) {
		console.log('Setting file types', arg.fileTypes)

		this.fileTypes = arg.fileTypes
	}
}
