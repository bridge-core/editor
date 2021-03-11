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
}

declare module 'Minecraft' {
	export const BlockLocation: BlockLocationClass
	export const ItemStack: ItemStackClass

	export const Blocks: Blocks
	export const BlockStates: BlockStates
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
	tag(tag: string): TestRunner
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
}

declare interface Test {
	/**
	 * Allows finer control over advanced test sequences
	 */
	startSequence(): Sequence
	/**
	 * Runs the a function after the set delay
	 * @param ticks
	 * The amount of ticks that should pass until the function is run
	 * @param func
	 * The function that will be run when the delay has passed
	 */
	runAfterDelay(ticks: number, func: () => void): void
	/**
	 * When this is called, the GameTest succeeds
	 */
	succeed(): void
	/**
	 * When the `func` paramater calls an assert function the GameTest will succeed
	 * @param func
	 */
	succeedWhen(func: () => void): void
	/**
	 * The GameTest will succeed when the specified entity is found at the specified coordinates
	 * @param id
	 * The identifier of the entity to check for
	 * @param position
	 * The relative position to test for the actor
	 */
	succeedWhenActorPresent(id: string, position: BlockLocation): void
	/**
	 * The GameTest will succeed when the specified block is found at the specified coordinates
	 * @param id
	 * The block to check for
	 * @param position
	 * The relative position to test for the block
	 */
	succeedWhenBlockPresent(id: Block, position: BlockLocation): void
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
	succeeOnTickWhen(tick: number, func: () => void): void

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
	assertEntityPresent(id: string, position: BlockLocation): void
	/**
	 * Asserts an error when the specified entity is not found at the specified coordinates
	 * @param id
	 * The identifier of the entity to check for
	 * @param position
	 * The relative position to test for the actor
	 */
	assertEntityNotPresent(id: string, position: BlockLocation): void
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
		position: BlockLocation,
		amount: number
	): void
	/**
	 * Asserts an error when the specified block is found at the specified coordinates
	 * @param id
	 * The block to check for
	 * @param position
	 * The relative position to test for the block
	 */
	assertBlockPresent(id: Block, position: BlockLocation): void
	/**
	 * Asserts an error when the specified block is not found at the specified coordinates
	 * @param id
	 * The block to check for
	 * @param position
	 * The relative position to test for the block
	 */
	assertBlockNotPresent(id: Block, position: BlockLocation): void
	/**
	 * Asserts an error when the specified block at the specified coordinates has the block state
	 * @param block
	 * The block to check for
	 * @param data
	 * The data value of the block to test for
	 * @param position
	 * The relative position to test for the block
	 */
	assertBlockState(block: Block, data: number, position: BlockLocation): void
	/**
	 * Asserts an error if there is an empty container at the specified coordinates
	 * @param position
	 * The relative position of the container to check
	 */
	assertContainerEmpty(position: BlockLocation): void
	/**
	 * Asserts an error if there is a container with the specified item at the specified coordinates
	 * @param id
	 * The item to test for in the container
	 * @param position
	 * The relative position of the container to check
	 */
	assertContainerContains(id: string, position: BlockLocation): void
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
		position: BlockLocation,
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
		position: BlockLocation,
		bool: boolean
	): void

	/**
	 * Spawns the specified entity at the specified coordinates
	 * @param id
	 * The identifier of the entity to spawn
	 * @param position
	 * The relative position to spawn the entity
	 */
	spawn(id: string, position: BlockLocation): void
	/**
	 * Places the specified block at the specified coordinates
	 * @param id
	 * The block to place
	 * @param position
	 * The relative position to place the block
	 */
	setBlock(id: Block, position: BlockLocation): void
	/**
	 * Sets the specified entity at the specified coordinates
	 * @param id
	 * The entity identifier to set to tamed
	 * @param position
	 * The relative position to the entity to set tamed
	 */
	setEntityTamed(id: string, position: BlockLocation): void
	/**
	 * Presses a button at the specified coordinates if there is one there
	 * @param position
	 * The relative position to press the button
	 */
	pressButton(position: BlockLocation): void
	/**
	 * Pulls a lever at the specified coordinates if there is one there
	 * @param position
	 * The relative position to pull the lever
	 */
	pullLever(position: BlockLocation): void
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
}

declare interface ItemStackClass {
	/**
	 * Creates a an item stack
	 */
	new (item: Block): ItemStack
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
	// TODO - Script to generate all block methods
	air(): Block
}

declare interface Block {
	setState(state: State): Block
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

declare interface Item {}

declare interface State {}
