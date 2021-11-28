import { treasureEnchants, defaultEnchants, unsupportedFunctions } from './data'
import { createDefaultItemStack, ItemStack } from './itemStack'
import { ILootTableEntry, ILootTableFunction } from './interfaces'
import { randomInt } from '/@/utils/math/randomInt'

export class LootTablePool {
	/**
	 * The original pool.
	 */
	protected pool: any
	/**
	 * The amount of rolls, this is re-evaluated per run if min/max is used.
	 */
	protected rolls: number = 1
	/**
	 * List of warnings produced by this pool.
	 */
	public warnings: string[] = []

	constructor(pool: any) {
		this.pool = pool
	}

	refreshRolls() {
		// Get the rolls for this pool
		const rolls:
			| number
			| {
					min: number
					max: number
			  } = this.pool.rolls ?? 1
		if (typeof rolls === 'number') this.rolls = rolls
		else {
			this.rolls = randomInt(rolls.min, rolls.max)
		}
	}

	selectEntry() {
		let itemResults: ItemStack[] = []
		this.refreshRolls()
		// Repeat for the amount of rolls
		for (let i = 1; i <= this.rolls; i++) {
			// Iterate entries and select one based on their weights. Once selected, get the ItemStack for the entry.
			const entries: ILootTableEntry[] = this.pool.entries ?? []
			// If there are no entries, don't continue.
			if (entries.length >= 0) {
				// Random weighted selection from entries
				// Reverse so higher weights will get chosen over lower weights
				entries.sort((a, b) => b.weight - a.weight)
				// Collect total weight
				let totalWeight = 0
				for (const entry of entries) {
					if (!entry.weight) {
						entry.weight = 1
						this.warnings.push(
							`Missing "weight" property in entry with item "${entry.name}"`
						)
					}
					totalWeight += entry.weight
				}

				// Select target value
				const target = Math.random() * totalWeight
				let runningTotal = 0
				let foundItem = false
				// Iterate entries, if running total of weights is greater than the target, select that entry
				for (const entry of entries) {
					runningTotal += entry.weight

					// Iterate every entry even after item is found to collect warnings from all items.
					const items = this.getItemsFromEntry(entry)
					if (runningTotal >= target && !foundItem) {
						itemResults = itemResults.concat(items)
						foundItem = true
					}
				}
			}
		}
		return itemResults
	}

	getItemsFromEntry(entry: ILootTableEntry) {
		// items must be an array because "loot_tables" returns multiple items
		let items: ItemStack[] = [createDefaultItemStack()]
		if (entry.type == 'item') {
			// If the type is "item" we can assume there will only be one item type
			items[0].identifier = entry.name ?? 'minecraft:air'
			const itemData = this.getDataFromFunctions(
				entry.functions ?? [],
				items[0].identifier
			)
			items[0].amount = itemData.amount ?? 1
			items[0].data = itemData.data
		} else if (entry.type == 'loot_table') {
			// TODO
		} else if (entry.type != 'empty')
			// "empty" doesn't need its own check because the default item is already "minecraft:air"
			this.warnings.push(
				`Invalid entry type: "${entry.type}" at entry name "${entry.name}"`
			)
		return items
	}

	getDataFromFunctions(
		functions: ILootTableFunction[],
		itemIdentifier: string
	) {
		const item = createDefaultItemStack()
		for (const func of functions) {
			if (func.function == 'set_count' && func.count) {
				if (typeof func.count !== 'number') {
					const randomAmount = randomInt(
						func.count.min,
						func.count.max
					)
					item.amount = randomAmount
				} else item.amount = func.count
			} else if (func.function == 'set_data' && func.data) {
				item.data.value = func.data
			} else if (func.function == 'specific_enchants' && func.enchants) {
				item.data.enchantments ??= []
				for (const enchant of func.enchants) {
					if (typeof enchant === 'string') {
						item.data.enchantments.push({
							id: enchant,
							level: 1,
						})
					} else item.data.enchantments.push(enchant)
				}
			} else if (func.function == 'enchant_randomly') {
				// TODO - Filter to enchants available for the item
				// TODO - Test how many enchants can randomly be applied
				// TODO - Could load these from json data
				item.data.enchantments ??= []
				const enchants = func.treasure
					? defaultEnchants.concat(treasureEnchants)
					: defaultEnchants
				const i = randomInt(0, enchants.length - 1)
				item.data.enchantments.push({
					id: enchants[i],
					level: randomInt(1, 3),
				})
			} else if (func.function == 'enchant_with_levels' && func.levels) {
				// TODO - Need to try and match enchantment table levels algorithm
			} else if (func.function == 'looting_enchant' && func.count) {
				// TODO - support inputs, need kill condition options, killed by looting
			} else if (
				func.function == 'random_block_state' &&
				func.block_state &&
				func.values
			) {
				item.data.blockStates ??= []
				item.data.blockStates.push({
					id: func.block_state,
					value: randomInt(func.values.min, func.values.max),
				})
			} else if (func.function == 'random_aux_value' && func.values) {
				item.data.itemAuxValue = randomInt(
					func.values.min,
					func.values.max
				)
			} else if (func.function == 'set_actor_id' && func.id) {
				if (
					itemIdentifier == 'minecraft:spawn_egg' ||
					itemIdentifier == 'spawn_egg'
				)
					item.data.eggIdentifier = func.id
				else
					this.warnings.push(
						`Cannot use "set_actor_id" on item "${itemIdentifier}", expected item "minecraft:spawn_egg"`
					)
			} else if (func.function == 'set_banner_details' && func.type) {
				if (
					itemIdentifier == 'minecraft:banner' ||
					itemIdentifier == 'banner'
				)
					item.data.bannerType = func.type
				else
					this.warnings.push(
						`Cannot use "set_banner_details" on item "${itemIdentifier}", expected item "minecraft:banner"`
					)
			} else if (
				func.function == 'set_book_contents' &&
				func.author &&
				func.title &&
				func.pages
			) {
				if (
					itemIdentifier == 'minecraft:book' ||
					itemIdentifier == 'book'
				) {
					item.data.bookData = {}
					item.data.bookData.author = func.author
					item.data.bookData.title = func.title
					item.data.bookData.pages = func.pages
				} else
					this.warnings.push(
						`Cannot use "set_book_contents on item "${itemIdentifier}", expected item "minecraft:book"`
					)
			} else if (func.function == 'set_damage' && func.damage) {
				if (typeof func.damage !== 'number') {
					const randomAmount = randomInt(
						func.damage.min,
						func.damage.max
					)
					item.data.durability = randomAmount
				} else item.data.durability = func.damage
			} else if (func.function == 'set_lore' && func.lore) {
				item.data.lore = func.lore
			} else if (func.function == 'set_name' && func.name) {
				item.data.displayName = func.name
			} else if (func.function == 'exploration_map' && func.destination) {
				item.data.mapDestination = func.destination
			} else if (unsupportedFunctions.includes(func.function)) {
				this.warnings.push(
					`"${func.function}" is not yet supported by the simulator`
				)
			} else {
				this.warnings.push(`Invalid loot function "${func.function}"`)
			}
		}

		return item
	}
}
