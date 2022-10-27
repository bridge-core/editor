import Vue, { del, reactive, ref, set } from 'vue'

interface StartScreenContext {
	color?: string
	text_color?: string
	graphic: Graphic
	text: Text[]
}

interface Graphic {
	type: 'image'
	source: string
	width?: number
	height?: number
}

interface Text {
	type: 'h2'
	text: string
}

export const startScreenContainer = document.createElement('div')
startScreenContainer.id = 'start_screen'

export function addStartScreenSection(
	id: string,
	context: StartScreenContext,
	onClick?: () => void
) {
	const container = document.createElement('div')

	container.innerHTML = `
    <div
	  	id="${id}"
        class="mb-2 pa-2 rounded-lg d-flex align-center"
		style="background: var(--v-expandedSidebar-base);"
    >
		${
			context.graphic && context.graphic.type === 'image'
				? `<img
					class="graphic mr-2"
					src="${context.graphic.source}"
					width="26"
					height="26"
				/>`
				: ''
		}

		${context.text.map(({ text }) => `<span>${text}</span>`)}
	</div>`

	startScreenContainer.appendChild(container)

	if (onClick) container.addEventListener('click', onClick)

	return {
		delete: () => {
			startScreenContainer.removeChild(container)
			if (onClick) container.removeEventListener('click', onClick)
		},
	}
}
