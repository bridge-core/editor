<template>
	<BaseWindow
		v-if="state.shouldRender"
		windowTitle="windows.socials.title"
		:isVisible="state.isVisible"
		:hasMaximizeButton="false"
		:isFullscreen="false"
		:width="420"
		:height="140"
		@closeWindow="close"
	>
		<template #default>
			<p>{{ t('windows.socials.content') }}</p>
		</template>

		<template #actions>
			<v-spacer />
			<v-btn color="#7289DA" @click="openDiscord">
				<v-icon color="white">mdi-discord</v-icon>
				<span class="white--text">{{
					t('windows.socials.discord')
				}}</span>
			</v-btn>
			<v-btn color="#1DA1F2" @click="openTwitter">
				<v-icon color="white">mdi-twitter</v-icon>
				<span class="white--text">{{
					t('windows.socials.twitter')
				}}</span>
			</v-btn>
			<v-btn color="#333" @click="openGithub">
				<v-icon color="white">mdi-github</v-icon>
				<span class="white--text">{{
					t('windows.socials.github')
				}}</span>
			</v-btn>
		</template>
	</BaseWindow>
</template>

<script lang="ts" setup>
import { useTranslations } from '../../Composables/useTranslations'
import BaseWindow from '../Layout/BaseWindow.vue'

const { t } = useTranslations()

const props = defineProps(['window'])
const state = props.window.getState()

function close() {
	props.window.close()
}
function openDiscord() {
	window.open('https://discord.gg/jj2PmqU', '_blank')
}
function openTwitter() {
	window.open('https://twitter.com/bridgeIDE', '_blank')
}
function openGithub() {
	window.open('https://github.com/bridge-core', '_blank')
}
</script>
