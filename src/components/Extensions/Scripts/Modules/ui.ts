import { IModuleConfig } from '../types'
import BaseWindow from '/@/components/Windows/Layout/BaseWindow.vue'
import SidebarWindow from '/@/components/Windows/Layout/SidebarWindow.vue'
import BridgeSheet from '/@/components/UIElements/Sheet.vue'

export const UIModule = ({ uiStore }: IModuleConfig) => ({
	...uiStore?.UI,
	BuiltIn: {
		BaseWindow,
		SidebarWindow,
		BridgeSheet,
	},
})
