<template>
	<v-btn
		v-if="!isLoggedIn"
		:light="$vuetify.theme.dark"
		:dark="!$vuetify.theme.dark"
		:block="block"
		@click="onLogin"
	>
		<v-icon class="mr-1">mdi-github</v-icon>
		<span>{{ t('login.withGitHub') }}</span>
	</v-btn>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useTranslations } from '../../Composables/useTranslations'
import { App } from '/@/App'

const { t } = useTranslations()

const isLoggedIn = ref(false)

App.getApp().then((app) => {
	app.oAuth.token.once(() => {
		isLoggedIn.value = true
	})
})

defineProps({
	block: Boolean,
})

async function onLogin() {
	const app = await App.getApp()
	app.oAuth.login()
}
</script>
