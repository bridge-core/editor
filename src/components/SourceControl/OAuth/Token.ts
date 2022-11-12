import { Signal } from '/@/components/Common/Event/Signal'

export class OauthToken {
	public static readonly setup = new Signal<void>()

	protected static value: string | null = localStorage.getItem('accessToken')

	static {
		if (this.value) {
			this.setup.dispatch()
		} else {
			const listener = (e: MessageEvent) => {
				if (e.data.type === 'accessToken') {
					this.set(e.data.value)
					window.removeEventListener('message', listener)
				}
			}
			window.addEventListener('message', listener)
		}
	}

	protected static set(value: string) {
		this.value = value
		localStorage.setItem('accessToken', value)
		this.setup.dispatch()
	}

	static get() {
		return this.value
	}
}
