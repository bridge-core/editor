import { TCompilerPluginFactory } from '../TCompilerPluginFactory'

export const EntityIdentifierAlias: TCompilerPluginFactory = ({ options }) => {
	return {
		registerAliases(filePath, fileContent) {
			if (
				filePath.startsWith('BP/entities/') &&
				fileContent?.['minecraft:entity']?.description?.identifier
			)
				return [
					fileContent?.['minecraft:entity']?.description?.identifier,
				]
		},
	}
}
