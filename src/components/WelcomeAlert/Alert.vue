<template>
	<v-alert
		v-if="title"
		:value="!!title"
		width="100%"
		class="mt-2 mb-12 pa-3"
		color="purple"
		border="bottom"
		rounded="lg"
	>
		<div class="d-flex align-center">
			<v-icon v-if="icon" large class="pr-2">{{ icon }}</v-icon>
			<span>{{ title }}</span>
			<v-spacer />
			<v-btn v-if="link" @click="onClick" text dense>
				Read more
				<v-icon class="pl-2">mdi-chevron-right</v-icon>
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
		} = await fetch(
			'https://raw.githubusercontent.com/bridge-core/editor-packages/main/remote/welcomeAlert.json'
		)
			.then((res) => res.json())
			.catch(() => ({}))

		this.icon = icon
		this.title = title
		this.color = color
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
