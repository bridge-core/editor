export async function findAsync<T>(arr: T[], cb: (e: T) => Promise<boolean>) {
	const results = await Promise.all(arr.map(cb))
	const index = results.findIndex((result) => result)
	return arr[index]
}
