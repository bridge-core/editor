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
			<v-btn v-if="!link" @click="onClick" text dense>
				Read more
				<v-icon class="pl-2">mdi-chevron-right</v-icon>
			</v-btn>
		</div>
	</v-alert>
</template>

<script>
import { PersistentNotification } from '../Notifications/PersistentNotification'
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
					new InformationWindow({
						name: `[${title}]`,
						description: `[${description}]`,
					})
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
