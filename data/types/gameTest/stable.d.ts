declare module 'Minecraft' {
	export const BlockPos: BlockPositionClass
}

declare interface Test {
	/**
	 * Asserts an error when the specified entity is found at the specified coordinates
	 * @param id
	 * The identifier of the entity to check for
	 * @param position
	 * The relative position to test for the actor
	 */
	assertActorPresent(id: string, position: BlockPos): void
	/**
	 * Asserts an error when the specified entity is not found at the specified coordinates
	 * @param id
	 * The identifier of the entity to check for
	 * @param position
	 * The relative position to test for the actor
	 */
	assertActorNotPresent(id: string, position: BlockPos): void
	/**
	 * Asserts an error when the specified item stack is not found at the specified coordinates
	 * @param itemStack
	 * The item stack to test for
	 * @param position
	 * The position to test for the item stack
	 * @param amount
	 * The amount of items that should be in the stack
	 */
	assertItemActorPresent(
		itemStack: ItemStack,
		position: BlockPos,
		amount: number
	): void

	/**
	 * The GameTest will succeed when the specified entity is found at the specified coordinates
	 * @param id
	 * The identifier of the entity to check for
	 * @param position
	 * The relative position to test for the actor
	 */
	succeedWhenActorPresent(id: string, position: BlockPos): void

	/**
	 * When the `func` paramater calls an assert function the GameTest will succeed
	 * @param func
	 */
	succeedWhen(func: (test: Test) => void): void

	/**
	 * When the `func` parameter calls an assert function the GameTest will fail
	 * @param func
	 */
	failIf(func: (test: Test) => void): void
}
