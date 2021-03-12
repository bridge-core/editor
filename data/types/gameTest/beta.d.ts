declare module 'Minecraft' {
	export const BlockLocation: BlockPositionClass
}

declare interface Test {
	/**
	 * Allows finer control over advanced test sequences
	 */
	startSequence(): Sequence

	/**
	 * The GameTest will succeed when the specified entity is found at the specified coordinates
	 * @param id
	 * The identifier of the entity to check for
	 * @param position
	 * The relative position to test for the actor
	 */
	succeedWhenEntityPresent(id: string, position: BlockPos): void
	/**
	 * The GameTest will succeed when the specified block is found at the specified coordinates
	 * @param id
	 * The block to check for
	 * @param position
	 * The relative position to test for the block
	 */
	succeedWhenBlockPresent(id: Block, position: BlockPos): void
	/**
	 * The GameTest will succeed when the specified amount of ticks has passed
	 * @param tick
	 * The tick to succed the test after
	 */
	succeedOnTick(tick: number): void
	/**
	 * The GameTest will succeed when the specified amount of ticks has passed and the `func` parameter calls an assert function
	 * @param tick
	 * @param func
	 */
	succeedOnTickWhen(tick: number, func: () => void): void
	/**
	 * When the `func` paramater calls an assert function the GameTest will succeed
	 * @param func
	 */
	succeedWhen(func: () => void): void

	/**
	 * When the `func` parameter calls an assert function the GameTest will fail
	 * @param func
	 */
	failIf(func: () => void): void

	/**
	 * Asserts an error when the specified entity is found at the specified coordinates
	 * @param id
	 * The identifier of the entity to check for
	 * @param position
	 * The relative position to test for the actor
	 */
	assertEntityPresent(id: string, position: BlockPos): void
	/**
	 * Asserts an error when the specified entity is not found at the specified coordinates
	 * @param id
	 * The identifier of the entity to check for
	 * @param position
	 * The relative position to test for the actor
	 */
	assertEntityNotPresent(id: string, position: BlockPos): void
	/**
	 * Asserts an error when the specified item stack is not found at the specified coordinates
	 * @param itemStack
	 * The item stack to test for
	 * @param position
	 * The position to test for the item stack
	 * @param amount
	 * The amount of items that should be in the stack
	 */
	assertItemEntityPresent(
		itemStack: ItemStack,
		position: BlockPos,
		amount: number
	): void
	/**
	 * Asserts an error when the specified block is not found at the specified coordinates
	 * @param id
	 * The block to check for
	 * @param position
	 * The relative position to test for the block
	 */
	assertBlockNotPresent(id: Block, position: BlockPos): void
	/**
	 * Asserts an error when the specified block at the specified coordinates has the block state
	 * @param block
	 * The block to check for
	 * @param data
	 * The data value of the block to test for
	 * @param position
	 * The relative position to test for the block
	 */
	assertBlockState(block: Block, data: number, position: BlockPos): void
	/**
	 * Asserts an error if there is an empty container at the specified coordinates
	 * @param position
	 * The relative position of the container to check
	 */
	assertContainerEmpty(position: BlockPos): void
	/**
	 * Asserts an error if there is a container with the specified item at the specified coordinates
	 * @param id
	 * The item to test for in the container
	 * @param position
	 * The relative position of the container to check
	 */
	assertContainerContains(id: string, position: BlockPos): void
	/**
	 * Asserts an error when the armor is found on the entity at the specified coordinates
	 * @param id
	 * The identifier of the entity to check for the armor on
	 * @param slot
	 * The slot of the entity to test for the item
	 * @param item
	 * The item to test for in the specified slot
	 * @param data
	 * The data value of the item
	 * @param position
	 * The position of the entity to test for the armor
	 * @param bool
	 * Unknown function of parameter...
	 */
	assertEntityHasArmor(
		id: string,
		slot: string,
		item: string,
		data: number,
		position: BlockPos,
		bool: boolean
	): void
	/**
	 * Asserts an error when the specified entity has the component
	 * @param id
	 * The identifier of the entity to test
	 * @param component
	 * The name of the component to test for
	 * @param position
	 * The position of the entity to test
	 * @param bool
	 * Unknown function of parameter...
	 */
	assertEntityHasComponent(
		id: string,
		component: string,
		position: BlockPos,
		bool: boolean
	): void

	/**
	 * Sets the specified entity at the specified coordinates
	 * @param id
	 * The entity identifier to set to tamed
	 * @param position
	 * The relative position to the entity to set tamed
	 */
	setEntityTamed(id: string, position: BlockPos): void
	/**
	 * Pulls a lever at the specified coordinates if there is one there
	 * @param position
	 * The relative position to pull the lever
	 */
	pullLever(position: BlockPos): void
}

declare interface Sequence {
	/**
	 * Causes the sequence to wait for the specified amount of time
	 * @param time
	 * The amount of time to wait for
	 */
	thenIdle(time: number): Sequence
	/**
	 * Causes the GameTest to succeed
	 */
	thenSucced(): void
}
