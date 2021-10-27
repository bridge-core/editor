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

export function createDefaultItemStack() {
	const item: ItemStack = {
		identifier: 'minecraft:air',
		amount: 1,
		data: {},
	}
	return item
}

interface IEnchantment {
	id: string
	level: number
}

interface IBlockState {
	id: string
	value: number
}
