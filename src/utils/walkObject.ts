import { isMatch } from 'micromatch'

export function walkObject(
	path: string,
	obj: any,
	onReach: (data: any) => void
) {
	const keys = path.length === 0 || path === '/' ? [] : path.split('/')
	return _walkObject(keys, obj, onReach)
}

function _walkObject(
	keys: string[],
	current: any,
	onReach: (data: any) => void
) {
	if (current === undefined) return
	if (keys.length === 0) return onReach(current)
	if (typeof current !== 'object') return // Needs to be last because we want to make sure onReach gets called if possible

	const key = keys.shift()!
	if (key === '**') {
		while (keys.length > 0 && keys[0] === '*') {
			keys.shift()
		}

		const matcher = ['**', ...keys].join('/')
		const collectedPaths = new Set<string>()
		collectAllPaths('', current, collectedPaths)
		for (const path of collectedPaths) {
			if (isMatch(path, matcher)) {
				_walkObject(path.split('/'), current, onReach)
			}
		}
	} else if (key.startsWith('*')) {
		let filterRegExp: RegExp | undefined = undefined
		if (key.length >= 1)
			filterRegExp = new RegExp(key.match(/(\*{)(.+)(})/)?.[2] ?? '.*')

		for (const key in current) {
			if (filterRegExp && key.match(filterRegExp) !== null)
				_walkObject([...keys], current[key], onReach)
		}
	} else _walkObject(keys, current[key], onReach)
}

function collectAllPaths(
	currPath: string,
	current: any,
	allPaths: Set<string>
) {
	for (const key in current) {
		allPaths.add(`${currPath}${key}`)

		if (typeof current[key] === 'object') {
			collectAllPaths(`${currPath}${key}/`, current[key], allPaths)
		}
	}
}

export function setObjectAt<T = any>(
	path: string,
	obj: any,
	onSet: (data: T) => T
) {
	const keys = path.length === 0 || path === '/' ? [] : path.split('/')
	if (keys.length === 0) return

	const lastKey = keys.pop()

	_walkObject(keys, obj, (currentObj) => {
		for (const key in currentObj) {
			if (key === lastKey || lastKey === '*')
				currentObj[key] = onSet(currentObj[key])
		}
	})
}
