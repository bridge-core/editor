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
					Object.values(component.onPropose())[0]
				)
			)

			template((componentArgs: any, { create }: any) => {
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

	// v1 property compatibility
	for (const [propertyName, value] of Object.entries(completions)) {
		if (typeof value === 'string')
			v2Completions[propertyName] = transformV1Value(value)
		else if (Array.isArray(value))
			v2Completions[propertyName] = { enum: value }
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
