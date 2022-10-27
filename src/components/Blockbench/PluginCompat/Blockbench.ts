import { compareVersions } from 'bridge-common-utils'
import { createStyleSheet } from '../../Extensions/Styles/createStyle'
import { download } from '../../FileSystem/saveOrDownload'
import { createNotification } from '../../Notifications/create'
import { InformationWindow } from '../../Windows/Common/Information/InformationWindow'

export class Blockbench {
	public static version = '4.2'
	public static platform = 'web'

	static isNewerThan(version: string) {
		return compareVersions(Blockbench.version, version, '>')
	}
	static isOlderThan(version: string) {
		return compareVersions(Blockbench.version, version, '<')
	}

	static addCSS(css: string) {
		// Map Blockbench vars to bridge. equivalents

		css = css.replace(/var\(--color-(.+?)\)/g, (match, varName) => {
			console.log(match, varName)
			if (!blockbenchToBridge[varName]) return `red`
			return `var(--v-${blockbenchToBridge[varName]}-base)`
		})

		const styles = createStyleSheet(css)

		return {
			delete: () => styles.dispose(),
		}
	}

	static showQuickMessage(message: string, time?: number) {
		const window = new InformationWindow({
			description: `[${message}]`,
		})

		window.open()

		if (time) {
			setTimeout(() => {
				window.close()
			}, time)
		}
	}

	static notification(title: string, text: string, icon?: string) {
		createNotification({
			color: 'accent',
			icon,
			message: `[${title}]`,

			onClick: () => {
				new InformationWindow({
					title: `[${title}]`,
					description: `[${text}]`,
				})
			},
		})
	}

	static export({ name, extensions, content }: BlockbenchExport) {
		console.log(name, content)
		download(`${name}.${extensions[0]}`, content)
	}
}

interface BlockbenchExport {
	type: string
	extensions: string[]
	name: string
	content: Uint8Array
	savetype: string
}

const blockbenchToBridge: any = {
	accent: 'accent',
	subtle_text: 'text',
	light: 'background',
}
