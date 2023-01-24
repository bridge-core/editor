import { App } from '/@/App'
import { version as appVersion } from '/@/utils/app/version'

export async function getFromGithub(
	endpoint: string,
	ctx?: Record<string, string>
) {
	const app = await App.getApp()
	const token = await app.oAuth.token.fired
	console.log(token)

	// Base github api url
	const url = `https://api.github.com/${endpoint}`

	// Convert ctx to query string
	const query = ctx
		? Object.entries(ctx)
				.map(([key, value]) => `${key}=${value}`)
				.join('&')
		: null

	// Append query string to url
	const fullUrl = query ? `${url}?${query}` : url

	const resp = await fetch(fullUrl, {
		headers: {
			authorization: `Bearer ${token}`,
			'user-agent': `bridge./${appVersion}`,
		},
	})

	return await resp.json()
}
