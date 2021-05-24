// Used if optionalImage is already in use in the preset
module.exports = async ({ createFile, loadPresetFile, models }) => {
	let {
		IMAGE2,
		IDENTIFIER,
		IMAGE_SAVE_PATH2,
		DEFAULT_IMAGE2,
		PRESET_PATH,
	} = models
	if (!IMAGE2) IMAGE2 = await loadPresetFile(DEFAULT_IMAGE2)

	await createFile(
		`${IMAGE_SAVE_PATH2}${PRESET_PATH}${IDENTIFIER}.png`,
		IMAGE2
	)
}
