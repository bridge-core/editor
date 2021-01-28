import { App } from '@/App'

export const TabSystemMixin = {
	data: () => ({
		tabSystem: null,
	}),
	mounted() {
		App.ready.once(app => ((this as any).tabSystem = app.tabSystem))
	},
}
