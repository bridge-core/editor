import { App } from '/@/App'

export async function loadValidColors() {
	const app = await App.getApp()

	const currentTab = app.project.tabSystem?.selectedTab
	if (!currentTab) return

	// Load the valid color locations from bridge.'s data
	const validColors: Record<
		string,
		Record<string, string[]>
	> = await app.dataLoader.readJSON(
		`data/packages/minecraftBedrock/location/validColor.json`
	)
	// Get the file definition id of the currently opened tab
	const { id } = App.fileType.get(currentTab.getPath()) ?? {
		id: 'unknown',
	}

	// Get the color locations for this file type
	return validColors[id]
}
