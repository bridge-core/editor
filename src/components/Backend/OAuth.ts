import { supabase } from './Supabase'
import { Signal } from '/@/components/Common/Event/Signal'

export class OAuth {
	public readonly token = new Signal<string>()

	constructor() {
		this.getToken().then((token) => {
			if (token) this.token.dispatch(token)
		})
	}

	login() {
		supabase.auth.signInWithOAuth({
			provider: 'github',
			options: {
				scopes: 'repo read:user',
			},
		})
	}

	protected async getToken() {
		const { data, error } = await supabase.auth.getSession()

		if (error) throw error

		return data?.session?.access_token
	}
}
