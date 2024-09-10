import { BasicFileImporter } from './BasicFileImporter'
import { BrProjectDirectoryImporter, BrProjectFileImporter } from './BrProject'
import { ImporterManager } from './ImporterManager'
import { AddonFileImporter as McAddonFileImporter } from './McAddon'
import { McPackFileImporter } from './McPack'
import { OutputFolderImporter } from './OutputFolder'

export function setupImporters() {
	ImporterManager.addFileImporter(new BasicFileImporter(), true)
	ImporterManager.addFileImporter(new BrProjectFileImporter())
	ImporterManager.addFileImporter(new McAddonFileImporter())
	ImporterManager.addFileImporter(new McPackFileImporter())

	ImporterManager.addDirectoryImporter(new BrProjectDirectoryImporter())
	ImporterManager.addDirectoryImporter(new OutputFolderImporter())
}
