export default function defineComponent({ name, template, schema }) {
	name('bridge:log_rotate_on_place')
	schema({
		properties: {
			rotation_from: {
				type: 'string',
				enum: ['player', 'block_face'],
			},
		},
	})

	template(({ rotation_from = 'player' }, { create }) => {
		const rotationLookup = [
			[0.0, 0.0, 0.0],
			[90.0, 0.0, 0.0],
			[0.0, 0.0, 90.0],
		]
		create(
			{
				'bridge:block_rotation': [0, 1, 2],
			},
			'minecraft:block/description/properties'
		)

		create(
			{
				permutations: rotationLookup.map((rotation, i) => ({
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
						'bridge:block_rotation': `math.floor(${
							rotation_from === 'player'
								? 'query.cardinal_facing'
								: 'query.block_face'
						} / 2.0)`,
					},
				},
			},
			'minecraft:block/events'
		)
	})
}
