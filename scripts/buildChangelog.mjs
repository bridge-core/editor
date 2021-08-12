import MarkdownIt from 'markdown-it'
import { promises as fs } from 'fs'
import fetch from 'node-fetch'

export async function buildChangelog() {
	let headers
	const GITHUB_TOKEN = process.env.GITHUB_TOKEN

	if (GITHUB_TOKEN !== undefined) {
		headers = {
			Authorization: `token ${GITHUB_TOKEN}`,
		}
	}

	const html = await fetch(
		'https://api.github.com/repos/bridge-core/editor/releases',
		{
			headers: headers,
		},
	)
		.then((response) => response.json())
		.then((data) => new MarkdownIt().render(data[0].body))

	await fs.writeFile('public/changelog.html', html)
}
