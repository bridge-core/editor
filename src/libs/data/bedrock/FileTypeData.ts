import { extname, sep } from '@/libs/path'
import { isMatch } from 'bridge-common-utils'
import { data } from '@/App'

export class FileTypeData {
	private fileTypes: any[] = []

	public async load() {
		this.fileTypes = await data.get(
			'packages/minecraftBedrock/fileDefinitions.json'
		)
	}

	public async get(path: string): Promise<null | any> {
		const projectRelativePath = path.split(sep).slice(3).join(sep)

		for (const fileType of this.fileTypes) {
			const hasExtensionMatch =
				fileType.detect !== undefined &&
				fileType.detect.fileExtensions !== undefined

			if (hasExtensionMatch) {
				if (
					!fileType.detect.fileExtensions.includes(
						extname(projectRelativePath)
					)
				)
					continue
			}

			const hasPathMatchers =
				fileType.detect !== undefined &&
				fileType.detect.matcher !== undefined

			if (hasPathMatchers) {
				const pathMatchers = Array.isArray(fileType.detect.matcher)
					? fileType.detect.matcher
					: [fileType.detect.matcher]

				const mustNotMatch = pathMatchers.filter((match: string) =>
					match.startsWith('!')
				)
				const anyMatch = pathMatchers.filter(
					(match: string) => !match.startsWith('!')
				)

				if (!isMatch(projectRelativePath, anyMatch)) continue
				if (isMatch(projectRelativePath, mustNotMatch)) continue
			}

			return fileType
		}

		return null
	}
}
