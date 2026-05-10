import { FileType } from 'mc-project-core'

export class CompatabilityFileType extends FileType<{
	fileTypes: any
	packTypes: any
}> {
	async setup(arg: { fileTypes: any; packTypes: any }) {
		this.fileTypes = arg.fileTypes
	}
}
