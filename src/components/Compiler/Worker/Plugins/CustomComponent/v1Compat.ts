export const v1Compat = (module: any, fileType: string) => ({
	register: (componentClass: any) => {
		if ((componentClass.type ?? 'entity') !== fileType) return

		module.exports = ({ name, schema, template }: any) => {
			name(componentClass.component_name)
			schema({})

			template((componentArgs: any, { create }: any) => {
				const component = new componentClass()

				create(
					component.onApply(componentArgs, 'components')[
						`minecraft:${fileType}`
					]
				)
			})
		}
	},
})
