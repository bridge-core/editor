import { BaseWindow } from '/@/components/Windows/BaseWindow'
import LootTableSimulatorComponent from './SimulatorSettings.vue'

export interface ILootSimulatorSettings {
	/**
	 * Current repeat option
	 */
	currentRepeatUntilOption: string
	/**
	 * Repeat values for each available option
	 */
	repeat: {
		amount: number
		/**
		 * Item identifier to search for
		 */
		itemFound: string
		/**
		 * Number for quantity, "any" for any quantity
		 */
		quantityFound: number | string
	}
	/**
	 * Conditions for dropping the loot table
	 */
	killConditions: {
		/**
		 * Set to 0 for no looting
		 */
		looting: number
	}
}

export class LootTableSimulatorWindow extends BaseWindow {
	public settings: ILootSimulatorSettings = this.getDefaultSettings()

	protected repeatUntilOptions: string[] = ['itemFound', 'amount']
	protected repeatRules = {
		// TODO translate strings
		amount: [
			(val: string) => !!val || 'Repeat value is required',
			(val: string) =>
				!isNaN(Number(val)) || 'Repeat value must be a number',
			(val: string) =>
				Number(val) <= 1000 || 'Repeat value must be less than 1000',
		],
		itemFound: [(val: string) => !!val || 'Item identifier is required'],
		quantityFound: [
			(val: string) => !!val || 'Quantity is required',
			(val: string) =>
				!isNaN(Number(val)) ||
				val === 'any' ||
				'Quantity must be a number, or "any"',
		],
	}

	constructor() {
		super(LootTableSimulatorComponent, false)
		this.defineWindow()
	}

	get hasRequiredData() {
		if (this.settings.currentRepeatUntilOption === 'amount')
			return this.repeatRules.amount.every(
				(rule) => rule(this.settings.repeat.amount.toString()) === true
			)
		else if (this.settings.currentRepeatUntilOption === 'itemFound')
			return this.repeatRules.itemFound.every(
				(rule) =>
					rule(this.settings.repeat.itemFound.toString()) === true
			)
		else
			return this.repeatRules.quantityFound.every(
				(rule) =>
					rule(this.settings.repeat.quantityFound.toString()) === true
			)
	}

	getDefaultSettings() {
		return {
			repeat: {
				amount: 1,
				itemFound: 'minecraft:air',
				quantityFound: 'any',
			},
			killConditions: {
				looting: 0,
			},
			currentRepeatUntilOption: 'amount',
		}
	}
}
