// Entity Components

/**
 * Defines this entity's inventory properties.
 */
declare interface Inventory {
	/**
	 * Number of slots that this entity can gain per extra strength.
	 */
	additionalSlotsPerStrength: number

	/**
	 * If true, the contents of this inventory can be removed by a hopper.
	 */
	canBeSiphonedFrom: boolean

	/**
	 * Type of container this entity has.
	 */
	containerType: string

	/**
	 * Number of slots the container has.
	 */
	inventorySize: number

	/**
	 * If true, the entity will not drop it's inventory on death.
	 */
	private: boolean

	/**
	 * If true, the entity's inventory can only be accessed by its owner or itself.
	 */
	restrictToOwner: boolean

	container: Container
}
/**
 * Represents a container that can hold sets of items. Used with entities such as Players, Chest Minecarts, Llamas, and more.
 */
declare interface Container {
	/**
	 * Represents the size of the container. For example, a standard single-block chest has a size of 27, for the 27 slots in their inventory.
	 */
	size: number

	/**
	 *Contains a count of the slots in the container that are empty.
	 */
	emptySlotsCount: number

	/**
	 * Sets an item stack within a particular slot.
	 * @param slot
	 * Zero-based index of the slot to set an item at.
	 * @param itemStack
	 * Stack of items to place within the specified slot.
	 */
	setItem(slot: number, itemStack: ItemStack): void

	/**
	 * Gets the item stack for the set of items at the specified slot. If the slot is empty, returns undefined. This method does not change or clear the contents of the specified slot.
	 * @param slot
	 * Zero-based index of the slot to retrieve items from.
	 */
	getItem(slot: number): ItemStack

	/**
	 * Adds an item to the specified container. Item will be placed in the first available empty slot. (use .setItem if you wish to set items in a particular slot.)
	 * @param itemStack
	 * The stack of items to add.
	 */
	addItem(itemStack: ItemStack): void

	/**
	 * Moves an item from one slot to another, potentially across containers.
	 * @param fromSlot
	 * Zero-based index of the slot to move from.
	 * @param toSlot
	 * Zero-based index of the slot to move to.
	 * @param toContainer
	 * Target container to transfer to. Note this can be the same container as the source.
	 */
	transferItem(
		fromSlot: number,
		toSlot: number,
		toContainer: Container
	): boolean

	/**
	 * Swaps items between two different slots within containers.
	 * @param slot
	 * Zero-based index of the slot to swap from this container.
	 * @param otherSlot
	 * Zero-based index of the slot to swap with.
	 * @param otherContainer
	 * Target container to swap with. Note this can be the same container as this source.
	 */
	swapItems(
		slot: number,
		otherSlot: number,
		otherContainer: Container
	): boolean
}

/**
 * Defines the entity's color. Only works on vanilla entities that have predefined color values (sheep, llama, shulker).
 */
declare interface Color {
	/**
	 * Identifier of this component.
	 */
	id: 'minecraft:color'

	/**
	 * The palette color value of the entity.
	 */
	value: number
}

/**
 * Contains options for taming a rideable entity based on the entity that mounts it.
 */
declare interface MountTaming {
	/**
	 * Identifier of this component.
	 */
	id: 'minecraft:tamemount'

	/**
	 * Sets this rideable entity as tamed.
	 * @param showParticles
	 * Whether to show effect particles when this entity is tamed.
	 */
	setTamed(showParticles: boolean): void
}

declare interface Saddled {
	/**
	 * Identifier of this component.
	 */
	id: 'minecraft:is_saddled'
}

/**
 * Allows this entity to be leashed and defines the conditions and events for this entity when is leashed.
 */
declare interface Leashable {
	/**
	 * Identifier of this component.
	 */
	id: 'minecraft:leashable'

	/**
	 * Distance in blocks at which the 'spring' effect starts acting to keep this entity close to the entity that leashed it.
	 */
	softDistance: number

	/**
	 * Leashes this entity to another entity.
	 * @param leashHolder
	 * The entity to leash this entity to.
	 */
	leash(leashHolder: Entity): void

	/**
	 * Unleashes this entity if it is leashed to another entity.
	 */
	unleash(): void
}

/**
 * Defines the health properties of an entity.
 */
declare interface Health {
	/**
	 * Identifier of this component.
	 */
	id: 'minecraft:health'

	/**
	 * Value for health as defined through entity components.
	 */
	value: number

	/**
	 * Returns the current value of health for the entity.
	 * @readonly
	 */
	current: number

	/**
	 * Sets the current health of the entity.
	 * @param value
	 */
	setCurrent(value: number): void

	/**
	 * Resets the current health to the minimum value.
	 */
	resetToMinValue(): void

	/**
	 * Resets the current health of the entity to its maximum value.
	 */
	resetToMaxValue(): void

	/**
	 * Resets the current health value of the entity to its default value.
	 */
	resetToDefaultValue(): void
}

/**
 * When added, this component adds the capability that an entity can be ridden by another entity.
 */
declare interface Rideable {
	/**
	 * Identifier of this component.
	 */
	id: 'minecraft:rideable'

	/**
	 * Number of seats for riders defined for this entity.
	 */
	seatCount: number

	/**
	 * Determines whether interactions are not supported if the entity is crouching.
	 */
	crouchingSkipInteract: boolean

	/**
	 * Set of text that should be displayed when a player is looking to ride on this entity (commonly with touch-screen controls).
	 */
	interactText: string

	/**
	 * A string-list of entity types that this entity can support as riders.
	 */
	familyTypes: string[]

	/**
	 * Zero-based index of the seat that can used to control this entity.
	 */
	controllingSeat: number

	/**
	 * If true, this entity will pull in entities that are in the correct family_types into any available seat.
	 */
	pullInEntities: boolean

	/**
	 * If true, this entity will be picked when looked at by the rider.
	 */
	riderCanInteract: boolean

	/**
	 * The list of positions and number of riders for each position for entities riding this entity.
	 */
	seats: {
		/**
		 * Physical location of this seat, relative to the entity's location.
		 */
		position: Location

		/**
		 * A minimum number of riders that can be placed in this seat position, if this seat is to be filled.
		 */
		minRiderCount: number

		/**
		 * A maximum number of riders that this seat can support.
		 */
		maxRiderCount: number

		/**
		 * If specified, contains a forced rotation that the riders in this seat are facing.
		 */
		lockRiderRotation: number
	}[]

	/**
	 * Adds an entity to this entity as a rider.
	 * @param rider
	 * Entity that will become the rider of this entity.
	 */
	addRider(rider: Entity): boolean

	/**
	 * Ejects the specified rider of this entity.
	 * @param rider
	 * Entity that should be ejected from this entity.
	 */
	ejectRider(rider: Entity): void

	/**
	 * Ejects all riders of this entity.
	 */
	ejectRiders(): void
}

/**
 * Defines the rules for a mob to be tamed by the player.
 */
declare interface Tameable {
	/**
	 * Identifier of this component.
	 */
	id: 'minecraft:tameable'

	/**
	 * The chance of taming the entity with each item use between 0.0 and 1.0, where 1.0 is 100%
	 */
	probability: number

	/**
	 * The list of items that can be used to tame this entity.
	 */
	tameItems: string[]

	/**
	 * Event to run when this entity becomes tamed.
	 */
	tameEvent: any

	/**
	 * Tames this entity.
	 */
	tame(): boolean
}

/**
 * Defines the interactions with this entity for healing it.
 */
declare interface Healable {
	/**
	 * Identifier of this component.
	 */
	id: 'minecraft:healable'

	/**
	 * A set of filters for when these Healable items would apply.
	 */
	filters: any

	/**
	 * Determines if an item can be used regardless of the entity being at full health.
	 */
	forceUse: boolean

	/**
	 * A set of items that can specifically heal this entity.
	 */
	items: {
		/**
		 * Identifier of type of item that can be fed. If a namespace is not specified, 'minecraft:' is assumed. Example values include 'wheat' or 'golden_apple'.
		 */
		item: string

		/**
		 * The amount of health this entity gains when fed this item. This number is an integer starting at 0. Sample values can go as high as 40.
		 */
		healAmount: number

		/**
		 * As part of the Healable component, an optional collection of side effects that can occur from being fed an item.
		 */
		effects: {
			/**
			 * Gets an amplifier that may have been applied to this effect. Valid values are integers starting at 0 and up - but usually ranging between 0 and 4.
			 */
			amplifier: number

			/**
			 * Chance that this effect is applied as a result of the entity being fed this item. Valid values range between 0 and 1.
			 */
			chance: number

			/**
			 * Gets the duration, in seconds, of this effect.
			 */
			duration: number

			/**
			 * Gets the identifier of the effect to apply. Example values include 'fire_resistance' or 'regeneration'.
			 */
			name: string
		}[]
	}[]
}

/**
 * Defines the general movement speed of this entity.
 */
declare interface Movement {
	/**
	 * Identifier of this component.
	 */
	id: 'minecraft:movement'

	/**
	 * Value for default movement speed as defined through entity components.
	 */
	value: number

	/**
	 * Returns the current value of default movement speed for the entity.
	 * @readonly
	 */
	current: number

	/**
	 * Sets the current value of default movement speed for the entity.
	 */
	setCurrent(value: number): void

	/**
	 * Resets the default movement speed to the minimum value.
	 */
	resetToMinValue(): void

	/**
	 * Resets the default movement speed to the maximum value for the entity.
	 */
	resetToMaxValue(): void

	/**
	 * Resets the current default movement speed value for the entity to the default value.
	 */
	resetToDefaultValue(): void
}

/**
 * Represents the flying speed of an entity.
 */
declare interface FlyingSpeed {
	/**
	 * Identifier of this component.
	 */
	id: 'minecraft:flying_speed'

	/**
	 * Speed while flying value of the entity.
	 */
	value: number
}

declare interface MovementAmphibious {
	/**
	 * Identifier of this component.
	 */
	id: 'minecraft:movement.amphibious'

	/**
	 * The maximum number in degrees the mob can turn per tick.
	 */
	maxTurn: number
}

declare interface MovementBasic {
	/**
	 * Identifier of this component.
	 */
	id: 'minecraft:movement.basic'

	/**
	 * The maximum number in degrees the mob can turn per tick.
	 */
	maxTurn: number
}

declare interface MovementGeneric {
	/**
	 * Identifier of this component.
	 */
	id: 'minecraft:movement.generic'

	/**
	 * The maximum number in degrees the mob can turn per tick.
	 */
	maxTurn: number
}

declare interface MovementFly {
	/**
	 * Identifier of this component.
	 */
	id: 'minecraft:movement.fly'

	/**
	 * The maximum number in degrees the mob can turn per tick.
	 */
	maxTurn: number
}

declare interface MovementGlide {
	/**
	 * Identifier of this component.
	 */
	id: 'minecraft:movement.glide'

	/**
	 * The maximum number in degrees the mob can turn per tick.
	 */
	maxTurn: number
}

declare interface MovementHover {
	/**
	 * Identifier of this component.
	 */
	id: 'minecraft:movement.hover'

	/**
	 * The maximum number in degrees the mob can turn per tick.
	 */
	maxTurn: number
}

declare interface MovementJump {
	/**
	 * Identifier of this component.
	 */
	id: 'minecraft:movement.jump'

	/**
	 * The maximum number in degrees the mob can turn per tick.
	 */
	maxTurn: number
}

declare interface MovementSkip {
	/**
	 * Identifier of this component.
	 */
	id: 'minecraft:movement.skip'

	/**
	 * The maximum number in degrees the mob can turn per tick.
	 */
	maxTurn: number
}

declare interface MovementSway {
	/**
	 * Identifier of this component.
	 */
	id: 'minecraft:movement.sway'

	/**
	 * The maximum number in degrees the mob can turn per tick.
	 */
	maxTurn: number

	/**
	 * Amount of sway frequency.
	 */
	swayFrequency: number

	/**
	 * Amplitude of the sway motion.
	 */
	swayAmplitude: number
}

/**
 * Adds a timer for the entity to grow up. It can be accelerated by giving the entity the items it likes as defined by feedItems.
 */
declare interface Ageable {
	/**
	 * Identifier of this component.
	 */
	id: 'minecraft:ageable'

	/**
	 * Amount of time before the entity grows up, -1 for always a baby.
	 */
	duration: number

	/**
	 * List of items that can be fed to the entity. Includes 'item' for the item name and 'growth' to define how much time it grows up by.
	 */
	feedItems: {
		/**
		 * Identifier of type of item that can be fed. If a namespace is not specified, 'minecraft:' is assumed. Example values include 'wheat' or 'golden_apple'.
		 */
		item: string

		/**
		 * The amount by which an entity's age will increase when fed this item. Values usually range between 0 and 1.
		 */
		growth: number
	}[]

	/**
	 * List of items that the entity drops when it grows up.
	 */
	dropItems: string[]

	/**
	 * Event to run when this entity grows up.
	 */
	growUp: any
}

/**
 * When added, this component makes the entity spawn with a rider of the specified entityType.
 */
declare interface AddRider {
	/**
	 * Identifier of this component.
	 */
	id: 'minecraft:addrider'

	/**
	 * The type of entity that is added as a rider for this entity when spawned under certain conditions.
	 */
	entityType: string

	/**
	 * Optional spawn event to trigger on the rider when that rider is spawned for this entity.
	 */
	spawnEvent: string
}

/**
 * Defines what blocks this entity can breathe in and gives them the ability to suffocate.
 */
declare interface Breathable {
	/**
	 * Identifier of this component.
	 */
	id: 'minecraft:breathable'

	/**
	 * Time in seconds the entity can hold its breath.
	 */
	totalSupply: number

	/**
	 * Time in seconds between suffocation damage.
	 */
	suffocateTime: number

	/**
	 * Time in seconds to recover breath to maximum.
	 */
	inhaleTime: number

	/**
	 * If true, this entity can breathe in air.
	 */
	breathesAir: boolean

	/**
	 * If true, this entity can breathe in water.
	 */
	breathesWater: boolean

	/**
	 * If true, this entity can breathe in lava.
	 */
	breathesLava: boolean

	/**
	 * If true, this entity can breathe in solid blocks.
	 */
	breathesSolids: boolean

	/**
	 * If true, this entity will have visible bubbles while in water.
	 */
	generatesBubbles: boolean

	/**
	 * List of blocks this entity can breathe in, in addition to the separate properties for classes of blocks.
	 */
	breatheBlocks: BlockPermutation[]

	/**
	 * List of blocks this entity can't breathe in.
	 */
	nonBreatheBlocks: BlockPermutation[]

	/**
	 * Sets the current air supply of the entity.
	 * @param value
	 * New air supply for the entity.
	 */
	setAirSupply(value: number): void
}

declare interface Navigation {
	/**
	 * Tells the pathfinder whether or not it can walk on the ground or go underwater.
	 */
	isAmphibious: boolean

	/**
	 * Whether or not the pathfinder should avoid tiles that are exposed to the sun when creating paths.
	 */
	avoidSun: boolean

	/**
	 * Whether a path can be created through a door.
	 */
	canPassDoors: boolean

	/**
	 * Tells the pathfinder that it can path through a closed door assuming the AI will open the door.
	 */
	canOpenDoors: boolean

	/**
	 * Tells the pathfinder that it can path through a closed iron door assuming the AI will open the door.
	 */
	canOpenIronDoors: boolean

	/**
	 * Tells the pathfinder that it can path through a closed door and break it.
	 */
	canBreakDoors: boolean

	/**
	 * Tells the pathfinder to avoid water when creating a path.
	 */
	avoidWater: boolean

	/**
	 * Tells the pathfinder to avoid blocks that cause damage when finding a path.
	 */
	avoidDamageBlocks: boolean

	/**
	 * Tells the pathfinder whether or not it can float.
	 */
	canFloat: boolean

	/**
	 * Tells the pathfinder whether or not it will be pulled down by gravity while in water.
	 */
	canSink: boolean

	/**
	 * Tells the pathfinder whether or not it can travel on the surface of the water.
	 */
	canPathOverWater: boolean

	/**
	 * Tells the pathfinder whether or not it can travel on the surface of the lava.
	 */
	canPathOverLava: boolean

	/**
	 * Tells the pathfinder whether or not it can travel in lava like walking on ground.
	 */
	canWalkInLava: boolean

	/**
	 * Tells the pathfinder to avoid portals (like nether portals) when finding a path.
	 */
	avoidPortals: boolean

	/**
	 * Tells the pathfinder whether or not it can walk on the ground outside water.
	 */
	canWalk: boolean

	/**
	 * Tells the pathfinder whether or not it can path anywhere through water and plays swimming animation along that path.
	 */
	canSwim: boolean

	/**
	 * Tells the pathfinder whether or not it can jump out of water (like a dolphin).
	 */
	canBreach: boolean

	/**
	 * Tells the pathfinder whether or not it can jump up blocks.
	 */
	canJump: boolean

	/**
	 * Tells the pathfinder that it can start pathing when in the air.
	 */
	canPathFromAir: boolean
}

declare interface NavigationFly extends Navigation {
	/**
	 * Identifier of this component.
	 */
	id: 'minecraft:navigation.fly'
}

declare interface NavigationClimb extends Navigation {
	/**
	 * Identifier of this component.
	 */
	id: 'minecraft:navigation.climb'
}

declare interface NavigationFloat extends Navigation {
	/**
	 * Identifier of this component.
	 */
	id: 'minecraft:navigation.float'
}

declare interface NavigationGeneric extends Navigation {
	/**
	 * Identifier of this component.
	 */
	id: 'minecraft:navigation.generic'
}

declare interface NavigationHover extends Navigation {
	/**
	 * Identifier of this component.
	 */
	id: 'minecraft:navigation.hover'
}

declare interface NavigationWalk extends Navigation {
	/**
	 * Identifier of this component.
	 */
	id: 'minecraft:navigation.walk'
}

/**
 * Defines the base movement speed in lava of this entity.
 */
declare interface LavaMovement {
	/**
	 * Identifier of this component.
	 */
	id: 'minecraft:lava_movement'

	/**
	 * Value for movement speed on lava as defined through entity components.
	 */
	value: number

	/**
	 * Returns the current value of movement speed on lava for the entity.
	 * @readonly
	 */
	current: number

	/**
	 * Sets the current value of movement speed on lava for the entity.
	 * @param value
	 */
	setCurrent(value: number): void

	/**
	 * Resets the movement speed on lava speed to the minimum value.
	 */
	resetToMinValue(): void

	/**
	 * Resets the movement speed on lava to the maximum value for the entity.
	 */
	resetToMaxValue(): void

	/**
	 * Resets the current movement speed on lava for the entity to its default value.
	 */
	resetToDefaultValue(): void
}

/**
 * Defines the general movement speed underwater of this entity.
 */
declare interface UnderwaterMovement {
	/**
	 * Identifier of this component.
	 */
	id: 'minecraft:underwater_movement'

	/**
	 * Value for movement speed underwater as defined through entity components.
	 */
	value: number

	/**
	 * Returns the current value of movement speed underwater for the entity.
	 * @readonly
	 */
	current: number

	/**
	 * Sets the current value of movement speed underwater for the entity.
	 * @param value
	 */
	setCurrent(value: number): void

	/**
	 * Resets the movement speed underwater to the minimum value as defined by the component state of this entity.
	 */
	resetToMinValue(): void

	/**
	 * Resets the movement speed underwater to the maximum value for the entity, as determined by the set of components that are on the entity.
	 */
	resetToMaxValue(): void

	/**
	 * Resets the current movement speed underwater for the entity to the default value implied by the current component state of the entity.
	 */
	resetToDefaultValue(): void
}

/**
 * Defines the entity's strength to carry items.
 */
declare interface Strength {
	/**
	 * Identifier of this component.
	 */
	id: 'minecraft:strength'

	/**
	 * Current strength value of this entity, after any effects or component updates are applied.
	 */
	value: number

	/**
	 * Maximum strength of this entity, as defined in the entity type definition.
	 */
	max: number
}

// Block Components

/**
 * Represents the inventory of a block in the world. Used with blocks like chests.
 */
declare interface BlockInventory {
	container: Container
}

declare interface BlockPiston {
	location: BlockLocation

	/**
	 * A set of locations for blocks that are impacted by the activation of this piston.
	 */
	attatchedBlocks: BlockLocation[]

	/**
	 * Whether the piston is in the process of expanding or retracting.
	 */
	isMoving: boolean

	/**
	 * Whether the piston is fully expanded.
	 */
	isExpanded: boolean

	/**
	 * Whether the piston is in the process of expanding.
	 */
	isExpanding: boolean

	/**
	 * Whether the piston is in the process of retracting.
	 */
	isRetracting: boolean

	/**
	 * Whether the piston is fully retracted.
	 */
	isRetracted: boolean
}
