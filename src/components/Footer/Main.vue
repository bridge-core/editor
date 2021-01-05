<template>
	<v-footer color="footer" fixed padless app height="32px">
		<span class="footer-container">
			<!-- prettier-ignore-attribute v-for -->
			<Notification
				v-for="({
					onClick,
					onMiddleClick,
					icon,
					message,
					color,
					textColor,
					expiration,
				}, key) in NotificationStore"
				:key="key"
				style="margin-right: 4px;"
				:icon="icon"
				:message="message"
				:color="color"
				:textColor="textColor"
				:expiration="expiration"
				@click="onClick"
				@click.middle.native="onMiddleClick"
			/>
		</span>

		<v-spacer></v-spacer>
		<v-divider vertical></v-divider>
		<span class="py-1 px-2">
			<a
				style="font-size: 12px;"
				class="grey--text text--lighten-1 font-weight-light"
				@click="openGitHub"
			>
				{{ APP_VERSION }}
			</a>
		</span>
	</v-footer>
</template>

<script>
import Notification from './Notification'
import { NotificationStore } from './state'
import { App } from '@/App'
// import { APP_VERSION } from '../../constants'
const APP_VERSION = 'v0.1.0'

export default {
	name: 'Footer',
	components: {
		Notification,
	},
	data: () => ({
		NotificationStore,
		APP_VERSION,
	}),
	methods: {
		openGitHub() {
			App.createNativeWindow('https://bridge-core.github.io/', '_blank')
		},
	},
}
</script>

<style scoped>
*::-webkit-scrollbar {
	width: 4px;
	height: 4px;
}
.footer-container {
	padding: 4px 12px 2px 12px;
	overflow-x: auto;
	overflow-y: hidden;
	height: 100%;
	width: calc(100% - 50px);
	white-space: nowrap;
}
</style>
