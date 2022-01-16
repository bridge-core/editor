import { functionData } from './data'
import { createDefaultItemStack, ItemStack } from './itemStack'
import { ILootTableEntry, ILootTableFunction } from './interfaces'
import { randomInt } from '/@/utils/math/randomInt'
import { deepMerge } from 'bridge-common-utils'

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
		let item = createDefaultItemStack()
		const functionNames = Object.keys(functionData)
		for (const func of functions) {
			if (functionNames.includes(func.function)) {
				const result = functionData[func.function](func, itemIdentifier)
				if (result && result.item) item = deepMerge(item, result.item)
				if (result && result.warnings)
					this.warnings.concat(result.warnings)
			} else
				this.warnings.push(`Invalid loot function "${func.function}"`)
		}
		return item
	}
}
