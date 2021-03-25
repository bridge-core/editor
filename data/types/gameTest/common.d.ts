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
}

declare interface Test {
	/**
	 * Runs the a function after the set delay
	 * @param ticks
	 * The amount of ticks that should pass until the function is run
	 * @param func
	 * The function that will be run when the delay has passed
	 */
	runAfterDelay(ticks: number, func: (test: Test) => void): void
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
	succeedWhenBlockPresent(id: string, position: BlockPos): void

	/**
	 * Asserts an error when the specified block is found at the specified coordinates
	 * @param id
	 * The block to check for
	 * @param position
	 * The relative position to test for the block
	 */
	assertBlockPresent(id: string, position: BlockPos): void

	/**
	 * Places the specified block at the specified coordinates
	 * @param id
	 * The block to place
	 * @param position
	 * The relative position to place the block
	 */
	setBlock(id: string, position: BlockPos): void
	/**
	 * Presses a button at the specified coordinates if there is one there
	 * @param position
	 * The relative position to press the button
	 */
	pressButton(position: BlockPos): void
}

declare interface BlockPositionClass {
	/**
	 * Creates a block position
	 */
	new (x: number, y: number, z: number): BlockPos
}
declare interface BlockPos {
	/**
	 * Returns the block position it was called on but increases the y coordinate by 1
	 */
	above(): BlockPos
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

declare interface Item {}

declare interface State {}
