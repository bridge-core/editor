let keys = []
const data = get('minecraft:recipe_shaped/pattern/*')
data.forEach((value) => {
	keys = keys.concat(value.split(''))
})

return {
	keep: failedCurrentFileLoad,
	type: 'enum',
	generateFile: 'recipe/dynamic/currentContext/recipeKey.json',
	data: keys.filter((key) => key !== ' '),
}
