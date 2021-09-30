export interface IBlock {
	version: 17879555
	name: string
	value?: number
	states?: IBlockStates
}
export interface IBlockStates {
	[key: string]: unknown
}

export class Block implements IBlock {
	public readonly version = 17879555
	public readonly name: string
	public readonly states: IBlockStates

	constructor(identifier: string, states?: IBlockStates) {
		this.name = identifier
		this.states = states ?? {}
	}
}
