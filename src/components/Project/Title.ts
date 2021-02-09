export class Title {
	protected titleTag: HTMLTitleElement

	constructor() {
		this.titleTag = document.head.getElementsByTagName('title')[0]
	}

	setProject(projectName: string) {
		this.titleTag.innerText = `${projectName} Project - bridge.`
	}
}
