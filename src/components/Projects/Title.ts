import { ref } from '@vue/composition-api'

export class Title {
	protected titleTag: HTMLTitleElement
	public current = ref('bridge. v2')

	constructor() {
		this.titleTag = document.head.getElementsByTagName('title')[0]
	}

	setProject(projectName: string) {
		this.titleTag.innerText = `${projectName} - bridge. v2`
		this.current.value = `${projectName} - bridge. v2`
	}
}
