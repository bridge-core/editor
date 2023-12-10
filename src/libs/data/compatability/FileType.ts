import { FileType } from 'mc-project-core'

export class CompatabilityFileType extends FileType<{ fileTypes: any }> {
	async setup(arg: { fileTypes: any }) {
		this.fileTypes = arg.fileTypes
	}
}
