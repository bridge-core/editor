import escapeRegExpString from 'escape-string-regexp'
import { ESearchType } from './Controls/SearchTypeEnum'

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

export function createRegExp(searchFor: string, searchType: ESearchType) {
	let regExp: RegExp
	try {
		regExp = new RegExp(
			searchType === ESearchType.useRegExp
				? searchFor
				: escapeRegExpString(searchFor),
			`g${searchType === ESearchType.ignoreCase ? 'i' : ''}`
		)
	} catch {
		return
	}
	return regExp
}
