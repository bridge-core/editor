export interface ItemStack {
	identifier: string
	amount: number
	data: {
		value?: number
		enchantments?: IEnchantment[]
		blockStates?: IBlockState[]
		itemAuxValue?: number
		eggIdentifier?: string
		bannerType?: number
		bookData?: {
			author?: string
			title?: string
			pages?: string[]
		}
		durability?: number
		lore?: string[]
		displayName?: string
		mapDestination?: string
	}
}

export function createDefaultItemStack(): ItemStack {
	return {
		identifier: 'minecraft:air',
		amount: 1,
		data: {},
	}
}

export interface IEnchantment {
	id: string
	level: [number, number] | number
}

interface IBlockState {
	id: string
	value: number
}
