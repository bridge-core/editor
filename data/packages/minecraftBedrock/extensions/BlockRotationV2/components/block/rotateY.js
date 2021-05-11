export default function defineComponent({ name, template, schema }) {
	name('bridge:rotate_y_on_place')
	schema({
		properties: {
			flip: {
				type: 'boolean',
			},
		},
	})

	template(({ flip = false }, { create }) => {
		const rotationLookup = [
			[0.0, 0.0, 0.0],
			[0.0, 180.0, 0.0],
			[0.0, 90.0, 0.0],
			[0.0, 270.0, 0.0],
		]
		const rotationLookupFlipped = [
			[0.0, 180.0, 0.0],
			[0.0, 0.0, 0.0],
			[0.0, 270.0, 0.0],
			[0.0, 90.0, 0.0],
		]
		create(
			{
				'bridge:block_rotation': [2, 3, 4, 5],
			},
			'minecraft:block/description/properties'
		)

		create(
			{
				permutations: (flip
					? rotationLookupFlipped
					: rotationLookup
				).map((rotation, i) => ({
					condition: `query.block_property('bridge:block_rotation') == ${i}`,
					components: {
						'minecraft:rotation': rotation,
					},
				})),
			},
			'minecraft:block'
		)

		create(
			{
				'minecraft:on_player_placing': {
					event: 'bridge:update_rotation',
				},
			},
			'minecraft:block/components'
		)

		create(
			{
				'bridge:update_rotation': {
					set_block_property: {
						'bridge:block_rotation': 'query.cardinal_facing_2d',
					},
				},
			},
			'minecraft:block/events'
		)
	})
}
