declare const client: {
	/**
	 * Registers the system
	 * @param v0
	 * This is the major version of the Minecraft Script Engine your script was designed to work with
	 * @param v1
	 * This is the revision of the Minecraft Script Engine your script was designed to work with
	 */
	registerSystem(v0: number, v1: number): ClientSystem
	/**
	 * Allows logging a message to a content log file
	 * @param message
	 * The message that you want to send to the log file
	 */
	log(message: string): void
}

declare interface ClientSystem {
	/**
	 * You can use this to set up the environment for your script: register custom components and events, sign up event listeners, etc. This will run BEFORE the world is ready and the player has been added to it. This function should be used to initialize variables and setup event listeners. You shouldn't try to spawn or interact with any entities at this point! You should also avoid interaction with UI elements or sending messages to the chat window since this is called before the player is ready.
	 */
	initialize?: () => void
	update?: () => void
	shutdown?: () => void

	createEventData<T extends keyof TriggerableClientEvents>(
		eventName: T
	): TriggerableClientEvents[T]
	broadcastEvent: (
		eventName: keyof TriggerableClientEvents,
		eventData: TriggerableClientEvents[typeof eventName]
	) => void
	listenForEvent<T extends keyof ListenableClientEvents>(
		eventName: T,
		callback: (eventData: ListenableClientEvents[T]) => void
	): void
}

declare interface TriggerableClientEvents {
	'minecraft:display_chat_event': EventData<{
		/**
		 * The chat message that will be displayed
		 */
		message: string
	}>
	'minecraft:load_ui': EventData<{
		/**
		 * The file path to the screen's HTML file
		 */
		path: string
		options?: UIOptions
	}>
	'minecraft:send_ui_event': EventData<{
		/**
		 * The data for the UI event being triggered
		 */
		data?: string
		/**
		 * The identifier of the UI event
		 */
		eventIdentifier: string
	}>
	'minecraft:spawn_particle_attached_entity': EventData<{
		/**
		 * The identifier of the particle effect you want to attach to the entity. This is the same name you gave the effect in its JSON file
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
		 * The identifier of the particle effect you want to attach to spawn. This is the same name you gave the effect in its JSON file
		 */
		effect: string
		/**
		 * The position in the world where you want to spawn the effect
		 */
		position: [number, number, number]
	}>
	'minecraft:unload_ui': EventData<any>
	'minecraft:script_logger_config': EventData<{
		/**
		 * 	Set to true to log any scripting errors that occur on the client
		 */
		log_errors?: boolean
		/**
		 * Set to true to log any general scripting information that occurs on the client. This includes any logging done with client.log()
		 */
		log_information?: boolean
		/**
		 * 	Set to true to log any scripting warnings that occur on the client
		 */
		log_warnings?: boolean
	}>
}
declare interface ListenableClientEvents {
	'minecraft:hit_result_changed': {
		/**
		 * 	The entity that was hit or null if it fired when moving off of an entity
		 */
		entity: EntityJS
		/**
		 * 	The position of the entity that was hit or null if it fired when moving off an entity
		 */
		position: [number, number, number] | null
	}
	'minecraft:hit_result_continuous': {
		/**
		 * The entity that was hit or null if it not pointing at an entity
		 */
		entity: EntityJS
		/**
		 * The position of the entity that was hit or block that was hit
		 */
		position: [number, number, number] | null
	}
	'minecraft:pick_hit_result_changed': {
		/**
		 * The entity that was hit or null if it fired when moving off of an entity
		 */
		entity: EntityJS
		/**
		 * The position of the entity that was hit or null if it fired when moving off an entity
		 */
		position: [number, number, number] | null
	}
	'minecraft:pick_hit_result_continuous': {
		/**
		 * The entity that was hit or null if it not pointing at an entity
		 */
		entity: EntityJS
		/**
		 * The position of the entity that was hit or block that was hit
		 */
		position: [number, number, number] | null
	}
}

declare interface UIOptions {
	/**
	 * If true, input will not be passed down to any other screens underneath
	 */
	absorbs_input?: boolean
	/**
	 * If true, the screen will always accept and process input for as long as it is in the stack, even if other custom UI screens appear on top of it
	 */
	always_accept_input?: boolean
	/**
	 * If true, this screen will be rendered even if another screen is on top of it and will render over them, including the HUD
	 */
	force_render_below?: boolean
	/**
	 * If true, the screen will be treated as the pause menu and the pause menu won't be allowed to show on top of this screen
	 */
	is_showing_menu?: boolean
	/**
	 * If true, the game will continue to be rendered underneath this screen
	 */
	render_game_behind?: boolean
	/**
	 * If true, this screen will only be rendered if it is the screen at the top of the stack
	 */
	render_only_when_topmost?: boolean
	/**
	 * If true, the screen will capture the mouse pointer and limit its movement to the UI screen
	 */
	should_steal_mouse?: boolean
}
