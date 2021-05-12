import { parse } from 'json5'

export const Json5Module = () => ({
	parse: (str: string) => parse(str),
})
