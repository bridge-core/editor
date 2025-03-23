import { extname, join, sep } from 'pathe'
import { hasAnyPath, isMatch } from 'bridge-common-utils'
import { ProjectManager } from '@/libs/project/ProjectManager'
import { Data } from '@/libs/data/Data'
import { TPackTypeId } from 'mc-project-core'
import * as JSONC from 'jsonc-parser'

/**
 * Handles determining the file types of a files and providing the file definition data associated with those file types
 */
export class FileTypeData {
	public fileTypes: any[] = []

	public async load() {
		this.fileTypes = await Data.get('packages/minecraftBedrock/fileDefinitions.json')
	}

	private generateMatchers(packTypes: string[], matchers: string[]) {
		if (ProjectManager.currentProject === null) return []

		if (packTypes.length === 0) return matchers.map((matcher) => ProjectManager.currentProject!.resolvePackPath(undefined, matcher))

		const paths: string[] = []

		for (const packType of packTypes) {
			for (const matcher of matchers) {
				paths.push(ProjectManager.currentProject!.resolvePackPath(packType, matcher))
			}
		}

		return paths
	}

	public get(path: string): null | any {
		if (!ProjectManager.currentProject) return null
		if (!ProjectManager.currentProject.config) return null

		const projectRelativePath = path.split(sep).slice(3).join(sep)

		for (const fileType of this.fileTypes) {
			const hasExtensionMatch = fileType.detect !== undefined && fileType.detect.fileExtensions !== undefined

			if (hasExtensionMatch) {
				if (!fileType.detect.fileExtensions.includes(extname(projectRelativePath))) continue
			}

			const packTypes = (
				fileType.detect.packType === undefined
					? []
					: Array.isArray(fileType.detect.packType)
					? fileType.detect.packType
					: [fileType.detect.packType]
			).filter((packType: string) => (<any>ProjectManager.currentProject!.config?.packs)[packType] !== undefined)

			const hasScopeMatch = fileType.detect !== undefined && fileType.detect.scope !== undefined

			if (hasScopeMatch) {
				const scopes = Array.isArray(fileType.detect.scope) ? fileType.detect.scope : [fileType.detect.scope]

				if (!this.generateMatchers(packTypes, scopes).some((scope) => path.startsWith(scope))) continue
			}

			const hasPathMatchers = fileType.detect !== undefined && fileType.detect.matcher !== undefined

			if (hasPathMatchers) {
				const pathMatchers = Array.isArray(fileType.detect.matcher) ? fileType.detect.matcher : [fileType.detect.matcher]

				const mustNotMatch = this.generateMatchers(
					packTypes,
					pathMatchers.filter((match: string) => match.startsWith('!')).map((match: string) => match.slice(1))
				)

				const anyMatch = this.generateMatchers(
					packTypes,
					pathMatchers.filter((match: string) => !match.startsWith('!'))
				)

				if (!isMatch(path, anyMatch)) continue
				if (isMatch(path, mustNotMatch)) continue
			}

			return fileType
		}

		return null
	}

	public async guessFolder(fileHandle: FileSystemFileHandle): Promise<string | null> {
		// Helper function
		const getStartPath = (scope: string | string[], packId: TPackTypeId) => {
			let startPath = Array.isArray(scope) ? scope[0] : scope
			if (!startPath.endsWith('/')) startPath += '/'

			const packPath = ProjectManager.currentProject?.resolvePackPath(packId) ?? './unknown'

			return join(packPath, startPath)
		}

		const extension = `.${fileHandle.name.split('.').pop()!}`
		// 1. Guess based on file extension
		const validTypes = this.fileTypes.filter(({ detect }) => {
			if (!detect || !detect.scope) return false

			return detect.fileExtensions?.includes(extension)
		})

		const onlyOneExtensionMatch = validTypes.length === 1
		const notAJsonFileButMatch = extension !== '.json' && validTypes.length > 0

		if (onlyOneExtensionMatch || notAJsonFileButMatch) {
			const { detect } = validTypes[0]

			return getStartPath(detect!.scope!, Array.isArray(detect!.packType) ? detect!.packType[0] : detect!.packType ?? 'behaviorPack')
		}

		if (extension !== '.json') return null

		// 2. Guess based on json file content
		const file = await fileHandle.getFile()
		let json: any
		try {
			json = JSONC.parse(await file.text())
		} catch {
			return null
		}

		for (const { type, detect } of validTypes) {
			if (typeof type === 'string' && type !== 'json') continue

			const { scope, fileContent, packType = 'behaviorPack' } = detect ?? {}
			if (!scope || !fileContent) continue

			if (!hasAnyPath(json, fileContent)) continue

			return getStartPath(scope, Array.isArray(packType) ? packType[0] : packType)
		}

		return null
	}
}
