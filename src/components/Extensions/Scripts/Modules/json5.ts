import json5 from 'json5'

export const Json5Module = () => ({
	parse: (str: string) => json5.parse(str),
	stringify: (
		obj: any,
		replacer?: ((this: any, key: string, value: any) => any) | undefined,
		space?: string | number | undefined
	) => JSON.stringify(obj, replacer, space),
})
