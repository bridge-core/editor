import { ExportActionManager } from './ExportActionManager'

export function setupExportActions() {
	ExportActionManager.addAction('exportBrProject')
	ExportActionManager.addAction('exportMcAddon')
	ExportActionManager.addAction('exportMcWorld')
	ExportActionManager.addAction('exportMcTemplate')
}
