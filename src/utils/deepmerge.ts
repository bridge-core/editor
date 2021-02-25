export function deepMerge(obj1: any, obj2: any) {
	if (Array.isArray(obj1) && Array.isArray(obj2)) return obj1.concat(obj2)
	else if (Array.isArray(obj1)) return obj1.concat([obj2])
	else if (Array.isArray(obj2)) return obj2.concat([obj1])
	else if (typeof obj2 !== 'object') return obj2

	let res: any = {}

	for (const key in obj1) {
		if (obj2[key] === undefined) res[key] = obj1[key]
		else res[key] = deepMerge(obj1[key], obj2[key])
	}

	for (const key in obj2) {
		if (obj1[key] === undefined) res[key] = obj2[key]
	}

	return res
}

export function deepMergeAll(objs: any[]) {
	let current = objs[0]

	for (let i = 1; i < objs.length; i++) current = deepMerge(current, objs[i])

	return current
}
