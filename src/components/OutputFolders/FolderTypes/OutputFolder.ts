import { AnyDirectoryHandle } from '/@/components/FileSystem/Types'
import { InformationWindow } from '/@/components/Windows/Common/Information/InformationWindow'
import { FileSystem } from '/@/components/FileSystem/FileSystem'
export interface ISerializedOutputFolder<DataBag> {
	directoryHandle: AnyDirectoryHandle
	dataBag: DataBag
}

export class OutputFolder<DataBag> {
	protected permission: PermissionState = 'prompt'
	public readonly fileSystem = new FileSystem()
	constructor(
		protected directoryHandle: AnyDirectoryHandle,
		protected dataBag: DataBag
	) {}

	protected async requestPermissionFromNavigator() {
		const permission = await this.directoryHandle.requestPermission({
			mode: 'readwrite',
		})

		return permission
	}
	async requestPermission() {
		try {
			this.permission = await this.requestPermissionFromNavigator()
		} catch {
			const informWindow = new InformationWindow({
				name: 'comMojang.title',
				description: 'comMojang.permissionRequest',
				onClose: async () => {
					this.permission = await this.requestPermissionFromNavigator()
				},
			})
			informWindow.open()

			await informWindow.fired
		}

		if (this.permission === 'granted')
			this.fileSystem.setup(this.directoryHandle)
	}

	static from<DataBag>(serialized: ISerializedOutputFolder<DataBag>) {
		return new OutputFolder(serialized.directoryHandle, serialized.dataBag)
	}

	serialize(): ISerializedOutputFolder<DataBag> {
		return {
			directoryHandle: this.directoryHandle,
			dataBag: this.dataBag,
		}
	}
}
