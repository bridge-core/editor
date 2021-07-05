/**
 * A module that emulates bridge. v1's custom component environment
 */
export const v1Compat = (module: any, fileType: string) => ({
	register: (componentClass: any) => {
		if ((componentClass.type ?? 'entity') !== fileType) return

		module.exports = ({ name, schema, template }: any) => {
			const component = new componentClass()

			name(componentClass.component_name)
			schema(
				transformV1AutoCompletions(
					// v1 custom component auto-completions are always prefixed with the component name.
					// That is no longer the case for v2's component auto-completions so we can strip the name here
					Object.values(component.onPropose())[0]
				)
			)

			template((componentArgs: any, { create }: any) => {
				// - Default location for a v2 create(...) call is already inside of the top-level wrapper object (e.g. 'minecraft:entity')
				// - v1 components used to wrap the return object inside of 'minecraft:entity'/'minecraft:block'
				// >>> Strip 'minecraft:entity'/'minecraft:block' from onApply(...) return object
				create(
					component.onApply(componentArgs, 'components')[
						`minecraft:${fileType}`
					]
				)
			})
		}
	},
})

function transformV1AutoCompletions(completions: any): any {
	const v2Completions: any = {}

	// v1 array schema compatibility
	const keys = Object.keys(completions)
	if (keys.length === 1 && keys[0].startsWith('$dynamic.list.')) {
		return {
			type: 'array',
			items: transformV1AutoCompletions(Object.values(completions)[0]),
		}
	}

	// v1 object property compatibility
	for (const [propertyName, value] of Object.entries(completions)) {
		// Skip special properties like '$dynamic_template'/'$versioned_template'
		if (propertyName.startsWith('$')) continue

		if (typeof value === 'string')
			v2Completions[propertyName] = transformV1Value(value)
		else if (Array.isArray(value))
			v2Completions[propertyName] = { enum: value }
		else if (value === 'object')
			v2Completions[propertyName] = transformV1AutoCompletions(value)
	}

	return { type: 'object', properties: v2Completions }
}

/**
 * Takes a v1 string auto-completion reference like "$general.boolean"
 * and transforms it to a standard JSON schema
 */
function transformV1Value(value: string) {
	switch (value) {
		case '$general.boolean':
			return { type: 'boolean' }
		case '$general.number':
			return { type: 'integer' }
		case '$general.decimal':
			return { type: 'number' }
		default:
			return {
				type: [
					'number',
					'integer',
					'string',
					'boolean',
					'object',
					'array',
				],
			}
	}
}
