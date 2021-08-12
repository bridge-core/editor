/// <reference path="./picomatch.d.ts" />
import picomatch from './picomatch.js'

export function isMatch(path: string, pattern: string | string[]): boolean {
	if (Array.isArray(pattern)) return pattern.some((p) => isMatch(path, p))
	return picomatch(pattern)(path)
}
