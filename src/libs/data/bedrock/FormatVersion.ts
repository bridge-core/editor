import { Data } from '../Data'

export async function getLatestStableFormatVersion(): Promise<string> {
	const formatVersions = await Data.get('/packages/minecraftBedrock/formatVersions.json')

	return formatVersions.currentStable
}
