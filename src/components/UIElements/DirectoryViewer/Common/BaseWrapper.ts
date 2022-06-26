import type { DirectoryWrapper } from '../DirectoryView/DirectoryWrapper'
import { VirtualHandle } from '/@/components/FileSystem/Virtual/Handle'
import { App } from '/@/App'
import type { IDirectoryViewerOptions } from '../DirectoryStore'
import { moveHandle } from '/@/utils/file/moveHandle'
import { ref } from '@vue/composition-api'
import type { FileWrapper } from '../FileView/FileWrapper'

export abstract class BaseWrapper<T extends FileSystemHandle | VirtualHandle> {
	public abstract readonly kind: 'file' | 'directory'
	public readonly isSelected = ref(false)

	constructor(
		protected parent: DirectoryWrapper | null,
		public readonly handle: T,
		protected options: IDirectoryViewerOptions
	) {}

	get name() {
		return this.handle.name
	}
	get path(): string | null {
		if (!this.parent) return this.options.startPath ?? null

		const parentPath = this.parent.path

		if (!parentPath) return this.name
		else return `${parentPath}/${this.name}`
	}
	get color() {
		const path = this.path
		if (!path) return 'accent'

		return App.packType.get(path)?.color ?? 'accent'
	}

	isSame(child: BaseWrapper<any>) {
		return child.name === this.name && child.kind === this.kind
	}

	async move(directoryWrapper: DirectoryWrapper) {
		// No move actually happened
		if (this.parent === directoryWrapper) return

		// Store old path and old parent handle
		const fromPath = this.path!
		const fromParent = this.parent!

		// Set the new parent
		this.parent = directoryWrapper

		// Move the file handle
		const { type, handle: newHandle } = await moveHandle({
			fromHandle: fromParent.handle,
			toHandle: this.parent.handle,
			moveHandle: this.handle,
		})

		if (newHandle) {
			// If necessary, update the handle reference
			// @ts-ignore This works because newHandle always has the same type as this.handle
			this.handle = newHandle
		}

		if (type === 'cancel') {
			// Move was cancelled
			this.parent = fromParent
			directoryWrapper.children.value = directoryWrapper.children.value!.filter(
				(child) =>
					child !== <DirectoryWrapper | FileWrapper>(<unknown>this)
			)
			fromParent.children.value!.push(
				<DirectoryWrapper | FileWrapper>(<unknown>this)
			)
			fromParent.sort()
		} else if (type === 'overwrite') {
			// We need to remove the duplicate FileWrapper
			directoryWrapper.children.value = directoryWrapper.children.value!.filter(
				(child) =>
					child === <DirectoryWrapper | FileWrapper>(<unknown>this) ||
					!child.isSame(
						<DirectoryWrapper | FileWrapper>(<unknown>this)
					)
			)
		}

		// Call onHandleMoved
		this.options.onHandleMoved?.({
			fromHandle: this.parent.handle,
			fromPath,
			toPath: this.path!,
			toHandle: this.parent.handle,
		})

		// Sort parent's children
		directoryWrapper.sort()
	}
}
