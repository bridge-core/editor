export async function walkObject(
	path: string,
	obj: any,
	onReach: (data: any) => void | Promise<void>
) {
	const keys = path.length === 0 || path === '/' ? [] : path.split('/')
	return await _walkObject(keys, obj, onReach)
}

async function _walkObject(
	keys: string[],
	current: any,
	onReach: (data: any) => void | Promise<void>
) {
	if (current === undefined) return
	if (keys.length === 0) return await onReach(current)
	if (typeof current !== 'object') return // Needs to be last because we want to make sure onReach gets called if possible

	const key = keys.shift()
	if (key === '*')
		await Promise.all(
			Object.values(current).map(child =>
				_walkObject([...keys], child, onReach)
			)
		)
	else await _walkObject(keys, current[key!], onReach)
}
