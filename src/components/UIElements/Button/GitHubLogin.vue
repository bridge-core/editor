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
import { OauthToken } from '../../SourceControl/OAuth/Token'
import { App } from '/@/App'

const { t } = useTranslations()

const isLoggedIn = ref(false)

OauthToken.setup.once(() => {
	isLoggedIn.value = true
})

defineProps({
	block: Boolean,
})

function onLogin() {
	App.openUrl(
		'https://bridge-editor.deno.dev/login?to=http://localhost:8080/callback.html',
		'login',
		false
	)
}
</script>
