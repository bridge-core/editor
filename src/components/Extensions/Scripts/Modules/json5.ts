import json5 from 'json5'

export const Json5Module = () => ({
	parse: (str: string) => json5.parse(str),
})
