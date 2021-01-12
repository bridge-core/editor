<template>
	<BaseWindow
		v-if="shouldRender"
		windowTitle="Discord"
		:isVisible="isVisible"
		:hasMaximizeButton="false"
		:isFullscreen="false"
		:width="420"
		:height="80"
		@closeWindow="close"
	>
		<template #default>
			<p>{{ t('windows.discord.content') }}</p>
		</template>

		<template #actions>
			<v-spacer />
			<v-btn @click="close">
				<span>{{ t('windows.discord.later') }}</span>
			</v-btn>
			<v-btn color="#7289DA" @click="openDiscord">
				<v-icon color="white">mdi-discord</v-icon>
				<span class="white--text">{{ t('windows.discord.join') }}</span>
			</v-btn>
		</template>
	</BaseWindow>
</template>

<script>
import { Discord } from './definition'
import BaseWindow from '../Layout/BaseWindow.vue'
import { TranslationMixin } from '@/utils/locales'

export default {
	name: 'Discord',
	mixins: [TranslationMixin],
	components: {
		BaseWindow,
	},

	data: () => Discord.getState(),
	methods: {
		close: () => Discord.close(),
		openDiscord() {
			window.open('https://discord.gg/jj2PmqU', '_blank')
		},
	},
}
</script>

<style></style>
