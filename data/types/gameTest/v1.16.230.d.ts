declare module 'Minecraft' {
	export const Location: WorldLocationClass
	export const World: World
	export const Items: Items
	export const Effects: Effects
	export const Commands: Commands
}

declare interface Test {
	/**
	 * Asserts an error when the given entity is found at the given coordinates
	 * @param id
	 * The identifier of the entity to check for
	 * @param position
	 * The relative position to test for the actor
	 */
	assertEntityInstancePresent(id: string, position: BlockLocation): void
	/**
	 * Asserts that the entity item count in the given search area matches the expected count
	 * @param item
	 * The item type to test for
	 * @param position
	 * The position of the item to test for
	 * @param searchDistance
	 * The distance to search for the item
	 * @param count
	 * The amount of items to expect in the stack
	 */
	assertItemEntityCountIs(
		item: Item,
		position: BlockLocation,
		searchDistance: number,
		count: number
	): void
	/**
	 * Asserts an error when the armor is found on the entity at the given coordinates
	 * @param id
	 * The identifier of the entity to check for the armor on
	 * @param slot
	 * The slot of the entity to test for the item
	 * @param item
	 * The item to test for in the given slot
	 * @param data
	 * The data value of the item
	 * @param position
	 * The position of the entity to test for the armor
	 * @param bool
	 * Unknown function of parameter...
	 */
	assertEntityHasArmor(
		id: string,
		slot: number,
		item: string,
		data: number,
		position: BlockLocation,
		bool: boolean
	): void
	/**
	 * Asserts an error when the given entity has the component
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
	 * Asserts that the given condition is true for all entities of the given type at the given location
	 * @param position
	 * Position of the entity to test
	 * @param id
	 * Identifier of the entity to test
	 * @param func
	 */
	assertEntityData(
		position: BlockLocation,
		id: string,
		func: (entity: Entity) => void
	): void
	/**
	 * Asserts that there is no entity of the given type at the given position
	 * @param id
	 * The entity to test for
	 * @param position
	 * The position of the entity to test
	 */
	assertEntityNotTouching(id: string, position: BlockLocation): void
	/**
	 * Asserts that there is an entity of the given type at the given position
	 * @param id
	 * The entity to test for
	 * @param position
	 * The position of the entity to test
	 */
	assertEntityTouching(id: string, position: BlockLocation): void
	/**
	 * Asserts that the block at the given location is waterlogged
	 * @param position
	 * Position of the block to test
	 * @param isWaterLoggged
	 * Whether to test if the block is or isn't waterlogged
	 */
	assertIsWaterLogged(position: BlockLocation, isWaterLoggged: boolean): void
	/**
	 * Asserts the redstone power level at the given location
	 * @param position
	 * Position of the block to test
	 * @param power
	 * The redstone power level to test for
	 */
	assertRedstonePower(position: BlockLocation, power: number): void

	/**
	 * Prints the given text to the chat
	 * @param text
	 * The text to print out
	 */
	print(text: string): void
	/**
	 * Spawns an item at the given location
	 * @param item
	 * The item stack to spawn
	 * @param position
	 * The relative position to spawn the item stack
	 */
	spawnItem(item: ItemStack, location: WorldLocation): Item
	/**
	 * Creates a Redstone block at the given position and destroys it after "duration" ticks
	 * @param position
	 * Position to place the redstone block
	 * @param duration
	 * The time until the redstone block is destroyed
	 */
	pulseRedstone(position: BlockLocation, duration: number): void
	/**
	 * Spawns the specified entity at the specified coordinates
	 * @param id
	 * The identifier of the entity to spawn
	 * @param position
	 * The relative position to spawn the entity
	 */
	spawn(id: string, position: BlockLocation): Entity
}

declare interface World {
	/**
	 * Registers an event listener for entity events Supported
	 * @param func
	 * Function to run when the event is triggered
	 */
	addEventListener(event: WorldEvent, func: (entity: Entity) => void): void
	/**
	 * Gets the current dimension
	 */
	getDimension(): Dimension
}

declare interface Entity {
	/**
	 * Returns an array of supported components
	 */
	getComponents(): EntityComponent[] | undefined
	/**
	 * Returns the component matching the given identifier
	 * @param component
	 * The component identifier to get
	 */
	getComponent(component: string): EntityComponent | undefined
	/**
	 * Returns true if the given component exists on the entity and is supported
	 * @param component
	 * The component identifier to check for
	 */
	hasComponent(component: string): boolean

	/**
	 * Returns the name of the entity (e.g. "Horse")
	 */
	getName(): string

	/**
	 * Gets an effect from the Entity
	 * @param effect
	 */
	getEffect(effect: Effect): Effect
	/**
	 * Adds an effect to the Entity
	 * @param effect
	 */
	addEffect(effect: Effect, duration: number, amplifier: number): Effect

	/**
	 * Kills the entity
	 */
	kill(): void
}

declare interface Dimension {}

declare interface EntityComponent {
	/**
	 * Returns the name of the component
	 */
	getName(): string
	/**
	 * Leashes this entity to another given entity. This must be used on the "minecraft:leashable" component
	 * @param entity
	 * The entity to leash this entity to
	 */
	leash(entity: Entity): void
	/**
	 * Causes this entity to detach leashes. This must be used on the "minecraft:leashable" component
	 */
	unleash(): void
	/**
	 * Sets the entities color value. This must be used on the "minecraft:color" component
	 * @param color
	 * The color value to set
	 */
	setColor(color: number): void
	/**
	 * Sets the entity as tamed
	 * @param particles
	 * Whether to display taming particles
	 */
	setTamed(particles: boolean): void
}

declare interface ItemStackClass {
	/**
	 * Creates a an item stack
	 */
	new (item: Item, amount: number, data: number): ItemStack
}

declare interface Items {
	apple(): Item
}

declare interface Effects {
	speed(): Effect
	slowness(): Effect
	haste(): Effect
	miningFatigue(): Effect
	strength(): Effect
	instantHealth(): Effect
	instantDamage(): Effect
	jumpBoost(): Effect
	nausea(): Effect
	regeneration(): Effect
	resistance(): Effect
	fireResistance(): Effect
	waterBreathing(): Effect
	invisibility(): Effect
	blindness(): Effect
	nightVision(): Effect
	hunger(): Effect
	weakness(): Effect
	poison(): Effect
	wither(): Effect
	healthBoost(): Effect
	absorption(): Effect
	saturation(): Effect
	levitation(): Effect
	fatalPoison(): Effect
	slowFalling(): Effect
	conduitPower(): Effect
	badOmen(): Effect
	heroOfTheVillage(): Effect
}
declare interface Effect {
	/**
	 * Gets the effect's amplifier level
	 */
	getAmplifier()
	/**
	 * Gets the effect's remaining duration in ticks
	 */
	getDuration()
}

declare interface WorldLocationClass {
	/**
	 * Creates a location
	 */
	new (x: number, y: number, z: number): WorldLocation
}
declare interface WorldLocation {}

declare interface Commands {
	/**
	 * Runs the given command when called
	 * @param command
	 * The command to run (should start with a '/')
	 */
	run(command: string): void
}

declare type WorldEvent = 'onEntityCreated' | 'onEntityDefinitionTriggered'
