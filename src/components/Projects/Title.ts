import { ref } from '@vue/composition-api'
import { isNightly } from '/@/utils/app/isNightly'

const appName = isNightly ? 'bridge. Nightly' : 'bridge. v2'
export class Title {
	protected titleTag: HTMLTitleElement
	public current = ref(`${appName} - No Project`)

	constructor() {
		this.titleTag = document.head.getElementsByTagName('title')[0]
	}

	setProject(projectName: string) {
		this.titleTag.innerText = projectName
		this.current.value = `${appName} - ${projectName}`
	}
}
