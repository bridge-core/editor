export interface ILootTablePool {
	// tiers: {
	//     initial_range: number
	//     bonus_rolls: number
	//     bonus_chance: number
	// }
	rolls:
		| number
		| {
				min: number
				max: number
		  }
	entries: ILootTableEntry[]
}

export interface ILootTableEntry {
	type: 'item' | 'loot_table' | 'empty'
	name?: string
	weight: number
	pools?: ILootTablePool[]
	functions?: ILootTableFunction[]
}

export interface ILootTableFunction {
	function: string
	// set_actor_id
	id?: string
	// set_count, looting_enchant
	count?:
		| number
		| {
				min: number
				max: number
		  }
	// set_data
	data?: number
	// specific_enchants
	enchants?:
		| string[]
		| {
				id: string
				level: number
		  }[]
	// random_enchants
	treasure?: boolean
	// enchant_with_levels
	levels?: {
		min: number
		max: number
	}
	// random_block_state
	block_state?: string
	// random_aux_value & random_block_state
	values?: {
		min: number
		max: number
	}
	// set_banner_details
	type?: number
	// set_book_contents
	author?: string
	title?: string
	pages?: string[]
	// set_damage
	damage?:
		| number
		| {
				min: number
				max: number
		  }
	// set_lore
	lore?: string[]
	// set_name
	name?: string
	// exploration_map
	destination: string
}
