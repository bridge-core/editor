export namespace AppSettings {
	interface ISetting<T> {
		id: string
		component: Vue
		default: T
		value?: T
	}
	const settingsMap = new Map<string, ISetting<unknown>>()

	export function addCustomSetting<T>(setting: ISetting<T>) {
		settingsMap.set(setting.id, setting)

		return {
			dispose() {
				settingsMap.delete(setting.id)
			},
		}
	}

	export function getSetting(id: string) {
		const setting = settingsMap.get(id)
		return setting?.value ?? setting?.default
	}
}
