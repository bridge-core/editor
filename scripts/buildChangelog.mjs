import MarkdownIt from 'markdown-it'
import { promises as fs } from 'fs'
import fetch from 'node-fetch'

export async function buildChangelog() {
	const html = await fetch(
		'https://api.github.com/repos/bridge-core/editor/releases'
	)
		.then((response) => response.json())
		.then((data) => (console.log(data), data))
		.then((data) => new MarkdownIt().render(data[0].body))

	await fs.writeFile('public/changelog.html', html)
}
