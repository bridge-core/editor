return {
	keep: failedCurrentFileLoad,
	type: 'object',
	generateFile: 'entity/dynamic/currentContext/propertyForAlias.json',
	data: Object.fromEntries(
		get('minecraft:entity/description/properties')
			.map((properties) =>
				typeof properties === 'object'
					? Object.entries(properties || {})
					: []
			)
			.flat()
			.map(([propertyName, propertyDef]) => [
				propertyName,
				Array.isArray(propertyDef.values)
					? {
							enum: propertyDef.values,
					  }
					: {
							type: ['number', 'integer'],
							minimum: propertyDef.min,
							maximum: propertyDef.max,
					  },
			])
	),
}
