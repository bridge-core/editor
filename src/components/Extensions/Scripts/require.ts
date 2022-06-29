import { TUIStore } from '../UI/store'
import { IDisposable } from '/@/types/disposable'
import { IModuleConfig } from './types'

import { SidebarModule } from './Modules/sidebar'
import { UIModule } from './Modules/ui'
import { NotificationModule } from './Modules/notifications'
import { FSModule } from './Modules/fs'
import { ENVModule } from './Modules/env'
import { UtilsModule } from './Modules/utils'
import { ImportFileModule } from './Modules/importFiles'
import { PathModule } from './Modules/path'
import { FetchDefinitionModule } from './Modules/fetchDefinition'
import { WindowModule } from './Modules/windows'
import { GlobalsModule } from './Modules/globals'
import { ToolbarModule } from './Modules/toolbar'
import { CompareVersions } from './Modules/compareVersions'
import { MonacoModule } from './Modules/monaco'
import { Json5Module } from './Modules/json5'
import { ComMojangModule } from './Modules/comMojang'
import { TabModule } from './Modules/Tab'
import { TabActionsModule } from './Modules/TabAction'
import { ThemeModule } from './Modules/theme'
import { ProjectModule } from './Modules/project'
import { ThreeModule } from './Modules/Three'
import { ModelViewerModule } from './Modules/ModelViewer'
import { ImportModule } from './Modules/import'
import { PersistentStorageModule } from './Modules/persistentStorage'

const BuiltInModules = new Map<string, (config: IModuleConfig) => unknown>([
	['@bridge/ui', UIModule],
	['@bridge/sidebar', SidebarModule],
	['@bridge/notification', NotificationModule],
	['@bridge/fs', FSModule],
	['@bridge/path', PathModule],
	['@bridge/env', ENVModule],
	['@bridge/project', ProjectModule],
	['@bridge/globals', GlobalsModule],
	['@bridge/utils', UtilsModule],
	['@bridge/file-importer', ImportFileModule],
	['@bridge/fetch-definition', FetchDefinitionModule],
	['@bridge/windows', WindowModule],
	['@bridge/toolbar', ToolbarModule],
	['@bridge/compare-versions', CompareVersions],
	['@bridge/monaco', MonacoModule],
	['@bridge/json5', Json5Module],
	['@bridge/com-mojang', ComMojangModule],
	['@bridge/tab', TabModule],
	['@bridge/tab-actions', TabActionsModule],
	['@bridge/theme', ThemeModule],
	['@bridge/three', ThreeModule],
	['@bridge/model-viewer', ModelViewerModule],
	['@bridge/import', ImportModule],
	['@bridge/persistent-storage', PersistentStorageModule],
])
//For usage inside of custom commands, components etc.
const LimitedModules = new Map<string, (config: IModuleConfig) => unknown>([
	['@bridge/notification', NotificationModule],
	['@bridge/fs', FSModule],
	['@bridge/path', PathModule],
	['@bridge/env', ENVModule],
	['@bridge/globals', GlobalsModule],
	['@bridge/utils', UtilsModule],
	['@bridge/fetch-definition', FetchDefinitionModule],
	['@bridge/compare-versions', CompareVersions],
])

function createGenericEnv(
	extensionId: string,
	disposables: IDisposable[] = [],
	uiStore?: TUIStore,
	isGlobal: boolean = false,
	modules = BuiltInModules
) {
	return async (importName: string) => {
		const module = modules.get(importName)
		if (module)
			return await module({ uiStore, disposables, isGlobal, extensionId })
	}
}

export function createEnv(
	extensionId: string,
	disposables: IDisposable[] = [],
	uiStore?: TUIStore,
	isGlobal: boolean = false
) {
	return createGenericEnv(extensionId, disposables, uiStore, isGlobal)
}
export function createLimitedEnv(
	extensionId: string,
	disposables: IDisposable[] = [],
	uiStore?: TUIStore,
	isGlobal: boolean = false
) {
	return createGenericEnv(
		extensionId,
		disposables,
		uiStore,
		isGlobal,
		LimitedModules
	)
}
