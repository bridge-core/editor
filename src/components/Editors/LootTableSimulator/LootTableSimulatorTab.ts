import { PreviewTab } from '/@/components/TabSystem/PreviewTab'
import LootTableSimulatorTabComponent from './LootTableSimulatorTab.vue'
import { ItemStack } from './lootTable/itemStack'
import { LootTablePool } from './lootTable/pool'
import json5 from 'json5'
import { SimpleAction } from '/@/components/Actions/SimpleAction'
import { LootTableSimulatorWindow } from './settings/SimulatorSettings'

interface ILootTableSimulatorState {
	counters: {
		table: number
		pool: number
	}
	conditionMet: boolean
}

export class LootTableSimulatorTab extends PreviewTab {
	public component = LootTableSimulatorTabComponent

	protected pools: LootTablePool[] = []
	public result: ItemStack[] = []
	public warnings: string[] = []
	protected selectedItemStack?: ItemStack
	protected state: ILootTableSimulatorState = {
		counters: { pool: 0, table: 0 },
		conditionMet: false,
	}

	protected settingsWindow: LootTableSimulatorWindow = new LootTableSimulatorWindow()

	get icon() {
		return 'mdi-play'
	}
	get iconColor() {
		return 'primary'
	}

	async onChange() {
		// TODO: Test - does the simulator update when the source file is updated?
		console.log('onChange')
		this.pools = []
		this.warnings = []
		const file = await this.getFile()
		const data = await file.text()
		let pools = []
		try {
			pools = json5.parse(data).pools ?? []
		} catch {}
		for (const pool of pools) {
			this.pools.push(new LootTablePool(pool))
		}
		// Update the warnings but not the output when the file changes
		for (const pool of this.pools) {
			pool.selectEntry()
			this.updateWarnings(pool.warnings)
		}
	}
	async reload() {
		this.reset()
		await this.onChange()
	}

	onCreate() {
		this.registerActions()
	}
	registerActions() {
		this.actions = []
		this.addAction(
			new SimpleAction({
				icon: 'mdi-play',
				name: '[Run]',
				onTrigger: () => {
					this.reset()
					this.loopPools()
				},
			}),
			new SimpleAction({
				icon: 'mdi-cog',
				name: 'actions.settings.name',
				onTrigger: () => this.settingsWindow.open(),
			}),
			new SimpleAction({
				icon: 'mdi-refresh',
				name: 'general.clear',
				onTrigger: () => this.reload(),
			})
		)
	}

	reset() {
		this.result = []
		this.warnings = []
		this.selectedItemStack = undefined
		this.state = {
			counters: { pool: 0, table: 0 },
			conditionMet: false,
		}
	}
	updateWarnings(warnings: string[]) {
		this.warnings = this.warnings.concat(warnings)
		this.warnings = [...new Set(this.warnings)]
	}
	loopPools() {
		// Repeat loot table execution until condition is met, returns true if the condition was met and false if it was never met
		const repeatUntil = () => {
			const repeatOption = this.settingsWindow.settings
				.currentRepeatUntilOption
			// Reset counters
			this.state.counters.table = 0
			this.state.counters.pool = 0
			// Run until item/quantity found mode
			if (repeatOption === 'itemFound') {
				// Set identifier to be searched for, remove namespace
				const searchIdentifier = this.settingsWindow.settings.repeat.itemFound
					.split(':')
					.pop()
				// Store whether the condition was met so we can finish the current run of the loot table and then end the execution
				let found = false
				// Run maximum 1000 times
				while (this.state.counters.table < 1000) {
					this.result = []
					this.state.counters.table++
					// Iterate each pool of the table
					for (const pool of this.pools) {
						if (!found) this.state.counters.pool++
						// Select an entry from the pool
						const output = pool.selectEntry()
						// Update the warnings from the output
						this.updateWarnings(pool.warnings)
						// Iterate the output to check if the item/quantity has been found
						for (const item of output) {
							// Check whether the quantity condition is met
							const quantityTarget = isNaN(
								Number(
									this.settingsWindow.settings.repeat
										.quantityFound
								)
							)
								? true
								: item.amount ===
								  Number(
										this.settingsWindow.settings.repeat
											.quantityFound
								  )
							// Check whether the item condition is met
							const itemTarget =
								item.identifier.split(':').pop() ===
								searchIdentifier

							if (quantityTarget && itemTarget) found = true
						}
						this.result = this.result.concat(output)
					}
					if (found) return true
					// Reset pool counter after every table run
					this.state.counters.pool = 0
				}
			} else {
				// Repeat set amount of times mode
				for (
					let i = 0;
					i < this.settingsWindow.settings.repeat.amount;
					i++
				) {
					this.result = []
					this.state.counters.table++
					this.state.counters.pool = 0
					for (const pool of this.pools) {
						this.state.counters.pool++
						this.result = this.result.concat(pool.selectEntry())
						this.updateWarnings(pool.warnings)
					}
				}
				return true
			}
		}
		// Set the conditionMet property to true if the condition was met and false if it was never met
		this.state.conditionMet = repeatUntil() ?? false
	}
}
