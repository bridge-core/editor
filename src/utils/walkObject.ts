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
	if (key.startsWith('*')) {
		let filterRegExp: RegExp | undefined = undefined
		if (key.length >= 1)
			filterRegExp = new RegExp(key.match(/(\*{)(.+)(})/)?.[2] ?? '.*')

		for (const key in current) {
			if (filterRegExp && key.match(filterRegExp) !== null)
				_walkObject([...keys], current[key], onReach)
		}
	} else _walkObject(keys, current[key], onReach)
}
