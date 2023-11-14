import { extname } from '../path'

const extIconMap: Record<string, string[]> = {
	'mdi-file-image-outline': [
		'.jpg',
		'.jpeg',
		'.png',
		'.gif',
		'.bmp',
		'.webp',
		'.tga',
	],
	'mdi-code-json': ['.json'],
	'mdi-volume-high': ['.mp3', '.wav', '.fsb', '.ogg'],
	'mdi-language-html5': ['.html'],
	'mdi-language-typescript': ['.ts', '.tsx'],
	'mdi-language-javascript': ['.js', '.jsx'],
	'mdi-web': ['.lang'],
}

export function getDefaultFileIcon(name: string) {
	const ext = extname(name)
	for (const [icon, exts] of Object.entries(extIconMap)) {
		if (exts.includes(ext)) return icon
	}

	return 'mdi-file-outline'
}
