declare interface EntityJS {
	readonly __type__: 'entity' | 'item_entity'
	readonly __identifier__: string
	readonly id: number
}
declare interface LevelJS {
	readonly __type__: 'level'
	readonly level_id: number
}
declare interface ComponentJS {
	readonly __type__: 'component'
	data: unknown
}
declare interface QueryJS {
	readonly __type__: 'query'
	readonly query_id: 'string'
}
declare interface ItemStackJS {
	readonly __type__: 'item_stack'
	readonly __identifier__: string
	readonly item: string
	readonly count: number
}
declare interface EntityTickingAreaJS {
	readonly __type__: 'entity_ticking_area'
	readonly entity_ticking_area_id: number
}
declare interface LevelTickingAreaJS {
	readonly __type__: 'level_ticking_area'
	readonly level_ticking_area_id: number
}
declare interface BlockJS {
	readonly __type__: 'block'
	readonly __identifier__: string
	readonly item: string
	readonly block_position: {
		readonly x: number
		readonly y: number
		readonly z: number
	}
	readonly ticking_area: TickingAreaJS
}
declare type TickingAreaJS = EntityTickingAreaJS | LevelTickingAreaJS

declare interface EventData<T> {
	data: T
}
declare type Dimension = 'overworld' | 'nether' | 'the_end'
