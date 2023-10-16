import { ISubmenuConfig } from '/@/components/ContextMenu/showContextMenu'
import { BaseWrapper } from '../../Common/BaseWrapper'
import { CopyAction } from './Edit/Copy'
import { PasteAction } from './Edit/Paste'
import { DuplicateAction } from './Edit/Duplicate'
import { RenameAction } from './Edit/Rename'
import { DeleteAction } from './Edit/Delete'
import { DirectoryWrapper } from '../../DirectoryView/DirectoryWrapper'

interface IEditOptions {
	hideRename?: boolean
	hideDelete?: boolean
	hideDuplicate?: boolean
}

export const EditAction = async (
	baseWrapper: BaseWrapper<any>,
	options: IEditOptions = {}
) => {
	return [
		options.hideRename ? null : RenameAction(baseWrapper),
		options.hideDelete ? null : DeleteAction(baseWrapper),
		options.hideDuplicate ? null : DuplicateAction(baseWrapper),
		// options.hideRename && options.hideDelete && options.hideDuplicate
		// 	? null
		// 	: { type: 'divider' },

		CopyAction(baseWrapper),
		PasteAction(
			baseWrapper instanceof DirectoryWrapper
				? baseWrapper
				: baseWrapper.getParent()!
		),
	]
}
