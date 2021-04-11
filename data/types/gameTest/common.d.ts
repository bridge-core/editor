declare module 'GameTest' {
	/**
	 * Registers a GameTest into Minecraft
	 * @param namespace
	 * Namespace of the GameTest. Should match the namespace of the mcstructure file
	 * @param identifier
	 * Identifier of the GameTest. Should match the identifier of the mcstructure file
	 */
	export function register(
		namespace: string,
		identifier: string,
		func: (test: Test) => void
	): TestRunner

	export const Tags: Tags
}

declare module 'Minecraft' {
	export const ItemStack: ItemStackClass
	export const Blocks: Blocks
	export const BlockStates: BlockStates
	export const BlockLocation: BlockLocationClass
}

declare interface TestRunner {
	/**
	 * Sets the maximum amount of ticks the GameTest must complete until it fails
	 * @param ticks
	 * The maximum amount of ticks
	 */
	maxTicks(ticks: number): TestRunner
	/**
	 * Sets the time of day when the GameTest is run. The time will be changed to the time set here when the GameTest is run
	 * @param time
	 * The time that the GameTest must take place in
	 */
	batch(time: 'night' | 'day'): TestRunner
	/**
	 * Sets the ticks at which the GameTest begins
	 * @param ticks
	 * The tick starting point
	 */
	setupTicks(ticks: number): TestRunner
	/**
	 * Sets a tag for the GameTest to be referenced in the "/gametest runall" command
	 * @param tag
	 * The tag of the GameTest
	 */
	tag(tag: any): TestRunner
	/**
	 * Sets the padding between GameTests being run
	 * @param time
	 * The duration of the padding
	 */
	padding(time: number): TestRunner
	/**
	 * Sets the structure name linked with this GameTest
	 * @param name
	 * Name of the structure
	 */
	structureName(name: string): TestRunner
	/**
	 * Sets the maximum number of times a test will try to rerun if it fails
	 * @param attempts
	 */
	maxAttempts(attempts: number): TestRunner
	/**
	 * Sets the number of successful test runs to be considered successful
	 * @param attempts
	 */
	requiredSuccessfulAttempts(attempts: number): TestRunner
	required(isRequired: boolean): TestRunner
}

declare interface Test {
	/**
	 * The GameTest will succeed when the given entity is found at the given coordinates
	 * @param id
	 * The identifier of the entity to check for
	 * @param position
	 * The relative position to test for the actor
	 */
	succeedWhenEntityPresent(id: string, position: BlockLocation): void
	/**
	 * The GameTest will succeed when the given entity is not found at the given coordinates
	 * @param id
	 * The identifier of the entity to check for
	 * @param position
	 * The relative position to test for the actor
	 */
	succeedWhenEntityNotPresent(id: string, position: BlockLocation): void
	/**
	 * The GameTest will succeed when the given block is found at the given coordinates
	 * @param id
	 * The block to check for
	 * @param position
	 * The relative position to test for the block
	 */
	succeedWhenBlockPresent(id: Block, position: BlockLocation): void
	/**
	 * The GameTest will succeed when the given amount of ticks has passed
	 * @param tick
	 * The tick to succed the test after
	 */
	succeedOnTick(tick: number): void
	/**
	 * The GameTest will succeed when the given amount of ticks has passed and the `func` parameter calls an assert function
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
	 * The GameTest will succeed when the given entity has the given component
	 * @param id
	 * The entity to test for
	 * @param component
	 * The component identififer to test for
	 * @param position
	 * The position of the entity to test for
	 * @param hasComponent
	 * Whether the entity should or shouldn't have the component
	 */
	succeedWhenEntityHasComponent(
		id: string,
		component: string,
		position: BlockLocation,
		hasComponent: boolean
	): void
	/**
	 * When this is called, the GameTest succeeds
	 */
	succeed(): void
	/**
	 * The GameTest will succeed when the specified block is found at the specified coordinates
	 * @param id
	 * The block to check for
	 * @param x
	 * x coordinate value relative to the structure block to check for the block
	 * @param y
	 * y coordinate value relative to the structure block to check for the block
	 * @param z
	 * z coordinate value relative to the structure block to check for the block
	 */
	succeedWhenBlockPresent(id: Block, position: BlockLocation): void
	/**
	 * When the `func` parameter calls an assert function the GameTest will fail
	 * @param func
	 */
	failIf(func: () => void): void
	/**
	 * Causes the GameTest to fail
	 * @param errorMessage
	 *
	 */
	fail(errorMessage: string): void

	/**
	 * Allows finer control over advanced test sequences
	 */
	startSequence(): Sequence

	runAtTickTime(tick: number, func: () => void)
	/**
	 * Runs the a function after the set delay
	 * @param ticks
	 * The amount of ticks that should pass until the function is run
	 * @param func
	 * The function that will be run when the delay has passed
	 */
	runAfterDelay(ticks: number, func: (test: Test) => void): void

	/**
	 * Places the specified block at the specified coordinates
	 * @param id
	 * The block to place
	 * @param position
	 * The relative position to place the block
	 */
	setBlock(id: Block, position: BlockLocation): void
	/**
	 * Presses a button at the specified coordinates if there is one there
	 * @param position
	 * The relative position to press the button
	 */
	pressButton(position: BlockLocation): void
	/**
	 * Kills all entities in the test
	 */
	killAllEntities(): void
	/**
	 * Pulls a lever at the given coordinates if there is one there
	 * @param position
	 * The relative position to pull the lever
	 */
	pullLever(position: BlockLocation): void

	/**
	 * Throws an Error if an entity matching the given identifier exists in the test region
	 * @param id
	 * The identifer of the entity to test for
	 */
	assertEntityPresentInArea(id: string): void
	/**
	 * Throws an Error if an entity matching the given identifier does not exist in the test region
	 * @param id
	 * The identifer of the entity to test for
	 */
	assertEntityNotPresentInArea(id: string): void
	/**
	 * Asserts an error when the given block at the given coordinates has the block state
	 * @param state
	 * The block state to test for
	 * @param stateValue
	 * The value of the state to test for
	 * @param position
	 * The relative position to test for the block
	 */
	assertBlockState(
		state: string,
		stateValue: number | string,
		position: BlockLocation
	): void
	/**
	 * Asserts an error when the given entity is not found at the given coordinates
	 * @param id
	 * The identifier of the entity to check for
	 * @param position
	 * The relative position to test for the actor
	 */
	assertEntityNotPresent(id: string, position: BlockLocation): void
	/**
	 * Asserts an error when the given item stack is found at the given coordinates
	 * @param itemStack
	 * The item stack to test for
	 * @param position
	 * The position to test for the item stack
	 * @param amount
	 * The amount of items that should be in the stack
	 */
	assertItemEntityPresent(
		item: Item,
		position: BlockLocation,
		amount: number
	): void
	/**
	 * Asserts an error when the given item is not found at the given coordinates
	 * @param itemStack
	 * The item stack to test for
	 * @param position
	 * The position to test for the item stack
	 * @param amount
	 * The amount of items that should be in the stack
	 */
	assertItemEntityNotPresent(
		item: Item,
		position: BlockLocation,
		amount: number
	): void
	/**
	 * Asserts an error when the given entity is found at the given coordinates
	 * @param id
	 * The identifier of the entity to check for
	 * @param position
	 * The relative position to test for the actor
	 */
	assertEntityPresent(id: string, position: BlockLocation): void
	/**
	 * Asserts an error if there is an empty container at the given coordinates
	 * @param position
	 * The relative position of the container to check
	 */
	assertContainerEmpty(position: BlockLocation): void
	/**
	 * Asserts an error if there is a container with the given item at the given coordinates
	 * @param itemStack
	 * The item stack to test for in the container
	 * @param position
	 * The relative position of the container to check
	 */
	assertContainerContains(itemStack: ItemStack, position: BlockLocation): void
	/**
	 * Asserts an error when the given block is not found at the given coordinates
	 * @param id
	 * The block to check for
	 * @param position
	 * The relative position to test for the block
	 */
	assertBlockNotPresent(id: Block, position: BlockLocation): void
	/**
	 * Asserts an error when the specified block is found at the specified coordinates
	 * @param id
	 * The block to check for
	 * @param position
	 * The relative position to test for the block
	 */
	assertBlockPresent(id: Block, position: BlockLocation): void
}

declare interface BlockLocationClass {
	/**
	 * Creates a block position
	 */
	new (x: number, y: number, z: number): BlockLocation
}
declare interface BlockLocation {
	/**
	 * Returns the block position it was called on but increases the y coordinate by 1
	 */
	above(): BlockLocation
	/**
	 * Offsets the position of the BlockLocation by the values given
	 * @param x
	 * The x position to offset the position by
	 * @param y
	 * The y position to offset the position by
	 * @param z
	 * The z position to offset the position by
	 */
	offset(x: number, y: number, z: number): BlockLocation
	/**
	 * Compares this BlockLocation to another given BlockLocation and returns true if they are the same
	 * @param other
	 * The other BlockLocation to compare this on with
	 */
	equals(other: BlockLocation): boolean
}

declare interface ItemStack {}

declare interface BlockStates {
	// TODO - Script to generate block state methods
	topSlotBit(data: boolean): State
}

declare interface Blocks {
	/**
	 * Fetches the requested block and returns it, if the block doesn't exist, this returns null
	 * @param id
	 * The identifier of the block to get
	 */
	get(id: string): Block | null
	air(): Block
}

declare interface Block {
	setState(state: State): Block
}

declare interface Item {}

declare interface State {}

declare interface Tags {
	suiteDefault: string
	suiteBroken: string
	suiteAll: string
	suiteDebug: string
}

declare interface Sequence {
	/**
	 * Causes the sequence to wait for the given amount of time
	 * @param time
	 * The amount of time to wait for
	 */
	thenIdle(time: number): Sequence
	/**
	 * Executes the function when called
	 * @param func
	 */
	thenExecute(func: () => void): Sequence
	/**
	 * Executes the function after the time given when called
	 * @param time
	 * The amount of time until the function is called
	 * @param func
	 */
	thenExecuteAfter(time: number, func: () => void): Sequence
	/**
	 * Causes the sequence to wait until the function asserts an error
	 * @param func
	 */
	thenWait(func: () => void): Sequence
	/**
	 * Causes the sequence to wait until the function asserts an error and the delay has passed
	 * @param delayTicks
	 * The amount of ticks to wait
	 * @param func
	 */
	thenWaitWithDelay(delayTicks: number, func: () => void): Sequence
	/**
	 * Causes the GameTest to succeed
	 */
	thenSucceed(): void
}
