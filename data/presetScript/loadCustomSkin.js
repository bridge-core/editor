module.exports = async ({ createFile, loadPresetFile, models }) => {
    const {SKIN_FILE, IDENTIFIER, SAVE_PATH, DEFAULT_IMAGE } = models
    if(!SKIN_FILE) SKIN_FILE = await loadPresetFile(DEFAULT_IMAGE)

    await createFile(`${SAVE_PATH}${IDENTIFIER}.png`, SKIN_FILE)
}