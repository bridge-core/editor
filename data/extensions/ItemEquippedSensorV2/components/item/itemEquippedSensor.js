export default defineComponent(({ name, template, schema }) => {
	name('bridge:item_equipped_sensor')
	schema({
		properties: {
			sensors: {
				type: 'array',
				items: {
					properties: {
						on_equip: {
							type: 'array',
							items: {
								$ref:
									'/data/packages/schema/general/reference/animationEvent.json',
							},
						},
						on_unequip: {
							type: 'array',
							items: {
								$ref:
									'/data/packages/schema/general/reference/animationEvent.json',
							},
						},
						slot: {
							$ref: '/data/packages/schema/general/slotType.json',
						},
					},
				},
			},
		},
	})

	template(({ sensors }, { create, animationController, identifier }) => {
		sensors.forEach((sensor, i) => {
			const tag = `bridge:${identifier.split(':').pop()}_sensor_${i}`
			const query = `query.equipped_item_any_tag('${sensor.slot}', '${tag}')`

			create(
				{
					[`tag:${tag}`]: {},
				},
				'minecraft:item/components'
			)
			animationController({
				default_state: 'not_equipped',
				states: {
					not_equipped: {
						transitions: [
							{
								is_equipped: query,
							},
						],
					},
					is_equipped: {
						transitions: [
							{
								not_equipped: `!${query}`,
							},
						],
						on_entry: sensor.on_equip,
						on_exit: sensor.on_unequip,
					},
				},
			})
		})
	})
})
