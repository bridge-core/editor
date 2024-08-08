<template>
	<v-alert
		v-if="title && isVisible"
		:value="!!title"
		:class="['mt-2', 'mb-8', 'pa-3', { 'clickable-alert': !link }]"
		:color="color"
		:style="`color: ${textColor}; width: 100%; position: absolute; top: 0; left: 0;`"
		border="bottom"
		rounded
		@click="handleAlertClick"
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
			description,
			textColor = 'white',
			color,
			link,
			experimentRequired,
			isVisible,
		} = navigator.onLine
			? await fetch(
					'https://raw.githubusercontent.com/bridge-core/editor-packages/main/remote/welcomeAlert.json'
			  )
					.then((res) => res.json())
					.catch(() => ({}))
			: {}
		this.icon = icon
		this.title = title
		this.color = color
		this.textColor = textColor
		this.link = link
		this.isVisible = isVisible
		this.description = description

		const app = await App.getApp()
		const experimentalGameplay =
			app.projectConfig.get().experimentalGameplay

		if (experimentRequired !== undefined && this.isVisible !== false) {
			this.isVisible = experimentRequired
				? experimentalGameplay?.[experimentRequired] === true
				: false
		}

		if (title) {
			const alertMsg = new PersistentNotification({
				id,
				icon,
				message: `[${title}]`,
				color,
				textColor,
				isVisible: this.isVisible,
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
		isVisible: null,
		description: null,
	}),
	methods: {
		handleAlertClick() {
			if (!this.link) {
				this.onClick()
			}
		},
		onClick() {
			if (this.link) {
				App.openUrl(this.link, null, true)
			} else {
				this.otherClick()
			}
		},
		otherClick() {
			const baseConfig = {
				title: this.title,
				description: this.description,
			}

			new InformationWindow(baseConfig)
		},
	},
}
</script>

<style scoped>
.clickable-alert {
	cursor: pointer;
}
</style>
