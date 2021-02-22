import { App } from '/@/App'

export const CompilerMixin = {
	data: () => ({
		isCompilerReady: true,
	}),
	mounted() {
		// App.ready.once(app =>
		// app.compiler.ready.on((this as any).setIsCompilerReady)
		// )
	},
	destroyed() {
		// App.ready.once(app =>
		// app.compiler.ready.off((this as any).setIsCompilerReady)
		// )
	},

	methods: {
		setIsCompilerReady(val: boolean) {
			;(this as any).isCompilerReady = val
		},
	},
}
