declare const server: {
	registerSystem(v0: number, v1: number): ServerSystem
	log(message: string): void
}

declare interface ServerSystem {
	initialize?: () => void
	update?: () => void
	shutdown?: () => void

	createEventData<T extends keyof TriggerableServerEvents>(
		eventName: T
	): TriggerableServerEvents[T]
	registerEventData<T extends keyof TriggerableServerEvents>(
		eventName: T,
		eventData: TriggerableServerEvents[T]
	): boolean
	broadcastEvent: (
		eventName: keyof TriggerableServerEvents,
		eventData: TriggerableServerEvents[typeof eventName]
	) => void
	listenForEvent<T extends keyof ListenableServerEvents>(
		eventName: T,
		callback: (eventData: ListenableServerEvents[T]) => void
	): void

	createEntity(type: 'entity' | 'client_entity', identifier: string): void
	destroyEntity(entity: EntityJS): void
	isValidEntity(entity: EntityJS): boolean

	registerComponent(componentIdentifier: string, componentData: unknown)
	createComponent(
		entity: EntityJS | BlockJS,
		componentIdentifier: string
	): ComponentJS
	hasComponent(
		entity: EntityJS | BlockJS,
		componentIdentifier: string
	): boolean
	getComponent(
		entity: EntityJS | BlockJS,
		componentIdentifier: string
	): ComponentJS
	applyComponentChanges(
		entity: EntityJS | BlockJS,
		component: ComponentJS
	): boolean
	destroyComponent(
		entity: EntityJS | BlockJS,
		component: ComponentJS
	): boolean

	registerQuery(
		componentIdentifier: string,
		field1?: string,
		field2?: string,
		field3?: string
	): QueryJS
	addFilterToQuery(query: QueryJS, componentIdentifer: string): void
	getEntitiesFromQuery(query: QueryJS): EntityJS[]
	getEntitiesFromQuery(
		query: QueryJS,
		field1Min?: number,
		field2Min?: number,
		field3Min?: number,
		field1Max?: number,
		field2Max?: number,
		field3Max?: number
	): EntityJS[]

	getBlock(
		tickingArea: TickingAreaJS,
		x: number,
		y: number,
		z: number
	): BlockJS | null
	getBlock(
		tickingArea: TickingAreaJS,
		position: { x: number; y: number; z: number }
	): BlockJS | null
	getBlocks(
		tickingArea: TickingAreaJS,
		minX: number,
		minY: number,
		minZ: number,
		maxX: number,
		maxY: number,
		maxZ: number
	): BlockJS[][][] | null
	getBlocks(
		tickingArea: TickingAreaJS,
		positionMin: { x: number; y: number; z: number },
		positionMax: { x: number; y: number; z: number }
	): BlockJS[][][] | null

	executeCommand(
		command: string,
		callback: (eventData: { command: string; data: unknown }) => void
	): void
}

declare interface TriggerableServerEvents {
	'minecraft:entity_definition_event': EventData<{
		entity: EntityJS
		event: string
	}>
	'minecraft:display_chat_event': EventData<{ message: string }>
	'minecraft:execute_command': EventData<{ command: string }>
	'minecraft:play_sound': EventData<{
		pitch: number
		position: [number, number, number]
		sound: string
		volume: number
	}>
	'minecraft:spawn_particle_attached_entity': EventData<{
		effect: string
		entity: EntityJS
		offset: [number, number, number]
	}>
	'minecraft:spawn_particle_in_world': EventData<{
		dimension: Dimension
		effect: string
		position: [number, number, number]
	}>
	'minecraft:script_logger_config': EventData<{
		log_errors?: boolean
		log_information?: boolean
		log_warnings?: boolean
	}>
}
declare interface ListenableServerEvents {
	'minecraft:entity_attack': {
		entity: EntityJS
		target: EntityJS
	}
	'minecraft:player_attacked_entity': {
		attacked_entity: EntityJS
		player: EntityJS
	}
	'minecraft:entity_acquired_item': {
		entity: EntityJS
		secondary_entity: EntityJS | null
		item_stack: ItemStackJS
		acquisition_method: string
		acquired_amount: number
	}
	'minecraft:entity_carried_item_changed': {
		entity: EntityJS
		carried_item: ItemStackJS
		previous_carried_item: ItemStackJS
		hand: 'main' | 'offhand'
	}
	'minecraft:entity_created': {
		entity: EntityJS
	}
	'minecraft:entity_definition_event': {
		entity: EntityJS
		event: string
	}
	'minecraft:entity_death': {
		entity: EntityJS
		killer: EntityJS | null
		projectile_type: string | null
		cause: string
		block_position: { x: number; y: number; z: number } | null
	}
	'minecraft:entity_dropped_item': {
		entity: EntityJS
		item_stack: ItemStackJS
	}
	'minecraft:entity_equipped_armor': {
		entity: EntityJS
		item_stack: ItemStackJS
		slot: string
	}
	'minecraft:entity_hurt': {
		absorbed_damage: number
		damage: number
		entity: EntityJS
		attacker: EntityJS | null
		projectile_type: string | null
		cause: string
		block_position: [number, number, number] | null
	}
	'minecraft:entity_move': {
		entity: EntityJS
	}
	'minecraft:entity_sneak': {
		entity: EntityJS
		sneaking: boolean
	}
	'minecraft:entity_start_riding': {
		entity: EntityJS
		ride: EntityJS
	}
	'minecraft:entity_stop_riding': {
		entity: EntityJS
		entity_is_being_destroyed: boolean
		exit_from_rider: boolean
		switching_rides: boolean
	}
	'minecraft:entity_tick': {
		entity: EntityJS
	}
	'minecraft:entity_use_item': {
		entity: EntityJS
		item_stack: ItemStackJS
		use_method: string
	}
	'minecraft:block_destruction_started': {
		block_position: { x: number; y: number; z: number }
		player: EntityJS
	}
	'minecraft:block_destruction_stopped': {
		block_position: { x: number; y: number; z: number }
		destruction_progress: number
		player: EntityJS
	}
	'minecraft:block_exploded': {
		block_identifier: string
		block_position: { x: number; y: number; z: number }
		cause: string
		entity: EntityJS
	}
	'minecraft:block_interacted_with': {
		block_position: { x: number; y: number; z: number }
		player: EntityJS
	}
	'minecraft:piston_moved_block': {
		block_position: { x: number; y: number; z: number }
		piston_action: 'extended' | 'retracted'
		pistion_position: { x: number; y: number; z: number }
	}
	'minecraft:player_destroyed_block': {
		block_identifier: string
		block_position: { x: number; y: number; z: number }
		player: EntityJS
	}
	'minecraft:player_placed_block': {
		block_position: { x: number; y: number; z: number }
		player: EntityJS
	}
	'minecraft:play_sound': {
		pitch: number
		position: [number, number, number]
		sound: string
		volume: number
	}
	'minecraft:projectile_hit': {
		entity: EntityJS | null
		owner: EntityJS
		position: [number, number, number]
		projectile: EntityJS
	}
	'minecraft:weather_changed': {
		dimension: Dimension
		lightning: boolean
		raining: boolean
	}
}
