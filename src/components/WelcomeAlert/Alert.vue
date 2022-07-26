<template>
	<v-alert
		v-if="title"
		:value="!!title"
		class="mt-2 mb-8 pa-3"
		color="purple"
		:style="`color: ${textColor}; width: calc(100% - 8px); position: absolute; top: 0; left: 0;`"
		border="bottom"
		rounded="lg"
	>
		<div class="d-flex align-center">
			<v-icon v-if="icon" :color="textColor" large class="pr-2">
				{{ icon }}
			</v-icon>
			<span>{{ title }}</span>
			<v-spacer />
			<v-btn
				v-if="link"
				:style="`color: ${textColor}`"
				@click="onClick"
				text
				dense
			>
				Read more
				<v-icon :color="textColor" class="pl-2">
					mdi-chevron-right
				</v-icon>
			</v-btn>
		</div>
	</v-alert>
</template>

<script>
import { PersistentNotification } from '../Notifications/PersistentNotification'
import { ConfirmationWindow } from '../Windows/Common/Confirm/ConfirmWindow'
import { InformationWindow } from '../Windows/Common/Information/InformationWindow'
import { App } from '/@/App'

export default {
	async mounted() {
		const {
			id,
			icon,
			title,
			description = title,
			textColor = 'white',
			color,
			link,
		} = navigator.onLine
			? await fetch(
					'https://raw.githubusercontent.com/bridge-core/editor-packages/main/remote/welcomeAlert.json'
			  )
					.catch(() => null)
					.then((res) => (res ? res.json() : {}))
			: {}

		this.icon = icon
		this.title = title
		this.color = color
		this.textColor = textColor
		this.link = link

		if (title) {
			const alertMsg = new PersistentNotification({
				id,
				icon,
				message: `[${title}]`,
				color,
				textColor,
				onClick: () => {
					const baseConfig = {
						title: `[${title}]`,
						description: `[${description}]`,
					}

					if (!link) {
						new InformationWindow(baseConfig)
					} else {
						new ConfirmationWindow({
							...baseConfig,
							confirmText: 'general.readMore',
							onConfirm: () => {
								this.onClick()
							},
						})
					}
					alertMsg.dispose()
				},
			})
		}
	},
	data: () => ({
		icon: null,
		title: null,
		color: null,
		textColor: null,
		link: null,
	}),
	methods: {
		onClick() {
			App.openUrl(this.link, null, true)
		},
	},
}
</script>

<style></style>
