import type { editor, Position } from 'monaco-editor'
import { useJsoncParser } from '../libs/useJsoncParser'

export async function getLocation(
	model: editor.ITextModel,
	position: Position,
	removeFinalIndex = true
): Promise<string> {
	const { getLocation: jsoncGetLocation } = await useJsoncParser()
	const locationArr = jsoncGetLocation(
		model.getValue(),
		model.getOffsetAt(position)
	).path

	// Lightning cache definition implicitly indexes arrays so we need to remove indexes if they are at the last path position
	if (
		removeFinalIndex &&
		!isNaN(Number(locationArr[locationArr.length - 1]))
	) {
		locationArr.pop()
	}

	return locationArr.join('/')
}
