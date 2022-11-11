import { TabSystem } from '../../TabSystem/TabSystem'
import { IframeTab, IOpenWithPayload } from '../IframeTab/IframeTab'

export interface IBlockbenchOptions {
	openWithPayload?: IOpenWithPayload
}

export const blockbenchUrl = import.meta.env.DEV
	? 'http://localhost:5173'
	: 'https://blockbench.bridge-core.app'

export class BlockbenchTab extends IframeTab {
	constructor(
		tabSystem: TabSystem,
		{ openWithPayload }: IBlockbenchOptions = {}
	) {
		super(tabSystem, {
			icon: '$blockbench',
			name: 'Blockbench',
			url: blockbenchUrl,
			iconColor: 'primary',
			openWithPayload,
		})
	}
}
