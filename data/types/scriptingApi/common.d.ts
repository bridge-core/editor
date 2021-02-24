declare interface EntityJS {
	/**
	 * @readonly This defines the type of object. Can be: "entity" or "item_entity".
	 */
	readonly __type__: 'entity' | 'item_entity'
	/**
	 * @readonly
	 * This is the identifier for the object in the format namespace:name. For example, if the type is entity and the object is representing a vanilla cow, the identifier would be minecraft:cow.
	 */
	readonly __identifier__: string
	/**
	 * @readonly
	 * This is the unique identifier of the entity.
	 */
	readonly id: number
}
declare interface LevelJS {
	/**
	 * @readonly
	 * This defines the type of object. Will be: "level".
	 */
	readonly __type__: 'level'
	/**
	 * @readonly
	 * This is the unique identifier of the level.
	 */
	readonly level_id: number
}
declare interface ComponentJS {
	/**
	 * @readonly
	 * This defines the type of object. Will be: "component".
	 */
	readonly __type__: 'component'
	/**
	 * This is the content of the component.
	 */
	data: unknown
}
declare interface QueryJS {
	/**
	 * @readonly
	 * This defines the type of object. Will be: "query".
	 */
	readonly __type__: 'query'
	/**
	 * @readonly
	 * This is the unique identifier of the query.
	 */
	readonly query_id: 'string'
}
declare interface ItemStackJS {
	/**
	 * @readonly
	 * This defines the type of object. Will be: "item_stack".
	 */
	readonly __type__: 'item_stack'
	/**
	 * @readonly
	 * This is the identifier for the object in the format namespace:name. For example, if the type is entity and the object is representing a vanilla cow, the identifier would be minecraft:cow.
	 */
	readonly __identifier__: string
	/**
	 * @readonly
	 * This is the identifier of the item.
	 */
	readonly item: string
	/**
	 * @readonly
	 * This is the number of items in the stack.
	 */
	readonly count: number
}
declare interface EntityTickingAreaJS {
	/**
	 * @readonly
	 * This defines the type of object. Will be: "entity_ticking_area".
	 */
	readonly __type__: 'entity_ticking_area'
	/**
	 * @readonly
	 * This is the unique identifier of the ticking area.
	 */
	readonly entity_ticking_area_id: number
}
declare interface LevelTickingAreaJS {
	/**
	 * @readonly
	 * This defines the type of object. Will be: "level_ticking_area".
	 */
	readonly __type__: 'level_ticking_area'
	/**
	 * @readonly
	 * This is the unique identifier of the ticking area.
	 */
	readonly level_ticking_area_id: number
}
declare interface BlockJS {
	/**
	 * @readonly
	 * This defines the type of object. Will be: "block".
	 */
	readonly __type__: 'block'
	/**
	 * @readonly
	 * This is the identifier for the object in the format namespace:name. For example, if the type is block and the object is representing a block of bedrock, the identifier would be minecraft:bedrock
	 */
	readonly __identifier__: string
	/**
	 * @readonly
	 * This is the position of the block and it functions as part of its unique identifier.
	 */
	readonly block_position: {
		/**
		 * @readonly
		 * The x position.
		 */
		readonly x: number
		/**
		 * @readonly
		 * The y position.
		 */
		readonly y: number
		/**
		 * @readonly
		 * The z position.
		 */
		readonly z: number
	}
	/**
	 * @readonly
	 * This is the ticking area object that was used to get this block.
	 */
	readonly ticking_area: TickingAreaJS
}
declare type TickingAreaJS = EntityTickingAreaJS | LevelTickingAreaJS

declare interface EventData<T> {
	data: T
}
declare type Dimension = 'overworld' | 'nether' | 'the_end'
