export async function guessValue(line: string) {
	// 1. Find the part of the key that isn't a common key prefix/suffix (e.g. the identifier)
	const commonParts = ['name', 'tile', 'item', 'entity', 'action']
	const key = line.substring(0, line.length - 1)
	let uniqueParts = key
		.split('.')
		.filter((part) => !commonParts.includes(part))

	// 2. If there are 2 parts and one is spawn_egg, then state that "Spawn " should be added to the front of the value
	const spawnEggIndex = uniqueParts.indexOf('spawn_egg')
	const isSpawnEgg = uniqueParts.length === 2 && spawnEggIndex >= 0
	if (isSpawnEgg) uniqueParts.slice(spawnEggIndex, spawnEggIndex + 1)

	// 3. If there is still multiple parts left, search for the part with a namespaced identifier, as that is commonly the bit being translated (e.g. "minecraft:pig" -> "Pig")
	if (uniqueParts.length > 1) {
		const id = uniqueParts.find((part) => part.includes(':'))
		if (id) uniqueParts = [id]
	}

	// 4. Hopefully there is only one part left now, if there isn't, the first value will be used. If the value is a namespace (contains a colon), remove the namespace, then capitalise and propose
	if (!uniqueParts[0]) return ''

	if (uniqueParts[0].includes(':'))
		uniqueParts[0] = uniqueParts[0].split(':').pop() ?? ''
	const translation = `${isSpawnEgg ? 'Spawn ' : ''}${uniqueParts[0]
		.split('_')
		.map((val) => `${val[0].toUpperCase()}${val.slice(1)}`)
		.join(' ')}`

	return translation
}
