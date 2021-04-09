declare interface Test {
	/**
	 * Spawns the specified entity at the specified coordinates
	 * @param id
	 * The identifier of the entity to spawn
	 * @param position
	 * The relative position to spawn the entity
	 */
	spawn(id: string, position: BlockLocation): void
}

declare interface ItemStackClass {
	/**
	 * Creates a an item stack
	 */
	new (item: Block): ItemStack
}
