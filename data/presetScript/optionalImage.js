module.exports = async ({ createFile, loadPresetFile, models }) => {
	let { IMAGE, IDENTIFIER, SAVE_PATH, DEFAULT_IMAGE } = models
	if (!IMAGE) IMAGE = await loadPresetFile(DEFAULT_IMAGE)

	await createFile(`${SAVE_PATH}${IDENTIFIER}.png`, IMAGE)
}
