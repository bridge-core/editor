import { BasicFileImporter } from './BasicFileImporter'
import { ImporterManager } from './ImporterManager'

export function setupImporters() {
	ImporterManager.addFileImporter(new BasicFileImporter())
}
