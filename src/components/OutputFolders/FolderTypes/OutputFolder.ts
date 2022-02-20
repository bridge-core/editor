import { AnyDirectoryHandle } from '/@/components/FileSystem/Types'
import { InformationWindow } from '/@/components/Windows/Common/Information/InformationWindow'

export interface ISerializedOutputFolder<DataBag> {
	directoryHandle: AnyDirectoryHandle
	dataBag: DataBag
}

export class OutputFolder<DataBag> {
	protected permission: PermissionState = 'prompt'
	constructor(
		protected directoryHandle: AnyDirectoryHandle,
		protected dataBag: DataBag
	) {}

	async requestPermission() {
		const permission = await this.directoryHandle.requestPermission({
			mode: 'readwrite',
		})

		return permission
	}
	protected async createPermissionWindow() {
		const informWindow = new InformationWindow({
			name: 'comMojang.title',
			description: 'comMojang.permissionRequest',
			onClose: () => this.requestPermission(),
		})
		informWindow.open()

		await informWindow.fired
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
