export class SmartError {
	constructor(
		public value: string | string[],
		public start: number = 0,
		public end: number = 0
	) {}
}
