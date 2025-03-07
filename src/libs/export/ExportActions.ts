import { ExportActionManager } from './ExportActionManager'

export function setupExportActions() {
	ExportActionManager.addExportAction('exportBrProject')
	ExportActionManager.addExportAction('exportMcAddon')
	ExportActionManager.addExportAction('exportMcWorld')
	ExportActionManager.addExportAction('exportMcTemplate')
}
