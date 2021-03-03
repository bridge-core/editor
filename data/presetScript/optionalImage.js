module.exports = async ({ createFile, loadPresetFile, models }) => {
	let { IMAGE, IDENTIFIER, IMAGE_SAVE_PATH, DEFAULT_IMAGE } = models
	if (!IMAGE) IMAGE = await loadPresetFile(DEFAULT_IMAGE)

	await createFile(`${IMAGE_SAVE_PATH}${IDENTIFIER}.png`, IMAGE)
}
