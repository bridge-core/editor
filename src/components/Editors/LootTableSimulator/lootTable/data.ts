import { ILootTableFunction } from './interfaces'
import { randomInt } from '/@/utils/math/randomInt'

export const defaultEnchants = [
	'aqua_affinity',
	'bane_of_arthropods',
	'binding',
	'blast_protection',
	'channeling',
	'depth_strider',
	'efficiency',
	'feather_falling',
	'fire_aspect',
	'fire_protection',
	'flame',
	'fortune',
	'impaling',
	'infinity',
	'knockback',
	'looting',
	'loyalty',
	'luck_of_the_sea',
	'lure',
	'mending',
	'multishot',
	'piercing',
	'power',
	'projectile_protection',
	'protection',
	'punch',
	'quick_charge',
	'respiration',
	'riptide',
	'sharpness',
	'silk_touch',
	'smite',
	'thorns',
	'unbreaking',
	'vanishing',
]
export const treasureEnchants = [
	'frost_walker',
	'mending',
	'soul_speed',
	'curse_of_binding',
	'curse_of_vanishing',
]

export const functionData: {
	[func: string]: (args: ILootTableFunction, itemIdentifier: string) => any
} = {
	set_count: (args: ILootTableFunction) => {
		if (!args.count)
			return { warnings: ['Function "set_count" requires "count"'] }
		if (typeof args.count === 'object') {
			const randomAmount = randomInt(args.count.min, args.count.max)
			return { item: { amount: randomAmount } }
		} else return { item: { amount: args.count } }
	},
	set_data: (args: ILootTableFunction) => {
		if (!args.data)
			return { warnings: ['Function "set_data" requires "data"'] }
		return { item: { data: args.data } }
	},
	specific_enchants: (args: ILootTableFunction) => {
		if (!args.enchants)
			return {
				warnings: ['Function "specific_enchants" requires "enchants"'],
			}
		const itemEnchantments = []
		for (const enchant of args.enchants) {
			if (typeof enchant === 'string')
				itemEnchantments.push({ id: enchant, level: 1 })
			else if (typeof enchant.level === 'number') {
				itemEnchantments.push(enchant)
			} else {
				itemEnchantments.push({
					id: enchant.id,
					level: randomInt(enchant.level[0], enchant.level[1]),
				})
			}
		}
		return { item: { data: { enchantments: itemEnchantments } } }
	},
	enchant_randomly: (args: ILootTableFunction) => {
		// TODO - Filter to enchants available for the item
		// TODO - Test how many enchants can randomly be applied
		// TODO - Should load these from json data
		const itemEnchantments = []
		const availableEnchants = args.treasure
			? defaultEnchants.concat(treasureEnchants)
			: defaultEnchants
		const i = randomInt(0, availableEnchants.length - 1)
		itemEnchantments.push({
			id: availableEnchants[i],
			level: randomInt(1, 3),
		})
		return { item: { data: { enchantments: itemEnchantments } } }
	},
	enchant_with_levels: (args: ILootTableFunction) => {
		if (!args.levels)
			return {
				warnings: ['Function "enchant_with_levels" requires "levels"'],
			}
		// TODO - Need to try and match enchantment table levels algorithm
	},
	looting_enchant: (args: ILootTableFunction) => {
		if (!args.count)
			return { warnings: ['Function "looting_enchant" requires "count"'] }
		// TODO - support inputs, need kill condition options, killed by looting
	},
	random_block_state: (args: ILootTableFunction) => {
		if (!args.block_state || !args.values)
			return {
				warnings: [
					'Function "random_block_state" requires "block_state" and "values"',
				],
			}
		const itemBlockStates = []
		itemBlockStates.push({
			id: args.block_state,
			value: randomInt(args.values.min, args.values.max),
		})
		return { item: { data: { blockStates: itemBlockStates } } }
	},
	random_aux_value: (args: ILootTableFunction) => {
		if (!args.values)
			return {
				warnings: ['Function "random_aux_value" requires "values"'],
			}
		return {
			item: { itemAuxValue: randomInt(args.values.min, args.values.max) },
		}
	},
	set_actor_id: (args: ILootTableFunction, itemIdentifier: string) => {
		if (!args.id)
			return { warnings: ['Function "set_actor_id" requires "id"'] }
		if (
			itemIdentifier == 'minecraft:spawn_egg' ||
			itemIdentifier == 'spawn_egg'
		)
			return { item: { data: { eggIdentifier: args.id } } }
		else
			return {
				warnings: [
					`Cannot use "set_actor_id" on item "${itemIdentifier}", expected item "minecraft:spawn_egg"`,
				],
			}
	},
	set_banner_details: (args: ILootTableFunction, itemIdentifier: string) => {
		if (!args.type)
			return {
				warnings: ['Function "set_banner_details" requires "type"'],
			}
		if (itemIdentifier == 'minecraft:banner' || itemIdentifier == 'banner')
			return { item: { data: { bannerType: args.type } } }
		else
			return {
				warnings: [
					`Cannot use "set_banner_details" on item "${itemIdentifier}", expected item "minecraft:banner"`,
				],
			}
	},
	set_book_contents: (args: ILootTableFunction, itemIdentifier: string) => {
		if (!args.author || !args.title || !args.pages)
			return {
				warnings: [
					'Function "set_book_contents" requires "author", "title", and "pages"',
				],
			}
		if (itemIdentifier == 'minecraft:book' || itemIdentifier == 'book') {
			return {
				item: {
					data: {
						bookData: {
							author: args.author,
							title: args.title,
							pages: args.pages,
						},
					},
				},
			}
		} else
			return {
				warnings: [
					`Cannot use "set_book_contents" on item "${itemIdentifier}", expected item "minecraft:book"`,
				],
			}
	},
	set_damage: (args: ILootTableFunction) => {
		if (!args.damage)
			return { warnings: ['Function "set_damage" requires "damage"'] }
		if (typeof args.damage !== 'number') {
			const randomAmount = randomInt(args.damage.min, args.damage.max)
			return { item: { data: { durability: randomAmount } } }
		} else return { item: { data: { durability: args.damage } } }
	},
	set_lore: (args: ILootTableFunction) => {
		if (!args.lore)
			return { warnings: ['Function "set_lore" requires "lore"'] }
		return { item: { data: { lore: args.lore } } }
	},
	set_name: (args: ILootTableFunction) => {
		if (!args.name)
			return { warnings: ['Function "set_name" requires "name"'] }
		return { item: { data: { displayName: args.name } } }
	},
	exploration_map: (args: ILootTableFunction) => {
		if (!args.destination)
			return {
				warnings: ['Function "exploration_map" requires "destination"'],
			}
		return { item: { data: { mapDestination: args.destination } } }
	},

	enchant_book_for_trading: (args: ILootTableFunction) => {},
	enchant_random_gear: (args: ILootTableFunction) => {},
	fill_container: (args: ILootTableFunction) => {},
	furnace_smelt: (args: ILootTableFunction) => {},
	random_dye: (args: ILootTableFunction) => {},
	set_data_from_color_index: (args: ILootTableFunction) => {},
	trader_material_type: (args: ILootTableFunction) => {},
}
