module.exports = async ({ createFile, loadPresetFile, models }) => {
	let { MODEL, IDENTIFIER, MODEL_SAVE_PATH, DEFAULT_MODEL } = models
	if (!MODEL) MODEL = await loadPresetFile(DEFAULT_MODEL)
	const DATA = await MODEL.text()

	await createFile(`${MODEL_SAVE_PATH}${IDENTIFIER}.json`, DATA, {
		inject: ['IDENTIFIER'],
	})
}
