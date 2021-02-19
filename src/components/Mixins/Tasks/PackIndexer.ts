import { App } from '/@/App'

export const PackIndexerMixin = {
	data: () => ({
		isPackIndexerReady: true,
	}),
	mounted() {
		// App.ready.once(app =>
		// 	app.packIndexer.ready.on((this as any).setIsPackIndexerReady)
		// )
	},
	destroyed() {
		// App.ready.once(app =>
		// 	app.packIndexer.ready.off((this as any).setIsPackIndexerReady)
		// )
	},

	methods: {
		setIsPackIndexerReady(val: boolean) {
			;(this as any).isPackIndexerReady = val
		},
	},
}
