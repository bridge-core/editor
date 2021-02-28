module.exports = async ({ createFile, loadPresetFile, models }) => {
    const { MODEL, IDENTIFIER, MODEL_SAVE_PATH, DEFAULT_MODEL } = models
    if(!MODEL) MODEL = await loadPresetFile(DEFAULT_MODEL)

    await createFile(`${MODEL_SAVE_PATH}${IDENTIFIER}.json`, MODEL)
}