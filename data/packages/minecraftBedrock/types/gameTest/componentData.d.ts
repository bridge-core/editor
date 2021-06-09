declare interface Inventory {
	additionalSlotsPerStrength: number

	canBeSiphonedFrom: boolean

	containerType: string

	inventorySize: number

	private: boolean

	restrictToOwner: boolean

	container: Container
}
declare interface BlockInventory {
	container: Container
}
declare interface Container {
	/**
	 * Represents the size of the container. For example, a standard single-block chest has a size of 27, for the 27 slots in their inventory.
	 */
	size: number

	/**
	 *Contains a count of the slots in the container that are empty.
	 */
	emptySlotsCount: number

	setItem(slot: number, itemStack: ItemStack): void

	getItem(slot: number): ItemStack

	addItem(itemStack: ItemStack): void

	transferItem(
		fromSlot: number,
		toSlot: number,
		toContainer: Container
	): boolean

	swapItems(
		slot: number,
		otherSlot: number,
		otherContainer: Container
	): boolean
}

declare interface Color {
	id: 'minecraft:color'

	value: number
}

declare interface MountTaming {
	id: 'minecraft:tamemount'

	setTamed(showParticles: boolean): void
}

declare interface Saddled {
	id: 'minecraft:is_saddled'
}

declare interface Leashable {
	id: 'minecraft:leashable'

	softDistance: number

	leash(leashHolder: Entity): void

	unleash(): void
}

declare interface Health {
	id: 'minecraft:health'

	value: number

	current: number

	setCurrent(): void

	resetToMinValue(): void

	resetToMaxValue(): void

	resetToDefaultValue(): void
}

declare interface Rideable {
	id: 'minecraft:rideable'

	seatCount: number

	crouchingSkipInteract: boolean

	interactText: string

	familyTypes: string[]

	controllingSeat: number

	pullInEntities: boolean

	riderCanInteract: boolean

	seats: {
		position: any // TODO

		minRiderCount: number

		maxRiderCount: number

		lockRiderRotation: number
	}[]

	addRider(rider: Entity): boolean

	ejectRider(rider: Entity): void

	ejectRiders(): void
}

declare interface Tameable {
	id: 'minecraft:tameable'

	probability: number

	tameItems: string[]

	tameEvent: any // TODO

	tame(): boolean
}

declare interface Healable {
	id: 'minecraft:healable'

	filters: any // TODO

	forceUse: boolean

	items: {
		item: string

		healAmount: number

		effects: {
			amplifier: number

			chance: number

			duration: number

			name: string
		}[]
	}[]
}

declare interface Movement {
	id: 'minecraft:movement'

	value: number

	current: number

	setCurrent(): void

	resetToMinValue(): void

	resetToMaxValue(): void

	resetToDefaultValue(): void
}

declare interface FlyingSpeed {
	id: 'minecraft:flying_speed'

	value: number
}

declare interface MovementAmphibious {
	id: 'minecraft:movement.amphibious'

	maxTurn: number
}

declare interface MovementBasic {
	id: 'minecraft:movement.basic'

	maxTurn: number
}

declare interface MovementFly {
	id: 'minecraft:movement.fly'

	maxTurn: number
}

declare interface MovementGlide {
	id: 'minecraft:movement.glide'

	maxTurn: number
}

declare interface MovementHover {
	id: 'minecraft:movement.hover'

	maxTurn: number
}

declare interface MovementJump {
	id: 'minecraft:movement.jump'

	maxTurn: number
}

declare interface MovementSkip {
	id: 'minecraft:movement.skip'

	maxTurn: number
}

declare interface MovementSway {
	id: 'minecraft:movement.sway'

	maxTurn: number

	swayFrequency: number

	swayAmplitude: number
}

declare interface Ageable {
	id: 'minecraft:ageable'

	duration: number

	feedItems: {
		item: string

		growth: number
	}[]

	dropItems: string[]

	growUp: any // TODO
}

declare interface AddRider {
	id: 'minecraft:addrider'

	entityType: string

	spawnEvent: string
}

declare interface Breathable {
	id: 'minecraft:breathable'

	totalSupply: number

	suffocateTime: number

	inhaleTime: number

	breathesAir: boolean

	breathesWater: boolean

	breathesLava: boolean

	breathesSolids: boolean

	generatesBubbles: boolean

	breatheBlocks: string[]

	nonBreatheBlocks: string[]

	setAirSupply(value: number): void
}

declare interface Navigation {
	isAmphibious: boolean

	avoidSun: boolean

	canPassDoors: boolean

	canOpenDoors: boolean

	canOpenIronDoors: boolean

	canBreakDoors: boolean

	avoidWater: boolean

	avoidDamageBlocks: boolean

	canFloat: boolean

	canSink: boolean

	canPathOverWater: boolean

	canPathOverLava: boolean

	canWalkInLava: boolean

	avoidPortals: boolean

	canWalk: boolean

	canSwim: boolean

	canBreach: boolean

	canJump: boolean

	canPathFromAir: boolean
}

declare interface NavigationFly extends Navigation {
	id: 'minecraft:navigation.fly'
}

declare interface NavigationClimb extends Navigation {
	id: 'minecraft:navigation.climb'
}

declare interface NavigationFloat extends Navigation {
	id: 'minecraft:navigation.float'
}

declare interface NavigationGeneric extends Navigation {
	id: 'minecraft:navigation.generic'
}

declare interface NavigationHover extends Navigation {
	id: 'minecraft:navigation.hover'
}

declare interface NavigationWalk extends Navigation {
	id: 'minecraft:navigation.walk'
}

declare interface LavaMovement {
	id: 'minecraft:lava_movement'

	value: number

	current: number

	setCurrent(): void

	resetToMinValue(): void

	resetToMaxValue(): void

	resetToDefaultValue(): void
}

declare interface UnderwaterMovement {
	id: 'minecraft:underwater_movement'

	value: number

	current: number

	setCurrent(): void

	resetToMinValue(): void

	resetToMaxValue(): void

	resetToDefaultValue(): void
}

declare interface Strength {
	id: 'minecraft:strength'

	value: number

	max: number
}
