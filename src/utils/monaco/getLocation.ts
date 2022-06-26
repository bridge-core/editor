import type { editor, Position } from 'monaco-editor'
import { getLocation as jsoncGetLocation } from 'jsonc-parser'

export function getLocation(
	model: editor.ITextModel,
	position: Position
): string {
	const locationArr = jsoncGetLocation(
		model.getValue(),
		model.getOffsetAt(position)
	).path

	// Lightning cache definition implicitly indexes arrays so we need to remove indexes if they are at the last path position
	if (!isNaN(Number(locationArr[locationArr.length - 1]))) {
		locationArr.pop()
	}

	return locationArr.join('/')
}
