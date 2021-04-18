module.exports = (text) => {
	const lines = text.split('\n')
	const langKeys = lines.map((line) => line.split('=').shift())

	const actions = langKeys.filter((langKey) => langKey.startsWith('action.'))
	return {
		actionText: actions,
	}
}
