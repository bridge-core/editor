export function transformString(
	str: string,
	inject: string[],
	models: Record<string, any>
) {
	inject.forEach((val) => (str = str.replaceAll(`{{${val}}}`, models[val])))
	return str
}
