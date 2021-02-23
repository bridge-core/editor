declare const client: {
	registerSystem(v0: number, v1: number): ClientSystem
	log(message: string): void
}

declare interface ClientSystem {
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
	'minecraft:display_chat_event': EventData<{ message: string }>
	'minecraft:load_ui': EventData<{ path: string; options?: UIOptions }>
	'minecraft:send_ui_event': EventData<{
		data?: string
		eventIdentifier: string
	}>
	'minecraft:spawn_particle_attached_entity': EventData<{
		effect: string
		entity: EntityJS
		offset: [number, number, number]
	}>
	'minecraft:spawn_particle_in_world': EventData<{
		effect: string
		position: [number, number, number]
	}>
	'minecraft:unload_ui': EventData<any>
	'minecraft:script_logger_config': EventData<{
		log_errors?: boolean
		log_information?: boolean
		log_warnings?: boolean
	}>
}
declare interface ListenableClientEvents {
	'minecraft:hit_result_changed': {
		entity: EntityJS
		position: [number, number, number] | null
	}
	'minecraft:hit_result_continuous': {
		entity: EntityJS
		position: [number, number, number] | null
	}
	'minecraft:pick_hit_result_changed': {
		entity: EntityJS
		position: [number, number, number] | null
	}
	'minecraft:pick_hit_result_continuous': {
		entity: EntityJS
		position: [number, number, number] | null
	}
}

declare interface UIOptions {
	absorbs_input?: boolean
	always_accept_input?: boolean
	force_render_below?: boolean
	is_showing_menu?: boolean
	render_game_behind?: boolean
	render_only_when_topmost?: boolean
	should_steal_mouse?: boolean
}
