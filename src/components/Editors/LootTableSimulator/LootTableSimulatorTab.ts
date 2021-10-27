import { PreviewTab } from '/@/components/TabSystem/PreviewTab'
import LootTableSimulatorTabComponent from './LootTableSimulatorTab.vue'
import { ItemStack } from './lootTable/itemStack'
import { LootTablePool } from './lootTable/pool'
import json5 from 'json5'
import { SimpleAction } from '/@/components/Actions/SimpleAction'
import { LootTableSimulatorWindow } from './settings/SimulatorSettings'

export class LootTableSimulatorTab extends PreviewTab {
	public component = LootTableSimulatorTabComponent

	protected pools: LootTablePool[] = []
	public result: ItemStack[] = []
	public warnings: string[] = []
	protected selectedItemStack: ItemStack | undefined
	protected counters: any = {
		table: 0,
		pool: 0,
	}

	protected settingsWindow: LootTableSimulatorWindow = new LootTableSimulatorWindow()

	get icon() {
		return 'mdi-play'
	}
	get iconColor() {
		return 'primary'
	}

	async onChange() {
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
		this.warnings = []
		this.result = []
		this.selectedItemStack = undefined
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
					this.result = []
					this.warnings = []
					this.selectedItemStack = undefined
					this.counters = {
						table: 0,
						pool: 0,
					}
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

	updateWarnings(warnings: string[]) {
		this.warnings = this.warnings.concat(warnings)
		this.warnings = [...new Set(this.warnings)]
	}
	loopPools() {
		const repeatUntil = () => {
			this.counters.table = 0
			this.counters.pool = 0
			while (this.counters.table < 1000) {
				this.counters.table++
				for (const pool of this.pools) {
					this.counters.pool++
					const output = pool.selectEntry()
					this.updateWarnings(pool.warnings)

					console.log(
						'quantityFound val',
						this.settingsWindow.settings.repeat.quantityFound
					)
					console.log()
					for (const item of output) {
						console.log('item', item)
						console.log(
							this.settingsWindow.settings.repeat
								.quantityFound === 'any'
								? item.identifier ===
										this.settingsWindow.settings.repeat
											.itemFound
								: item.amount ===
										this.settingsWindow.settings.repeat
											.quantityFound &&
										item.identifier ===
											this.settingsWindow.settings.repeat
												.itemFound
						)
						// TODO
						if (
							this.settingsWindow.settings.repeat
								.quantityFound === 'any'
								? item.identifier ===
								  this.settingsWindow.settings.repeat.itemFound
								: item.amount ===
										this.settingsWindow.settings.repeat
											.quantityFound &&
								  item.identifier ===
										this.settingsWindow.settings.repeat
											.itemFound
						)
							return true
					}
				}
				this.counters.pool = 0
			}
			return false
		}
		// Check repeat settings
		console.log(
			'currentRepeatUntilOption',
			this.settingsWindow.settings.currentRepeatUntilOption ===
				'foundItem'
		)
		if (
			this.settingsWindow.settings.currentRepeatUntilOption ===
			'foundItem'
		) {
			console.log('repeatUntil', repeatUntil())
			console.log('poolCounter', this.counters.pool)
			console.log('tableCounter', this.counters.table)
		} else {
			for (
				let i = 0;
				i < this.settingsWindow.settings.repeat.amount;
				i++
			) {
				this.result = []
				for (const pool of this.pools) {
					this.result = this.result.concat(pool.selectEntry())
					this.updateWarnings(pool.warnings)
				}
			}
		}
	}
}
