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
	thenExecute(callback: () => undefined): GameTestSequence

	thenExecuteAfter(
		delayTicks: number,
		callback: () => undefined
	): GameTestSequence

	thenFail(errorMessage: string): void

	thenIdle(delayTicks: number): GameTestSequence

	thenSucceed(): void

	thenWait(callback: () => undefined): GameTestSequence

	thenWaitWithDelay(
		delayTicks: number,
		callback: () => undefined
	): GameTestSequence
}

declare interface Helper {
	assertBlockNotPresent(block: Block, position: BlockLocation): void

	assertBlockPresent(block: Block, position: BlockLocation): void

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
		componentIdentifier: string,
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

	assertItemEntityNotPresent(
		itemType: ItemType,
		position: BlockLocation,
		searchDistance: number
	): void

	assertItemEntityPresent(
		itemType: ItemType,
		position: BlockLocation,
		searchDistance: number
	): void

	assertRedstonePower(position: BlockLocation, power: number): void

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

	print(text: string): void

	pullLever(position: BlockLocation): void

	pulseRedstone(position: BlockLocation, duration: number): void

	relativeLocation(worldLocation: BlockLocation): BlockLocation

	runAfterDelay(delayTicks: number, callback: () => undefined): void

	runAtTickTime(tick: number, callback: () => undefined): void

	setBlock(block: Block, position: BlockLocation): void

	spawn(entityIdentifier: string, position: BlockLocation): Entity

	spawnItem(itemStack: ItemStack, position: Location): Entity

	spawnWithoutBehaviors(
		entityIdentifier: string,
		position: BlockLocation
	): Entity

	startSequence(): GameTestSequence

	succeed(): void

	succeedIf(callback: () => undefined): void

	succeedOnTick(tick: number): void

	succeedOnTickWhen(tick: number, callback: () => undefined): void

	succeedWhen(callback: () => undefined): void

	succeedWhenBlockPresent(block: Block, position: BlockLocation): void

	succeedWhenEntityHasComponent(
		entityIdentifier: string,
		componentIdentifier: string,
		position: BlockLocation,
		hasComponent: boolean
	): void

	succeedWhenEntityNotPresent(
		entityIdentifier: string,
		position: BlockLocation
	): void

	succeedWhenEntityPresent(
		entityIdentifier: string,
		position: BlockLocation
	): void

	walkTo(mob: Entity, position: BlockLocation, speedModifier: number): void

	worldLocation(relativeLocation: BlockLocation): BlockLocation
}

// -------------------------------------------------------------
// Minecraft module

declare module 'Minecraft' {
	export const ItemStack: ItemStackClass
	export const Blocks: Blocks
	export const BlockStates: BlockStates
	export const BlockLocation: BlockLocationClass
	export const Location: LocationClass
	export const Effects: Effects
	export const Items: Items
	export const World: World
	export const Commands: Commands
}

declare interface Effects {
	speed: EffectType
	slowness: EffectType
	haste: EffectType
	miningFatigue: EffectType
	strength: EffectType
	instantHealth: EffectType
	instantDamage: EffectType
	jumpBoost: EffectType
	nausea: EffectType
	regeneration: EffectType
	resistance: EffectType
	fireResistance: EffectType
	waterBreathing: EffectType
	invisibility: EffectType
	blindness: EffectType
	nightVision: EffectType
	hunger: EffectType
	weakness: EffectType
	poison: EffectType
	wither: EffectType
	healthBoost: EffectType
	absorption: EffectType
	saturation: EffectType
	levitation: EffectType
	fatalPoison: EffectType
	slowFalling: EffectType
	conduitPower: EffectType
	badOmen: EffectType
	heroOfTheVillage: EffectType
}

declare interface Effect {
	getAmplifier(): number

	getDuration(): number
}

declare interface Items {
	[item: string]: ItemType
}

declare interface Blocks {
	[block: string]: Block

	get(blockName: string): Block
}

declare interface Block {
	name: string

	setState(state: BlockState): any
}

declare interface World {
	getDimension(dimensionName: 'overworld' | 'nether' | 'the end'): Dimension

	addEventListener(
		eventName: string,
		callback: (entity: Entity) => undefined
	): void

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
}

declare interface Events {
	tick: TickEventSignal

	weatherChanged: WeatherChangedEventSignal
}

declare interface TickEventSignal {
	subscribe(callback: () => undefined): void

	unsubscribe(callback: () => undefined): void
}

declare interface WeatherChangedEventSignal {
	subscribe(callback: (eventData: WeatherChangedEvent) => undefined): void

	unsubscribe(callback: (eventData: WeatherChangedEvent) => undefined): void
}
declare interface WeatherChangedEvent {
	dimension: string
	raining: boolean
	lightning: boolean
}

declare interface Commands {
	run(commandString: string): undefined
}

declare interface Entity {
	hasComponent(componentId: string): boolean

	getComponent<T extends keyof EntityComponents>(
		componentId: T
	): EntityComponents[T] | undefined

	getComponents(): EntityComponent[] | undefined

	getName(): string

	kill(): void

	getEffect(effectType: EffectType): Effect

	addEffect(effectType: EffectType, duration: number, amplifier: number): void
}

declare interface EntityComponents {
	// Component data defined in ./entityComponentData.d.ts

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

	// TODO use same method for world event listeners
}

declare interface EffectType {
	getName(): string
}

declare interface ItemType {
	getName(): string
}

declare interface BlockLocationClass {
	new (x: number, y: number, z: number): BlockLocation
}
declare interface BlockLocation {
	equals(other: BlockLocation): boolean

	offset(x: number, y: number, z: number): BlockLocation

	above(): BlockLocation

	x: number

	y: number

	z: number
}

declare interface LocationClass {
	new (x: number, y: number, z: number): Location
}
declare interface Location {
	equals(other: Location): boolean

	x: number

	y: number

	z: number
}

declare interface ItemStackClass {
	new (itemType: ItemType, amount: number, data: number): ItemStack
}
declare interface ItemStack {
	id: string

	data: number

	amount: number
}
