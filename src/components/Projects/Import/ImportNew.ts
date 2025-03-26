import { InformationWindow } from '/@/components/Windows/Common/Information/InformationWindow'
import { importFromBrproject } from './fromBrproject'
import { importFromMcaddon } from './fromMcaddon'
import { AnyFileHandle } from '/@/components/FileSystem/Types'

export async function importNewProject() {
	// Prompt user to select new project to open
	let projectHandle: AnyFileHandle
	try {
		;[projectHandle] = await window.showOpenFilePicker({
			multiple: false,
		})
	} catch {
		// User aborted selecting new project
		return
	}

	const projectName = projectHandle.name

	if (projectName.endsWith('.brproject')) {
		await importFromBrproject(projectHandle)
	} else if (projectName.endsWith('.mcaddon')) {
		await importFromMcaddon(projectHandle)
	} else {
		new InformationWindow({
			description: 'windows.projectChooser.wrongFileType',
		})
	}
}
