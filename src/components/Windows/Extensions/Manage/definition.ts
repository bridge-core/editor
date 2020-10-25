import { createWindow } from '../../create'
import ManagePluginComponent from './Main.vue'

export function createManagePluginWindow(
    plugin: {
        name: String,
        description: String,
        id: String,
        version: String,
        author: String,
        active: Boolean,
        link: String
}) {
    const ManagePlugin = createWindow(ManagePluginComponent, {plugin: plugin})
    ManagePlugin.open()
    return ManagePlugin
}

