import { buildChangelog } from './buildChangelog.mjs'

buildChangelog().catch((err) => {
	console.error(err)
	process.exit(1)
})
