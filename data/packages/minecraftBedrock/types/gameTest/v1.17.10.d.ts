// GameTest module

declare module 'GameTest' {
	/**
	 * Registers a new GameTest function. This GameTest will become available in Minecraft via /gametest run [testClassName]:[testName].
	 * @param testClassName
	 * Name of the class of tests this test should be a part of.
	 * @param testName
	 * Name of this specific test.
	 * @param testFunction
	 * Implementation of the test function.
	 */
	export function register(
		testClassName: string,
		testName: string,
		testFunction: (test: Helper) => void
	): RegistrationBuilder

	export const Tags: Tags
}

declare interface Tags {
	suiteDefault: string
	suiteDisabled: string
	suiteAll: string
	suiteDebug: string
}

declare interface RegistrationBuilder {
	/**
	 * Sets the batch for the test to run in.
	 * @param batchName
	 * Name of the batch for the test.
	 */
	batch(batchName: 'night' | 'day'): RegistrationBuilder

	required(isRequired: boolean): RegistrationBuilder

	/**
	 * Sets the number of successful test runs to be considered successful.
	 * @param attemptCount
	 */
	requiredSuccessfulAttempts(attemptCount: number): RegistrationBuilder

	/**
	 * Sets the maximum number of times a test will try to rerun if it fails.
	 * @param attemptCount
	 */
	maxAttempts(attemptCount: number): RegistrationBuilder

	/**
	 * Sets the maximum number of ticks a test will run for before timing out and failing.
	 * @param tickCount
	 */
	maxTicks(tickCount: number): RegistrationBuilder

	/**
	 * Sets the number of ticks for a test to wait before executing when the structure is spawned.
	 * @param tickCount
	 */
	setupTicks(tickCount: number): RegistrationBuilder

	/**
	 * Sets the name of the structure for a test to use. "Foo:bar" will load /structures/Foo/bar.mcstructure from the behavior pack.
	 * @param structureName
	 */
	structureName(structureName: string): RegistrationBuilder

	padding(paddingBlocks: number): RegistrationBuilder

	/**
	 * Adds a tag to a test. You can run all tests with a given tag with /gametest runall <tag>.
	 * @param tag
	 */
	tag(tag: string): RegistrationBuilder
}

declare interface GameTestSequence {
	/**
	 * Runs the given callback as a step within a GameTest sequence. Exceptions thrown within the callback will end sequence execution.
	 * @param callback
	 * Callback function to execute.
	 */
	thenExecute(callback: () => undefined): GameTestSequence

	/**
	 * After a delay, runs the given callback as a step within a GameTest sequence. Exceptions thrown within the callback will end sequence execution.
	 * @param delayTicks
	 * Number of ticks to wait before executing the callback.
	 * @param callback
	 * Callback function to execute.
	 */
	thenExecuteAfter(
		delayTicks: number,
		callback: () => undefined
	): GameTestSequence

	/**
	 * Causes the test to fail if this step in the GameTest sequence is reached.
	 * @param errorMessage
	 * Error message summarizing the failure condition.
	 */
	thenFail(errorMessage: string): void

	/**
	 * Idles the GameTest sequence for the specified delayTicks.
	 * @param delayTicks
	 * Number of ticks to delay for this step in the GameTest sequence.
	 */
	thenIdle(delayTicks: number): GameTestSequence

	/**
	 * Marks the GameTest a success if this step is reached in the GameTest sequence.
	 */
	thenSucceed(): void

	/**
	 * Executes the given callback every tick until it succeeds. Exceptions thrown within the callback will end sequence execution.
	 * @param callback
	 * Testing callback function to execute. Typically, this function will have .assertXyz functions within it.
	 */
	thenWait(callback: () => undefined): GameTestSequence

	thenWaitWithDelay(
		delayTicks: number,
		callback: () => undefined
	): GameTestSequence

	/**
	 * Repeatedly calls the callback for the specified number of ticks.
	 */
	thenExecuteFor(
		delayTicks: number,
		callback: () => undefined
	): GameTestSequence
}

declare interface Helper {
	assertBlockTypePresent(block: Block, position: BlockLocation): void

	assertBlockTypeNotPresent(block: Block, position: BlockLocation): void

	assertBlockState(
		blockStateName: string,
		stateValue: number,
		position: BlockLocation
	): void

	/**
	 * Tests that the condition specified in condition is true. If not, an error with the specified message is thrown.
	 * @param condition
	 * Expression of the condition to evaluate.
	 * @param message
	 * Message that is passed if the condition does not evaluate to true.
	 */
	assert(condition: boolean, message: string): void

	/**
	 * Tests that a container (e.g., a chest) at the specified location contains a particular type of item. If not, an error is thrown.
	 * @param itemStack
	 * Basic description of the items to check for. The specified container must contain at least the set of items defined in this itemStack.
	 * @param position
	 * Location of the block with a container (for example, a chest.)
	 */
	assertContainerContains(itemStack: ItemStack, position: BlockLocation): void

	/**
	 * Tests that a container (e.g., a chest) at the specified location is empty. If not, an error is thrown.
	 * @param position
	 * Location of the block with a container (for example, a chest.)
	 */
	assertContainerEmpty(position: BlockLocation): void

	/**
	 * Tests that an entity (e.g., a skeleton) at the specified location has a particular piece of data. If not, an error is thrown.
	 * @param position
	 * Location of the entity to look for.
	 * @param entityIdentifier
	 * Identifier of the entity (e.g., 'minecraft:skeleton') to look for.
	 * @param callback
	 * Callback function where facets of the selected entity can be tested for. If this callback function returns false, an error is thrown.
	 *
	 * @example
	 * test.assertEntityData(
	 *		villagerPos,
	 *		"minecraft:villager",
	 *		(entity) => entity.getEffect(Effects.regeneration).getDuration() > 120
	 * ); // At least 6 seconds remaining in the villagers' effect
	 */
	assertEntityData(
		position: BlockLocation,
		entityIdentifier: string,
		callback: (entity: Entity) => boolean
	): void

	/**
	 * Tests that an entity has a specific piece of armor equipped. If not, an error is thrown.
	 * @param entityIdentifier
	 * @param armorSlot
	 * @param armorName
	 * @param armorData
	 * @param position
	 * Location of the entity with armor to test for.
	 * @param hasArmor
	 */
	assertEntityHasArmor(
		entityIdentifier: string,
		armorSlot: number,
		armorName: string,
		armorData: number,
		position: BlockLocation,
		hasArmor: boolean
	): void

	/**
	 * Tests that an entity has a particular component. If not, an error is thrown.
	 * @param entityIdentifier
	 * Identifier of the specified entity (e.g., 'minecraft:skeleton'). If the namespace is not specified, 'minecraft:' is assumed.
	 * @param componentIdentifier
	 * Identifier of the component to check for.
	 * @param position
	 * Location of the block with a container (for example, a chest.)
	 * @param hasComponent
	 * Determines whether to test that the component exists, or does not.
	 */
	assertEntityHasComponent(
		entityIdentifier: string,
		componentIdentifier: keyof EntityComponents,
		position: BlockLocation,
		hasComponent: boolean
	): void

	/**
	 * Tests that a particular entity is still present and alive within the GameTest area. If not, an error is thrown.
	 * @param entity
	 * Specific entity to test for.
	 */
	assertEntityInstancePresent(entity: Entity): void

	/**
	 * Tests that a particular entity is not present at a particular location. If not, an error is thrown.
	 * @param entityIdentifier
	 * Type of entity to test for (e.g., 'minecraft:skeleton'). If an entity namespace is not specified, 'minecraft:' is assumed.
	 * @param position
	 * Location of the entity to test for.
	 */
	assertEntityNotPresent(
		entityIdentifier: string,
		position: BlockLocation
	): void

	/**
	 * Tests that a particular entity is not present within the GameTest area. If not, an error is thrown.
	 * @param entityIdentifier
	 * Type of entity to test for (e.g., 'minecraft:skeleton'). If an entity namespace is not specified, 'minecraft:' is assumed.
	 */
	assertEntityNotPresentInArea(entityIdentifier: string): void

	/**
	 * Tests that a particular entity is not touching or connected to another entity.
	 * @param entityIdentifier
	 * Type of entity to test for (e.g., 'minecraft:skeleton'). If an entity namespace is not specified, 'minecraft:' is assumed.
	 * @param position
	 * Location of the entity to test for.
	 */
	assertEntityNotTouching(entityIdentifier: string, position: Location): void

	/**
	 * Tests that a particular entity is present at a particular location. If not, an error is thrown.
	 * @param entityIdentifier
	 * Type of entity to test for (e.g., 'minecraft:skeleton'). If an entity namespace is not specified, 'minecraft:' is assumed.
	 * @param position
	 * Location of the entity to test for.
	 */
	assertEntityPresent(entityIdentifier: string, position: BlockLocation): void

	/**
	 * Tests that a particular entity is present within the GameTest area. If not, an error is thrown.
	 * @param entityIdentifier
	 * Type of entity to test for (e.g., 'minecraft:skeleton'). If an entity namespace is not specified, 'minecraft:' is assumed.
	 */
	assertEntityPresentInArea(entityIdentifier: string): void

	/**
	 * Tests that a particular entity is touching or connected to another entity.
	 * @param entityIdentifier
	 * Type of entity to test for (e.g., 'minecraft:skeleton'). If an entity namespace is not specified, 'minecraft:' is assumed.
	 * @param position
	 * Location of the entity to test for.
	 */
	assertEntityTouching(entityIdentifier: string, position: Location): void

	/**
	 * Tests that a block at a location has some water at it. If not, an error is thrown.
	 * @param position
	 * Location of the block to test for.
	 * @param isWaterlogged
	 * Determines whether to test for the presence of water at the position, or to test whether there is no water at the specified position.
	 */
	assertIsWaterlogged(position: BlockLocation, isWaterlogged: boolean): void

	/**
	 * Tests that items of a particular type and count are present within an area. If not, an error is thrown.
	 * @param itemType
	 * Type of item to look for.
	 * @param position
	 * Location to search around for the specified set of items.
	 * @param searchDistance
	 * Range, in blocks, to aggregate a count of items around. If 0, will only search the particular block at position.
	 * @param count
	 * Number of items, at minimum, to look and test for.
	 */
	assertItemEntityCountIs(
		itemType: ItemType,
		position: BlockLocation,
		searchDistance: number,
		count: number
	): void

	/**
	 * Tests that a particular item entity is not present at a particular location. If it is, an exception is thrown.
	 * @param itemType
	 * Type of item to test for.
	 * @param position
	 * @param searchDistance
	 * Radius in blocks to look for the item entity.
	 */
	assertItemEntityNotPresent(
		itemType: ItemType,
		position: BlockLocation,
		searchDistance: number
	): void

	/**
	 * Tests that a particular item entity is present at a particular location. If not, an exception is thrown.
	 * @param itemType
	 * Type of item to test for.
	 * @param position
	 * @param searchDistance
	 * Radius in blocks to look for the item entity.
	 */
	assertItemEntityPresent(
		itemType: ItemType,
		position: BlockLocation,
		searchDistance: number
	): void

	/**
	 * Tests that Redstone power at a particular location matches a particular value. If not, an exception is thrown.
	 * @param position
	 * @param power
	 * Expected power level.
	 */
	assertRedstonePower(position: BlockLocation, power: number): void

	/**
	 * Marks the current test as a failure case.
	 * @param errorMessage
	 * Error message summarizing the failure condition.
	 */
	fail(errorMessage: string): void

	/**
	 * Registers a callback to run. The test will fail if this callback does not fail/assert. Note: The callback takes a single parameter, Helper, which is created each time the callback is called.
	 * @param callback
	 */
	failIf(callback: () => undefined): void

	/**
	 * Kills all entities within the GameTest structure.
	 */
	killAllEntities(): void

	/**
	 * Presses a button at a position. Note: Will error if button is not present.
	 * @param position
	 */
	pressButton(position: BlockLocation): void

	/**
	 * Displays the specified message to all players.
	 * @param text
	 * Message to display.
	 */
	print(text: string): void

	/**
	 * Pulls a lever at a block location.
	 * @param position
	 */
	pullLever(position: BlockLocation): void

	/**
	 * Sends a Redstone pulse at a particular location by creating a temporary Redstone block.
	 * @param position
	 * @param duration
	 * Number of ticks to pulse Redstone.
	 */
	pulseRedstone(position: BlockLocation, duration: number): void

	/**
	 * From a BlockLocation, returns a new BlockLocation with coordinates relative to the current GameTest structure block. For example, the relative coordinates for the block above the structure block are (0, 1, 0). Rotation of the GameTest structure is also taken into account.
	 * @param worldLocation
	 * Absolute location in the world to convert to a relative location.
	 */
	relativeLocation(worldLocation: BlockLocation): BlockLocation

	/**
	 * Runs a specific callback after a specified delay of ticks.
	 * @param delayTicks
	 * Number of ticks to delay before running the specified callback.
	 * @param callback
	 * Callback function to execute.
	 */
	runAfterDelay(delayTicks: number, callback: () => undefined): void

	/**
	 * Runs the given callback after a delay of tick ticks from the start of the GameTest.
	 * @param tick
	 * Tick (after the start of the GameTest) to run the callback at.
	 * @param callback
	 * Callback function to execute.
	 */
	runAtTickTime(tick: number, callback: () => undefined): void

	/**
	 * Spawns an entity at a location.
	 * @param entityIdentifier
	 * Type of entity to create. If no namespace is provided, 'minecraft:' is assumed. Note that an optional initial spawn event can be specified between less than/greater than signs (e.g., namespace:entityType).
	 * @param position
	 */
	spawn(entityIdentifier: string, position: BlockLocation): Entity

	/**
	 * Spawns an item entity at a specified location.
	 * @param itemStack
	 * ItemStack that describes the item entity to create.
	 * @param position
	 * Location to create the item entity at.
	 */
	spawnItem(itemStack: ItemStack, position: Location): Entity

	/**
	 * Spawns an entity at a location without any AI behaviors. This method is frequently used in conjunction with methods like .walkTo to create predictable mob actions.
	 * @param entityIdentifier
	 * @param position
	 */
	spawnWithoutBehaviors(
		entityIdentifier: string,
		position: BlockLocation
	): Entity

	/**
	 * Creates a new GameTestSequence - A set of steps that play out sequentially within a GameTest.
	 */
	startSequence(): GameTestSequence

	/**
	 * Marks the current test as a success case.
	 */
	succeed(): void

	/**
	 * Runs the given callback. If the callback does not throw an exception, the test is marked as a success.
	 * @param callback
	 * Callback function that runs. If the function runs successfully, the test is marked as a success. Typically, this function will have .assertXyz method calls within it.
	 */
	succeedIf(callback: () => undefined): void

	/**
	 * Marks the test as a success at the specified tick.
	 * @param tick
	 * Tick after the start of the GameTest to mark the test as successful.
	 */
	succeedOnTick(tick: number): void

	/**
	 * Runs the given callback at tick ticks after the start of the test. If the callback does not throw an exception, the test is marked as a failure.
	 * @param tick
	 * Tick after the start of the GameTest to run the testing callback at.
	 * @param callback
	 * Callback function that runs. If the function runs successfully, the test is marked as a success.
	 */
	succeedOnTickWhen(tick: number, callback: () => undefined): void

	/**
	 * Runs the given callback every tick. When the callback successfully executes, the test is marked as a success. Specifically, the test will succeed when the callback does not throw an exception.
	 * @param callback
	 * Testing callback function that runs. If the function runs successfully, the test is marked as a success.
	 */
	succeedWhen(callback: () => undefined): void

	succeedWhenBlockPresent(block: Block, position: BlockLocation): void

	/**
	 * Tests for the presence of a component on every tick. When the specified component is found, the test is marked as a success.
	 * @param entityIdentifier
	 * Type of entity to look for. If no namespace is specified, 'minecraft:' is assumed.
	 * @param componentIdentifier
	 * Type of component to test for the presence of. If no namespace is specified, 'minecraft:' is assumed.
	 * @param position
	 * @param hasComponent
	 */
	succeedWhenEntityHasComponent(
		entityIdentifier: string,
		componentIdentifier: string,
		position: BlockLocation,
		hasComponent: boolean
	): void

	/**
	 * Tests every tick and marks the test as a success when a particular entity is not present at a particular location.
	 * @param entityIdentifier
	 * Type of entity to test for (e.g., 'minecraft:skeleton'). If an entity namespace is not specified, 'minecraft:' is assumed.
	 * @param position
	 */
	succeedWhenEntityNotPresent(
		entityIdentifier: string,
		position: BlockLocation
	): void

	/**
	 * Tests for the presence of an entity on every tick. When an entity of the specified type is found, the test is marked as a success.
	 * @param entityIdentifier
	 * Type of entity to test for (e.g., 'minecraft:skeleton'). If an entity namespace is not specified, 'minecraft:' is assumed.
	 * @param position
	 */
	succeedWhenEntityPresent(
		entityIdentifier: string,
		position: BlockLocation
	): void

	succeedWhenBlockTypePresent(block: Block, position: BlockLocation): void

	/**
	 * Forces an entity to walk to a particular location. Usually used in conjunction with methods like .spawnWithoutBehaviors to have more predictable mob behaviors.
	 * @param mob
	 * Mob entity to give orders to.
	 * @param position
	 * @param speedModifier
	 * Adjustable modifier to the mob's walking speed.
	 */
	walkTo(mob: Entity, position: BlockLocation, speedModifier: number): void

	/**
	 * From a BlockLocation with coordinates relative to the GameTest structure block, returns a new BlockLocation with coordinates relative to world. Rotation of the GameTest structure is also taken into account.
	 * @param relativeLocation
	 * Location relative to the GameTest command block.
	 */
	worldLocation(relativeLocation: BlockLocation): BlockLocation

	setTntFuse(entity: Entity, time: number): void

	setBlockType(blockType: BlockType, position: BlockLocation): void

	setBlockPermutation(
		blockData: BlockPermutation,
		position: BlockLocation
	): void
}

// -------------------------------------------------------------
// Minecraft module

declare module 'Minecraft' {
	export const ItemStack: ItemStackClass
	export const BlockLocation: BlockLocationClass
	export const Location: LocationClass
	export const Effects: Effects
	export const Items: Items
	export const World: World
	export const Commands: Commands
	export const ExplosionOptions: ExplosionOptionsClass
	export const BlockTypes: BlockTypes
	export const BlockProperties: BlockProperties
}

declare interface Effects {
	absorption: EffectType
	badOmen: EffectType
	blindness: EffectType
	conduitPower: EffectType
	empty: EffectType
	fatalPoison: EffectType
	fireResistance: EffectType
	haste: EffectType
	healthBoost: EffectType
	hunger: EffectType
	instantDamage: EffectType
	instantHealth: EffectType
	invisibility: EffectType
	jumpBoost: EffectType
	levitation: EffectType
	miningFatigue: EffectType
	nausea: EffectType
	nightVision: EffectType
	poison: EffectType
	regeneration: EffectType
	resistance: EffectType
	saturation: EffectType
	slowFalling: EffectType
	slowness: EffectType
	speed: EffectType
	strength: EffectType
	villageHero: EffectType
	waterBreathing: EffectType
	weakness: EffectType
	wither: EffectType
}

declare interface Effect {
	/**
	 * Gets the entire specified duration, in seconds, of this effect.
	 */
	duration: number

	/**
	 * Gets an amplifier that may have been applied to this effect. Sample values range typically from 0 to 4. Example: The effect 'Jump Boost II' will have an amplifier value of 1.
	 */
	amplifier: number

	displayName: string
}

declare interface Items {
	[item: string]: ItemType
}

declare interface BlockTypes {
	get(blockName: string): BlockType

	getAllBlockTypes(): BlockType[]

	[block: string]: BlockType
}

/**
 * Represents a block in a dimension. A block represents a unique X, Y, and Z within a dimension and get/sets the state of the block at that location.
 */
declare interface Block {
	x: number

	y: number

	z: number

	canBeWaterlogged(): boolean

	getBlockData(): BlockPermutation

	getComponent<T extends keyof BlockComponents>(
		componentId: T
	): BlockComponents[T] | undefined

	getLocation(): BlockLocation

	getTags(): any[]

	isEmpty(): boolean

	isWaterlogged(): boolean

	/**
	 * Checks to see if the permutation of this block has a specific tag.
	 */
	hasTag(): boolean

	/**
	 * Sets the block in the dimension to the state of the permutation.
	 */
	setPermutation(permutation: BlockPermutation): void

	setType(): void

	setWaterlogged(setWaterlogged: boolean): void
}

declare interface BlockProperties {
	[property: string]: BlockProperty
}

declare interface BlockPermutation {
	/**
	 * Returns a copy of the permutation.
	 */
	clone(): BlockPermutation

	/**
	 * Returns the list of all of the properties that the permutation has.
	 */
	getAllProperties(): any[]

	/**
	 * Returns the property if the permutation has it, else null.
	 * @param propertyName
	 */
	getProperty(propertyName: string): any

	/**
	 * Creates a copy of the permutation.
	 */
	getTags(): any[]

	/**
	 * Returns the BlockType that the permutation has.
	 */
	getType(): BlockType

	/**
	 * Checks to see if the permutation has a specific tag.
	 * @param tag
	 */
	hasTag(tag: string): boolean
}

/**
 * The type (or template) of a block. Does not contain permutation data (state) other than the type of block it represents.
 */
declare interface BlockType {
	getName(): string

	canBeWaterlogged(): boolean

	/**
	 * Creates the default BlockPermutation for this type which uses the default values for all properties.
	 */
	createDefaultBlockPermutation(): BlockPermutation
}

declare interface BlockProperty {
	/**
	 * The current value of this property.
	 * @throws Setting this property can throw if the value passed is not valid for the property. Use validValues to check allowed values.
	 */
	value: string | boolean | number

	validValues: string[] | boolean[] | number[]

	name: string
}

declare interface Player {
	/**
	 * Identifier for the player.
	 */
	id: string

	/**
	 * Current location of the player.
	 */
	location: Location

	/**
	 * Current speed of the player across X, Y, and Z dimensions.
	 */
	velocity: Location

	/**
	 * Optional name tag of the player.
	 */
	nameTag: string

	/**
	 * Name of the player.
	 */
	name: string

	/**
	 * Returns true if the specified component is present on this player.
	 * @param componentId
	 * The identifier of the component (e.g., 'minecraft:rideable') to retrieve. If no namespace prefix is specified, 'minecraft:' is assumed.
	 */
	hasComponent(componentId: keyof EntityComponents): boolean

	/**
	 * Gets a component (that represents additional capabilities) for a player.
	 * @param componentId
	 * The identifier of the component (e.g., 'minecraft:rideable') to retrieve. If no namespace prefix is specified, 'minecraft:' is assumed. If the component is not present on the entity, undefined is returned.
	 */
	getComponent<T extends keyof EntityComponents>(
		componentId: T
	): EntityComponents[T] | undefined

	/**
	 * Returns all components that are both present on this player and supported by the API.
	 */
	getComponents(): any[] | undefined

	/**
	 * Kills this entity. The player will drop loot as normal.
	 */
	kill(): void

	/**
	 * Returns the effect for the specified EffectType on the player, or undefined if the effect is not present.
	 * @param effectType
	 */
	getEffect(effectType: EffectType): Effect

	/**
	 * Adds an effect, like poison, to the player.
	 * @param effectType
	 * Type of effect to add to the player.
	 * @param duration
	 * Amount of time, in seconds, for the effect to apply.
	 * @param amplifier
	 * Optional amplification of the effect to apply.
	 */
	addEffect(effectType: EffectType, duration: number, amplifier: number): void

	/**
	 * Triggers an event on a player.
	 * @param eventName
	 */
	triggerEvent(eventName: string): void
}

declare interface World {
	/**
	 *
	 * @param dimensionName
	 * The name of the Dimension.
	 */
	getDimension(dimensionName: 'overworld' | 'nether' | 'the end'): Dimension

	/**
	 * Returns all players in the server
	 */
	getPlayers(): Player[]

	events: Events
}

declare interface Dimension {
	/**
	 * True if the block at the location is air (empty).
	 * @param location
	 * The location at which to check for emptiness.
	 */
	isEmpty(location: BlockLocation): boolean

	/**
	 * Creates an explosion.
	 * @param position
	 * @param radius
	 * @param options
	 */
	createExplosion(
		position: Location,
		radius: number,
		options: ExplosionOptions
	): undefined

	/**
	 * Returns an array of all entities at the given block location.
	 * @param location
	 */
	getEntitiesAtBlockLocation(location: BlockLocation): Entity[]

	/**
	 * Spawns an entity with the given identifier at the given block location
	 * @param identifier
	 * @param location
	 */
	spawnEntity(identifier: String, location: BlockLocation): Entity

	getBlock(position: BlockLocation): Block
}

declare interface Events {
	/**
	 * This event fires every tick - which is 20 times per second.
	 */
	tick: TickEventSignal

	/**
	 * Contains information related to changes in weather in the environment.
	 */
	changeWeather: WeatherChangedEventSignal

	/**
	 * This event fires before a chat message is broadcast or delivered. The event can be canceled, and the message can also be updated.
	 */
	beforeChat: ChatEventSignal

	/**
	 * This event is triggered after a chat message has been broadcast or sent to players.
	 */
	chat: ChatEventSignal

	addEffect: AddEffectEventSignal

	createEntity: EntityEventSignal
}

declare interface TickEventSignal {
	/**
	 * Adds a callback that will be called on every tick.
	 * @param callback
	 */
	subscribe(callback: () => undefined): void

	/**
	 * Removes a callback from being called every tick.
	 * @param callback
	 */
	unsubscribe(callback: () => undefined): void
}

declare interface WeatherChangedEventSignal {
	/**
	 * Adds a callback that will be called when weather changes.
	 * @param callback
	 */
	subscribe(callback: (eventData: WeatherChangedEvent) => undefined): void

	/**
	 * Removes a callback from being called when weather changes.
	 * @param callback
	 */
	unsubscribe(callback: (eventData: WeatherChangedEvent) => undefined): void
}
declare interface WeatherChangedEvent {
	/**
	 * Dimension in which the weather has changed.
	 */
	dimension: string

	/**
	 * Whether it is raining after the change in weather.
	 */
	raining: boolean

	/**
	 * Whether it is lightning after the change in weather.
	 */
	lightning: boolean
}

declare interface ChatEventSignal {
	/**
	 * Adds a callback that will be called when new chat messages are sent.
	 * @param callback
	 */
	subscribe(callback: (eventData: ChatEvent) => undefined): void

	/**
	 * Removes a callback from being called when new chat messages are sent.
	 * @param callback
	 */
	unsubscribe(callback: (eventData: ChatEvent) => undefined): void
}
declare interface ChatEvent {
	/**
	 * Message that is being broadcast. In a beforeChat event handler, message can be updated with edits before the message is displayed to players.
	 */
	message: string

	/**
	 * Player that sent the chat message.
	 */
	sender: Player

	/**
	 * If set to true in a beforeChat event handler, this message is not broadcast out.
	 */
	canceled: boolean

	/**
	 * List of players that will receive this message.
	 */
	targets: Player[]

	/**
	 * If true, this message is directly targeted to one or more players (i.e., is not broadcast.)
	 */
	sendToTargets: boolean
}

declare interface AddEffectEventSignal {
	subscribe(callback: (eventData: ActorAddEffectEvent) => void): void

	unsubscribe(callback: (eventData: ActorAddEffectEvent) => void): void
}
declare interface ActorAddEffectEvent {
	entity: Entity

	effect: Effect

	effectState: number
}

declare interface EntityEventSignal {
	subscribe(callback: (eventData: EntityEvent) => void): void

	unsubscribe(callback: (eventData: EntityEvent) => void): void
}
declare interface EntityEvent {
	entity: Entity
}

declare interface Commands {
	/**
	 * Runs a particular command from the context of the server. Command strings should not start with slash.
	 * @param commandString
	 */
	run(commandString: string): undefined
}

declare interface Entity {
	/**
	 * Identifier for the entity.
	 */
	id: string

	/**
	 * Current location of the entity.
	 */
	location: Location

	/**
	 * Current speed of the entity across X, Y, and Z dimensions.
	 */
	velocity: Location

	/**
	 * Optional name tag of the entity.
	 */
	nameTag: string

	/**
	 * Returns true if the specified component is present on this entity.
	 * @param componentId
	 * The identifier of the component (e.g., 'minecraft:rideable') to retrieve. If no namespace prefix is specified, 'minecraft:' is assumed.
	 */
	hasComponent(componentId: keyof EntityComponents): boolean

	/**
	 * Gets a component (that represents additional capabilities) for an entity.
	 * @param componentId
	 * The identifier of the component (e.g., 'minecraft:rideable') to retrieve. If no namespace prefix is specified, 'minecraft:' is assumed. If the component is not present on the entity, undefined is returned.
	 */
	getComponent<T extends keyof EntityComponents>(
		componentId: T
	): EntityComponents[T] | undefined

	/**
	 * Returns all components that are both present on this entity and supported by the API.
	 */
	getComponents(): any[] | undefined

	/**
	 * Kills this entity. The entity will drop loot as normal.
	 */
	kill(): void

	/**
	 * Returns the effect for the specified EffectType on the entity, or undefined if the effect is not present.
	 * @param effectType
	 */
	getEffect(effectType: EffectType): Effect

	/**
	 * Adds an effect, like poison, to the entity.
	 * @param effectType
	 * Type of effect to add to the entity.
	 * @param duration
	 * Amount of time, in seconds, for the effect to apply.
	 * @param amplifier
	 * Optional amplification of the effect to apply.
	 */
	addEffect(effectType: EffectType, duration: number, amplifier: number): void

	/**
	 * Triggers an event on an entity.
	 * @param eventName
	 */
	triggerEvent(eventName: string): void
}

declare interface EntityComponents {
	// Component data defined in ./componentData.d.ts

	inventory: Inventory

	color: Color
	'minecraft:color': Color

	tamemount: MountTaming
	'minecraft:tamemount': MountTaming

	is_saddled: Saddled
	'minecraft:is_saddled': Saddled

	leashable: Leashable
	'minecraft:leashable': Leashable

	health: Health
	'minecraft:health': Health

	rideable: Rideable
	'minecraft:rideable': Rideable

	tameable: Tameable
	'minecraft:tameable': Tameable

	healable: Healable
	'minecraft:healable': Healable

	movement: Movement
	'minecraft:movement': Movement

	flying_speed: FlyingSpeed
	'minecraft:flying_speed': FlyingSpeed

	'movement.amphibious': MovementAmphibious
	'minecraft:movement.amphibious': MovementAmphibious

	'movement.basic': MovementBasic
	'minecraft:movement.basic': MovementBasic

	'movement.fly': MovementFly
	'minecraft:movement.fly': MovementFly

	'movement.generic': MovementGeneric
	'minecraft:movement.generic': MovementGeneric

	'movement.glide': MovementGlide
	'minecraft:movement.glide': MovementGlide

	'movement.hover': MovementHover
	'minecraft:movement.hover': MovementHover

	'movement.jump': MovementJump
	'minecraft:movement.jump': MovementJump

	'movement.skip': MovementSkip
	'minecraft:movement.skip': MovementSkip

	'movement.sway': MovementSway
	'minecraft:movement.sway': MovementSway

	ageable: Ageable
	'minecraft:ageable': Ageable

	addrider: AddRider
	'minecraft:addrider': AddRider

	breathable: Breathable
	'minecraft:breathable': Breathable

	'navigation.fly': NavigationFly
	'minecraft:navigation.fly': NavigationFly

	'navigation.climb': NavigationClimb
	'minecraft:navigation.climb': NavigationClimb

	'navigation.float': NavigationFloat
	'minecraft:navigation.float': NavigationFloat

	'navigation.generic': NavigationGeneric
	'minecraft:navigation.generic': NavigationGeneric

	'navigation.hover': NavigationHover
	'minecraft:navigation.hover': NavigationHover

	'navigation.walk': NavigationWalk
	'minecraft:navigation.walk': NavigationWalk

	lava_movement: LavaMovement
	'minecraft:lava_movement': LavaMovement

	underwater_movement: UnderwaterMovement
	'minecraft:underwater_movement': UnderwaterMovement

	strength: Strength
	'minecraft:strength': Strength
}

declare interface BlockComponents {
	// Component data defined in ./componentData.d.ts
	inventory: BlockInventory
}

/**
 * Represents a type of effect - like poison - that can be applied to an entity.
 */
declare interface EffectType {
	/**
	 * Identifier name of this effect type.
	 */
	getName(): string
}

/**
 * Represents the type of an item - for example, Wool.
 */
declare interface ItemType {
	/**
	 * Returns the identifier of the item type - for example, 'apple'.
	 */
	getName(): string
}

declare interface ExplosionOptionsClass {
	new (): ExplosionOptions
}
declare interface ExplosionOptions {
	/**
	 * Optional source of the explosion.
	 */
	source: Entity

	/**
	 * Whether the explosion will break blocks within the blast radius.
	 */
	breaksBlocks: boolean

	/**
	 * If true, the explosion is accompanied by fires within or near the blast radius.
	 */
	causesFire: boolean
	/**
	 * Whether parts of the explosion also impact underwater.
	 */
	allowUnderwater: boolean
}

declare interface BlockLocationClass {
	new (x: number, y: number, z: number): BlockLocation
}
declare interface BlockLocation {
	/**
	 * Compares this BlockLocation and another BlockLocation to one another.
	 * @param other
	 * Other block location to compare this BlockLocation to.
	 */
	equals(other: BlockLocation): boolean

	/**
	 * Returns a block location using a position relative to this block location.
	 * @param x
	 * X offset relative to this BlockLocation.
	 * @param y
	 * Y offset relative to this BlockLocation.
	 * @param z
	 * Z offset relative to this BlockLocation.
	 */
	offset(x: number, y: number, z: number): BlockLocation

	/**
	 * Returns a BlockLocation for a block above this BlockLocation (that is, y - 1).
	 */
	above(): BlockLocation

	/**
	 * The X coordinate.
	 */
	x: number

	/**
	 * The integer-based Y position.
	 */
	y: number

	/**
	 * The integer-based Z position.
	 */
	z: number
}

declare interface LocationClass {
	new (x: number, y: number, z: number): Location
}
declare interface Location {
	/**
	 * Compares this Location and another Location to one another.
	 * @param other
	 * Other location to compare this Location to.
	 */
	equals(other: Location): boolean

	/**
	 * X component of this location.
	 */
	x: number

	/**
	 * Y component of this location.
	 */
	y: number

	/**
	 * Z component of this location.
	 */
	z: number
}

declare interface ItemStackClass {
	new (itemType: ItemType, amount: number, data: number): ItemStack
}
/**
 * Defines a collection of items.
 */
declare interface ItemStack {
	/**
	 * Identifier of the type of items for the stack. If a namespace is not specified, 'minecraft:' is assumed. Examples include 'wheat' or 'apple'.
	 */
	id: string

	/**
	 * A data value used to configure alternate states of the item.
	 */
	data: number

	/**
	 * Number of the items in the stack. Valid values range between 0 and 64.
	 */
	amount: number
}
