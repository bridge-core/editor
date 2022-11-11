declare module 'quick-score' {
	declare class QuickScore<T = string> {
		constructor(words: T[]) {}

		search(
			pattern: string
		): {
			item: T
			score: number
			matches: [number, number][]
		}[]
	}

	declare function quickScore(word: string, pattern: string): number
}
