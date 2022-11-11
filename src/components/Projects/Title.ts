import { ref } from 'vue'
import { virtualProjectName } from './Project/Project'
import { isNightly } from '/@/utils/app/isNightly'

const appName = isNightly ? 'bridge. Nightly' : 'bridge. v2'
export class Title {
	protected titleTag: HTMLTitleElement
	public current = ref('')
	public appName = appName

	constructor() {
		this.titleTag = document.head.getElementsByTagName('title')[0]
	}

	setProject(projectName: string) {
		if (projectName === virtualProjectName) {
			this.titleTag.innerText = ''
			this.current.value = ''
		} else {
			this.titleTag.innerText = projectName
			this.current.value = projectName
		}
	}
}
