export class Token {
	constructor(
		public value: string,
		public type: string,
		public start: number = 0,
		public end: number = 0
	) {}
}
