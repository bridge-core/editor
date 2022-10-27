import { addStartScreenSection } from '../StartScreen/addSection'

export interface IModelLoaderContext {
	name: string
	description: string
	icon: string
	target: string
	/**
	 * Vue component
	 */
	format_page: any

	onStart?: () => void
}

export class ModelLoader {
	constructor(id: string, { name, icon, onStart }: IModelLoaderContext) {
		addStartScreenSection(
			id,
			{
				text: [{ type: 'h2', text: name }],

				graphic: {
					type: 'image',
					source: icon,
				},
			},
			onStart
		)
	}
}
