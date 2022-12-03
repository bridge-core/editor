<template>
	<div>
		<v-btn class="rounded-0" small text @click="onMinimize">
			<v-icon>mdi-window-minimize</v-icon>
		</v-btn>
		<v-btn class="rounded-0" small text @click="onMaximize">
			<v-icon>{{
				isMaximized ? 'mdi-window-restore' : 'mdi-window-maximize'
			}}</v-icon>
		</v-btn>
		<v-btn class="rounded-0" color="error" small text @click="onClose">
			<v-icon>mdi-window-close</v-icon>
		</v-btn>
	</div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ConfirmationWindow } from '../Windows/Common/Confirm/ConfirmWindow'
import { App } from '/@/App'

async function useAppWindow() {
	const { appWindow } = await import('@tauri-apps/api/window')

	return appWindow
}

const isMaximized = ref(false)

onMounted(async () => {
	const appWindow = await useAppWindow()

	appWindow.onResized(async () => {
		isMaximized.value = await appWindow.isMaximized()
	})
})

async function onMinimize() {
	const appWindow = await useAppWindow()

	appWindow.minimize()
}
async function onMaximize() {
	const appWindow = await useAppWindow()

	appWindow.toggleMaximize()
}
async function onClose() {
	const appWindow = await useAppWindow()
	const app = await App.getApp()

	if (!app.shouldWarnBeforeClose) return appWindow.close()

	new ConfirmationWindow({
		title: 'general.warnBeforeClosing.title',
		description: 'general.warnBeforeClosing.description',
		onConfirm: () => appWindow.close(),
	})
}
</script>
