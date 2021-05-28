declare interface Test {
	/**
	 * Returns all players in the server
	 */
	getPlayers(): Player[]
	/**
	 * Returns an array of all entities at the given block location
	 */
	getEntitiesAtBlockLocation(position: BlockLocation): Entity[]
}

declare interface Container {
	/**
	 * Adds itemStack to the container at the given slot
	 * @param slot
	 * @param itemStack
	 */
	setItem(slot: number, itemStack: ItemStack): void
	/**
	 * Gets the itemStack at the given slot
	 * @param slot
	 */
	getItem(slot: number): ItemStack
	/**
	 * Adds the given itemStack to the first available slot of the container
	 * @param itemStack
	 */
	addItem(itemStack: ItemStack): void
	/**
	 * Transfers an ItemStack from fromSlot of the container to toSlot of toContainer
	 * @param fromSlot
	 * @param toSlot
	 * @param toContainer
	 */
	transferItem(fromSlot: number, toSlot: number, toContainer: Container): void
	/**
	 * Swaps ItemStacks between slot of the container and otherSlot of otherContainer
	 * @param slot
	 * @param otherSlot
	 * @param otherContainer
	 */
	swapItems(slot: number, otherSlot: number, otherContainer: Container): void
	/**
	 * Transforms the coordinates of given GameTest location to its corresponding world location
	 * @param position
	 * Position to transform
	 */
	worldLocation(position: BlockLocation): void
	/**
	 * Transforms the coordinates of given world location to its corresponding GameTest location
	 * @param worldPosition
	 * Position to transform
	 */
	relativeLocation(worldPosition: BlockLocation)
}

declare interface EntityComponent {
	/**
	 * The container of this component. Can only be used on the "inventory" component
	 */
	container: Container
}

declare interface Player {
	/**
	 * Gets the player's name
	 */
	name: string
}
