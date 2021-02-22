import { build } from 'vite'
;(async () => {
	await build({
		base: process.argv[2] === '--nightly' ? '/nightly/' : undefined,
	})
})()
