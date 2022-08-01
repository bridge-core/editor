import escapeRegExpString from 'escape-string-regexp'
import { searchType } from './Controls/searchType'

export function processFileText(
	fileText: string,
	regExp: RegExp,
	replaceWith: string
) {
	return fileText.replace(regExp, (substring, ...groups) => {
		groups = groups.slice(0, -2)
		// This allows users to reference capture groups like this: {0}
		return replaceWith.replace(
			/{(\d+)}/g,
			(match, ...replaceGroups) =>
				groups[Number(replaceGroups[0])] ?? match
		)
	})
}

export function createRegExp(searchFor: string, type: number) {
	let regExp: RegExp
	try {
		regExp = new RegExp(
			type === searchType.useRegExp
				? searchFor
				: escapeRegExpString(searchFor),
			`g${type === searchType.ignoreCase ? 'i' : ''}`
		)
	} catch {
		return
	}
	return regExp
}
