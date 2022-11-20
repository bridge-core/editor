import { IframeApi } from '../../IframeApi'
import { resolveFileReferencePath } from '../FileSystem/ResolveFileReference'
import { GenericRequest } from '../GenericRequest'

export class UpdateFileRequest extends GenericRequest<string, void> {
	protected filesToUpdate = new Set<string>()
	protected updateScheduled = false
	constructor(api: IframeApi) {
		super('dash.updateFile', api)
	}

	async handle(fileReference: string, origin: string) {
		const filePath = resolveFileReferencePath(fileReference, this.api)

		this.filesToUpdate.add(filePath)
		this.scheduleUpdate()
	}

	scheduleUpdate() {
		if (this.updateScheduled) return
		this.updateScheduled = true

		// Update all files after 200ms
		setTimeout(() => {
			this.updateScheduled = false

			this.api.app.project.compilerService.updateFiles([
				...this.filesToUpdate,
			])
			this.filesToUpdate.clear()
		}, 200)
	}
}
