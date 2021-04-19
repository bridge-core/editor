declare const server: {
	/**
	 * Registers the system
	 * @param v0
	 * This is the major version of the Minecraft Script Engine your script was designed to work with
	 * @param v1
	 * This is the revision of the Minecraft Script Engine your script was designed to work with
	 */
	registerSystem(v0: number, v1: number): ServerSystem
	/**
	 * Allows logging a message to a content log file
	 * @param message
	 * The message that you want to send to the log file
	 */
	log(message: string): void
}

declare interface ServerSystem {
	initialize?: () => void
	update?: () => void
	shutdown?: () => void

	/**
	 * @param eventName 
	 * This is the identifier of the custom event we are registering. The namespace is required and can't be set to minecraft.
	 */
	createEventData<T extends keyof TriggerableServerEvents>(
		eventName: T
	): TriggerableServerEvents[T]
	/**
	 * 
	 * @param eventName 
	 * This is the identifier of the custom event we are registering. The namespace is required and can't be set to minecraft.
	 * @param eventData 
	 * The JavaScript object with the correct fields and default values for the event
	 */
	registerEventData<T extends keyof TriggerableServerEvents>(
		eventName: T,
		eventData: TriggerableServerEvents[T]
	): boolean
	/**
	 * @param eventName
	 * This is the identifier of the event we want to react to. Can be the identifier of a built-in event or a custom one from script
	 * @param eventData
	 * The data for the event. You can create a new JavaScript Object with the parameters you want to pass in to the listener and the engine will take care of delivering the data to them
	 */
	broadcastEvent: (
		eventName: keyof TriggerableServerEvents,
		eventData: TriggerableServerEvents[typeof eventName]
	) => void
	/**
	 * 
	 * @param eventName 
	 * This is the identifier of the event to which we want to react. Can be the identifier of a built-in event or a custom one from script
	 * @param callback 
	 * The JavaScript object that will get called whenever the event is broadcast
	 */
	listenForEvent<T extends keyof ListenableServerEvents>(
		eventName: T,
		callback: (eventData: ListenableServerEvents[T]) => void
	): void

	/**
	 * Entities are created first on the server, with the client notified of new entities afterwards. Be aware that if you send the result object to the client right away, the created entity might not exist on the client yet.
	 * @param type 
	 * Specifies the type of the entity that is being created by the template. Valid inputs are `entity` and `item_entity`
	 * @param identifier 
	 * This can be any of the entity identifiers from the applied Behavior Packs. For example specifying minecraft:cow here will make the provided entity a cow as defined in JSON
	 */
	createEntity(type: 'entity' | 'client_entity', identifier: string): void
	/**
	 * @param entity 
	 * The object that was retrieved from a call to createEntity() or retrieved from an entity event
	 */
	destroyEntity(entity: EntityJS): void
	/**
	 * @param entity 
	 * The object that was retrieved from a call to createEntity() or retrieved from an entity event
	 */
	isValidEntity(entity: EntityJS): boolean

	/**
	 * @param componentIdentifier 
	 * The identifier of the custom component. It is required to use a namespace so you can uniquely refer to it later without overlapping a name with a built-in component: for example 'myPack:myCustomComponent'
	 * @param componentData 
	 * A JavaScript Object that defines the name of the fields and the data each field holds inside the component.
	 */
	registerComponent(componentIdentifier: string, componentData: unknown)
	/**
	 * @param entity 
	 * The EntityObject that was retrieved from a call to createEntity() or retrieved from an event
	 * @param componentIdentifier 
	 * The identifier of the component to add to the entity. This is either the identifier of a built-in component (check the Script Components section) or a custom component created with a call to registerComponent()
	 */
	createComponent(
		entity: EntityJS | BlockJS,
		componentIdentifier: string
	): ComponentJS
	/**
	 * 
	 * @param entity 
	 * The EntityObject that was retrieved from a call to createEntity() or retrieved from an event
	 * @param componentIdentifier 
	 * The identifier of the component to check on the entity. This is either the identifier of a built-in component (check the Script Components section) or a custom component created with a call to registerComponent()
	 */
	hasComponent(
		entity: EntityJS | BlockJS,
		componentIdentifier: string
	): boolean
	/**
	 * @param entity 
	 * The EntityObject that was retrieved from a call to createEntity() or retrieved from an event
	 * @param componentIdentifier 
	 * The identifier of the component to retrieve from the entity. This is either the identifier of a built-in component (check the Script Components section) or a custom component created with a call to registerComponent()
	 */
	getComponent(
		entity: EntityJS | BlockJS,
		componentIdentifier: string
	): ComponentJS
	/**
	 * 
	 * @param entity 
	 * The entity object that we are applying the component changes to
	 * @param component 
	 * The component object retrieved from the entity that was returned by either createComponent() or getComponent()
	 */
	applyComponentChanges(
		entity: EntityJS | BlockJS,
		component: ComponentJS
	): boolean
	/**
	 * 
	 * @param entity 
	 * The EntityObject that was retrieved from a call to createEntity() or retrieved from an event
	 * @param component 
	 * The identifier of the component to remove from the entity. This is either the identifier of a built-in component (check the Script Components section) or a custom component created with a call to registerComponent()
	 */
	destroyComponent(
		entity: EntityJS | BlockJS,
		component: ComponentJS
	): boolean

	/**
	 * Allows you to register a query. A query will contain all entities that meet the filter requirement.
	 * No filters are added by default when you register a query so it will capture all entities.
	 * @param componentIdentifier
	 * This is the identifier of the component that will be used to filter entities when
	 * @param field1
	 * This is the identifier of the component that will be used to filter entities when
	 * @param field2
	 * This is the name of the second field of the component that we want to filter entities by. By default this is set to y.
	 * @param field3
	 * This is the name of the third field of the component that we want to filter entities by. By default this is set to z.
	 */
	registerQuery(
		componentIdentifier: string,
		field1?: string,
		field2?: string,
		field3?: string
	): QueryJS
	/**
	 * @param query Allows you to add filters to your query. The query will only contain entities that have all the components specified.
By default no filters are added. This will allow queries to capture all entities.
	 * @param componentIdentifer 
	 */
	addFilterToQuery(query: QueryJS, componentIdentifer: string): void
	/**
	 * Allows you to fetch the entities captured by a query.
	 * @param query 
	 * This is the query you registered earlier using registerQuery()
	 */
	getEntitiesFromQuery(query: QueryJS): EntityJS[]
	/**
	 * Allows you to fetch the entities captured by a query that was created with a component filter built-in. The only entities that will be returned are those entities that have the component that was defined when the query was registered and that have a value in the three fields on that component that were defined in the query within the values specified in the call to getEntitiesFromQuery.
	 * @param query 
	 * This is the query you created earlier using registerQuery(...)
	 * @param field1Min 
	 * The minimum value that the first component field needs to be on an entity for that entity to be included in the query
	 * @param field2Min 
	 * The minimum value that the second component field needs to be on an entity for that entity to be included in the query
	 * @param field3Min 
	 * The minimum value that the third component field needs to be on an entity for that entity to be included in the query
	 * @param field1Max 
	 * The maximum value that the first component field needs to be on an entity for that entity to be included in the query
	 * @param field2Max 
	 * The maximum value that the second component field needs to be on an entity for that entity to be included in the query
	 * @param field3Max 
	 * The maximum value that the third component field needs to be on an entity for that entity to be included in the query
	 */
	getEntitiesFromQuery(
		query: QueryJS,
		field1Min?: number,
		field2Min?: number,
		field3Min?: number,
		field1Max?: number,
		field2Max?: number,
		field3Max?: number
	): EntityJS[]

	/**
	 * Allows you to get a block from the world when provided an x, y, and z position. The block must be within a ticking area.
	 * @param tickingArea 
	 * The ticking area the block is in
	 * @param x 
	 * The x position of the block you want
	 * @param y 
	 * The y position of the block you want
	 * @param z 
	 * The z position of the block you want
	 */
	getBlock(
		tickingArea: TickingAreaJS,
		x: number,
		y: number,
		z: number
	): BlockJS | null
	/**
	 * Allows you to get a block from the world when provided a JavaScript object containing a position. The block must be within a ticking area.
	 * @param tickingArea 
	 * The ticking area the block is in
	 * @param position 
	 * A JavaScript object with the x, y, and z position of the
	 */
	getBlock(
		tickingArea: TickingAreaJS,
		position: { x: number; y: number; z: number }
	): BlockJS | null
	/**
	 * Allows you to get an array of blocks from the world when provided a minimum and maximum x, y, and z position. The blocks must be within a ticking area. This call can be slow if given a lot of blocks, and should be used infrequently.
	 * @param tickingArea 
	 * The ticking area the blocks are in
	 * @param minX 
	 * The minimum x position of the blocks you want
	 * @param minY 
	 * The minimum y position of the blocks you want
	 * @param minZ 
	 * The minimum z position of the blocks you want
	 * @param maxX 
	 * The maximum x position of the blocks you want
	 * @param maxY 
	 * The maximum y position of the blocks you want
	 * @param maxZ 
	 * The maximum z position of the blocks you want
	 */
	getBlocks(
		tickingArea: TickingAreaJS,
		minX: number,
		minY: number,
		minZ: number,
		maxX: number,
		maxY: number,
		maxZ: number
	): BlockJS[][][] | null
	/**
	 * Allows you to get an array of blocks from the world when provided a minimum and maximum position. The blocks must be within a ticking area. This call can be slow if given a lot of blocks, and should be used infrequently.
	 * @param tickingArea 
	 * The ticking area the blocks are in
	 * @param positionMin 
	 * A JavaScript object with the minimum x, y, and z position of the blocks you want
	 * @param positionMax 
	 * A JavaScript object with the maximum x, y, and z position of the blocks you want
	 */
	getBlocks(
		tickingArea: TickingAreaJS,
		positionMin: { x: number; y: number; z: number },
		positionMax: { x: number; y: number; z: number }
	): BlockJS[][][] | null

	/**
	 * 
	 * @param command 
	 * The slash command to run
	 * @param callback 
	 * The JavaScript object that will be called after the command executes
	 */
	executeCommand(
		command: string,
		callback: (eventData: { command: string; data: unknown }) => void
	): void
}

declare interface TriggerableServerEvents {
	'minecraft:entity_definition_event': EventData<{
		/**
		 * 	The entity object you want to attach the effect to
		 */
		entity: EntityJS
		/**
		 * The identifier of the event to trigger on that entity. Both built-in (minecraft:) and custom events are supported
		 */
		event: string
	}>
	'minecraft:display_chat_event': EventData<{
		/**
		 * The chat message that will be displayed
		 */
		message: string 
	}>
	'minecraft:execute_command': EventData<{ 
		/**
		 * The command that will be run
		 */
		command: string 
	}>
	'minecraft:play_sound': EventData<{
		/**
		 * The pitch of the sound effect. A value of 1.0 will play the sound effect with regular pitch
		 */
		pitch: number
		/**
		 * The position in the world we want to play the sound at
		 */
		position: [number, number, number]
		/**
		 * The identifier of the sound you want to play. Only sounds defined in the applied resource packs can be played
		 */
		sound: string
		/**
		 * 	The volume of the sound effect. A value of 1.0 will play the sound effect at the volume it was recorded at
		 */
		volume: number
	}>
	'minecraft:spawn_particle_attached_entity': EventData<{
		/**
		 * The identifier of the particle effect you want to attach to the entity. This is the same identifier you gave the effect in its JSON file
		 */
		effect: string
		/**
		 * The entity object you want to attach the effect to
		 */
		entity: EntityJS
		/**
		 * The offset from the entity's "center" where you want to spawn the effect
		 */
		offset: [number, number, number]
	}>
	'minecraft:spawn_particle_in_world': EventData<{
		/**
		 * The dimension in which you want to spawn the effect. Can be "overworld", "nether", or "the end"
		 */
		dimension: Dimension
		/**
		 * The identifier of the particle effect you want to attach to spawn. This is the same name you gave the effect in its JSON file
		 */
		effect: string
		/**
		 * The position in the world where you want to spawn the effect
		 */
		position: [number, number, number]
	}>
	'minecraft:script_logger_config': EventData<{
		/**
		 * Set to true to log any scripting errors that occur on the server
		 */
		log_errors?: boolean
		/**
		 * Set to true to log any general scripting information that occurs on the server. This includes any logging done with server.log()
		 */
		log_information?: boolean
		/**
		 * 	Set to true to log any scripting warnings that occur on the server
		 */
		log_warnings?: boolean
	}>
}
declare interface ListenableServerEvents {
	'minecraft:entity_attack': {
		/**
		 * The entity that attacked
		 */
		entity: EntityJS
		/**
		 * The entity that was targeted in the attack
		 */
		target: EntityJS
	}
	'minecraft:player_attacked_entity': {
		/**
		 * The entity that was attacked by the player
		 */
		attacked_entity: EntityJS
		/**
		 * The player that attacked an entity
		 */
		player: EntityJS
	}
	'minecraft:entity_acquired_item': {
		/**
		 * The entity who acquired the item
		 */
		entity: EntityJS
		/**
		 * If it exists, the entity that affected the item before it was acquired. Example: A player completes a trade with a villager. The `entity` property would be the player and the `secondary_entity` would be the villager
		 */
		secondary_entity: EntityJS | null
		/**
		 * The item that was acquired
		 */
		item_stack: ItemStackJS
		/**
		 * The way the entity acquired the item
		 */
		acquisition_method: string
		/**
		 * The total number of items acquired by the entity during this event
		 */
		acquired_amount: number
	}
	'minecraft:entity_carried_item_changed': {
		/**
		 * The entity that changed what they were carrying
		 */
		entity: EntityJS
		/**
		 * The item that is now in the entities hands
		 */
		carried_item: ItemStackJS
		/**
		 * The item that was previously in the entities hands
		 */
		previous_carried_item: ItemStackJS
		/**
		 * Defines which hand the item was equipped to. Either main or offhand.
		 */
		hand: 'main' | 'offhand'
	}
	'minecraft:entity_created': {
		/**
		 * The entity that was just created
		 */
		entity: EntityJS
	}
	'minecraft:entity_definition_event': {
		/**
		 * The entity that was affected
		 */
		entity: EntityJS
		/**
		 * The event that was triggered
		 */
		event: string
	}
	'minecraft:entity_death': {
		/**
		 * The entity that died
		 */
		entity: EntityJS
		/**
		 * The entity that killed the entity
		 */
		killer: EntityJS | null
		/**
		 * The type of the projectile that killed the entity
		 */
		projectile_type: string | null
		/**
		 * The cause of the entity's death
		 */
		cause: string
		/**
		 * The position of the block that killed the entity
		 */
		block_position: { x: number; y: number; z: number } | null
	}
	'minecraft:entity_dropped_item': {
		/**
		 * The entity who dropped the item
		 */
		entity: EntityJS
		/**
		 * The item that was dropped
		 */
		item_stack: ItemStackJS
	}
	'minecraft:entity_equipped_armor': {
		/**
		 * The entity who is equipping the armor
		 */
		entity: EntityJS
		/**
		 * The armor that is being equipped
		 */
		item_stack: ItemStackJS
		/**
		 * Defines which slot the item was equipped to.
		 */
		slot: string
	}
	'minecraft:entity_hurt': {
		/**
		 * The amount the damage was reduced by by the entity's absorption effect
		 */
		absorbed_damage: number
		/**
		 * The amount of damage the entity took after immunity and armor are taken into account
		 */
		damage: number
		/**
		 * The entity that took damage
		 */
		entity: EntityJS
		/**
		 * Present only when damaged by an entity or projectile. The entity that attacked and caused the damage
		 */
		attacker: EntityJS | null
		/**
		 * Present only when damaged by a projectile. This is the identifier of the projectile that hit the entity
		 */
		projectile_type: string | null
		/**
		 * The way the entity took damage. Refer to the Damage Source documentation for a complete list of sources
		 */
		cause: string
		/**
		 * Present only when damaged by a block. This is the position of the block that hit the entity
		 */
		block_position: [number, number, number] | null
	}
	'minecraft:entity_move': {
		/**
		 * The entity that moved
		 */
		entity: EntityJS
	}
	'minecraft:entity_sneak': {
		/**
		 * The entity that changed their sneaking state
		 */
		entity: EntityJS
		/**
		 * If true, the entity just started sneaking. If false, the entity just stopped sneaking
		 */
		sneaking: boolean
	}
	'minecraft:entity_start_riding': {
		/**
		 * The rider
		 */
		entity: EntityJS
		/**
		 * The entity being ridden
		 */
		ride: EntityJS
	}
	'minecraft:entity_stop_riding': {
		/**
		 * The entity that was riding another entity
		 */
		entity: EntityJS
		/**
		 * If true, the rider stopped riding because they are now dead
		 */
		entity_is_being_destroyed: boolean
		/**
		 * If true, the rider stopped riding by their own decision
		 */
		exit_from_rider: boolean
		/**
		 * 	If true, the rider stopped riding because they are now riding a different entity
		 */
		switching_rides: boolean
	}
	'minecraft:entity_tick': {
		/**
		 * The entity that was ticked
		 */
		entity: EntityJS
	}
	'minecraft:entity_use_item': {
		/**
		 * 	The entity who is using the item
		 */
		entity: EntityJS
		/**
		 * 	The item that is being used
		 */
		item_stack: ItemStackJS
		/**
		 * 	The way the entity used the item
		 */
		use_method: string
	}
	'minecraft:block_destruction_started': {
		/**
		 * 	The position of the block that is being destroyed
		 */
		block_position: { x: number; y: number; z: number }
		/**
		 * The player that started destoying the block
		 */
		player: EntityJS
	}
	'minecraft:block_destruction_stopped': {
		/**
		 * The position of the block that was being destroyed
		 */
		block_position: { x: number; y: number; z: number }
		/**
		 * How far along the destruction was before it was stopped (0 - 1 range)
		 */
		destruction_progress: number
		/**
		 * The player that stopped destoying the block
		 */
		player: EntityJS
	}
	'minecraft:block_exploded': {
		/**
		 * The identifier of the block that was destroyed
		 */
		block_identifier: string
		/**
		 * 	The position of the block that was destroyed by the explosion
		 */
		block_position: { x: number; y: number; z: number }
		/**
		 * The cause of the block's destruction
		 */
		cause: string
		/**
		 * The entity that exploded
		 */
		entity: EntityJS
	}
	'minecraft:block_interacted_with': {
		/**
		 * The position of the block that is being interacted with
		 */
		block_position: { x: number; y: number; z: number }
		/**
		 * The player that interacted with the block
		 */
		player: EntityJS
	}
	'minecraft:piston_moved_block': {
		/**
		 * The position of the block that was moved
		 */
		block_position: { x: number; y: number; z: number }
		/**
		 * 	The action the piston took, "extended" or "retracted"
		 */
		piston_action: 'extended' | 'retracted'
		/**
		 * The position of the piston that moved the block
		 */
		pistion_position: { x: number; y: number; z: number }
	}
	'minecraft:player_destroyed_block': {
		/**
		 * 	The identifier of the block that was destroyed
		 */
		block_identifier: string
		/**
		 * 	The position of the block that was destroyed
		 */
		block_position: { x: number; y: number; z: number }
		/**
		 * The player that destroyed the block
		 */
		player: EntityJS
	}
	'minecraft:player_placed_block': {
		/**
		 * 	The position of the block that was placed
		 */
		block_position: { x: number; y: number; z: number }#
		/**
		 * The player that placed the block
		 */
		player: EntityJS
	}
	'minecraft:play_sound': {
		/**
		 * The pitch of the sound effect. A value of 1.0 will play the sound effect with regular pitch
		 */
		pitch: number
		/**
		 * The position in the world we want to play the sound at
		 */
		position: [number, number, number]
		/**
		 * The identifier of the sound you want to play. Only sounds defined in the applied resource packs can be played
		 */
		sound: string
		/**
		 * The volume of the sound effect. A value of 1.0 will play the sound effect at the volume it was recorded at
		 */
		volume: number
	}
	'minecraft:projectile_hit': {
		/**
		 * The entity that was hit by the projectile, if any
		 */
		entity: EntityJS | null
		/**
		 * The entity that fired the projectile
		 */
		owner: EntityJS
		/**
		 * 	The position of the collision
		 */
		position: [number, number, number]
		/**
		 * The projectile in question
		 */
		projectile: EntityJS
	}
	'minecraft:weather_changed': {
		/**
		 * The name of the dimension where the weather change happened
		 */
		dimension: Dimension
		/**
		 * Tells if the new weather has lightning
		 */
		lightning: boolean
		/**	
		 * Tells if the new weather has rain
		 */
		raining: boolean
	}
}
