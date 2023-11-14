import { Signal } from '../../libs/event/Signal'
import { FileSystem } from '../FileSystem/FileSystem'

export class ActiveStatus extends Signal<void> {
	protected inactiveExtensions = new Set<string>()
	constructor(protected fileSystem: FileSystem, protected savePath: string) {
		super()

		this.loadFile().finally(() => this.dispatch())
	}

	protected async loadFile() {
		try {
			this.inactiveExtensions = new Set(
				await this.fileSystem.readJSON(this.savePath)
			)
		} catch {}
	}

	protected async save() {
		await this.fileSystem.writeJSON(this.savePath, [
			...this.inactiveExtensions,
		])
	}

	async setActive(id: string, value: boolean) {
		if (value) {
			this.inactiveExtensions.delete(id)
		} else {
			this.inactiveExtensions.add(id)
		}

		await this.save()
	}

	isActive(id: string) {
		return !this.inactiveExtensions.has(id)
	}
}
