import { ExportActionManager } from './ExportActionManager'

export function setupExportActions() {
	ExportActionManager.addAction('export.exportBrProject')
	ExportActionManager.addAction('export.exportMcAddon')
	ExportActionManager.addAction('export.exportMcWorld')
	ExportActionManager.addAction('export.exportMcTemplate')
}
