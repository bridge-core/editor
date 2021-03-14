module.exports = (text) => {
	let tags = []
	const lines = text.split('\n')

	const addTags = lines.filter((line) =>
		/tag @(([a-z](\[.+\])?)) (add|remove) [a-zA-z_]+/g.exec(line)
	)
	addTags.forEach((line) => {
		let args = line.split(' ')
		tags.push(args[3].replace('\r', ''))
	})
	return {
		entityTag: tags,
	}
}
