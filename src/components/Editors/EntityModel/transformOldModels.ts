export function transformOldModels(geometry: any) {
	// New model format
	if (geometry['minecraft:geometry']) return geometry

	// Old model format
	// Filter out format_version
	const models: any = Object.entries(geometry).filter(
		([_, modelData]) => typeof modelData !== 'string'
	)

	const transformedModels = []
	for (const [modelId, model] of models) {
		transformedModels.push({
			description: {
				identifier: modelId,
				texture_width: model.texturewidth,
				texture_height: model.textureheight,
			},
			bones: model.bones,
		})
	}

	return {
		format_version: '1.12.0',
		'minecraft:geometry': transformedModels,
	}
}
