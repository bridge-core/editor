module.exports = async ({ createFile, loadPresetFile, models }) => {
	const { LANGUAGE, FILE_NAME, SCRIPT_TYPE } = models
	const file =
		SCRIPT_TYPE === 'Client'
			? await loadPresetFile('scriptClient.js')
			: await loadPresetFile('scriptServer.js')

	await createFile(
		`BP/scripts/${SCRIPT_TYPE.toLowerCase()}/${FILE_NAME}.${
			LANGUAGE === 'JavaScript' ? 'js' : 'ts'
		}`,
		file
	)
}
