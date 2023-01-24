<template>
	<div
		:class="{
			'pb-16 d-flex flex-column justify-center align-center mx-2': true,
			'ml-0': isContentVisible && !isAttachedRight,
			'mr-0': isContentVisible && isAttachedRight,
		}"
		:style="{ height: height + 'px' }"
		style="position: relative"
	>
		<WelcomeAlert />

		<div
			class="d-flex flex-column justify-center align-center"
			style="width: 50vw; max-width: 500px"
		>
			<Logo
				style="height: 160px; width: 160px"
				class="mt-4 mb-8"
				alt="Logo of bridge. v2"
			/>

			<CommandBar />

			<BridgeSheet
				v-if="nativeBuildAvailable"
				@click="openDownloadPage"
				class="px-2 py-1 mt-4 text-center"
			>
				<v-icon color="primary">mdi-download</v-icon>
				{{ t('general.downloadNativeApp') }}
			</BridgeSheet>
		</div>

		<div v-if="user">
			<v-avatar size="32">
				<img :src="user.avatarUrl" :alt="user.login" />
			</v-avatar>
			<span>{{ user.login }}</span>
		</div>
	</div>
</template>

<script setup>
import Logo from '../UIElements/Logo.vue'
import CommandBar from '../CommandBar/CommandBar.vue'
import WelcomeAlert from '/@/components/WelcomeAlert/Alert.vue'
import BridgeSheet from '/@/components/UIElements/Sheet.vue'
import { App } from '/@/App'
import { useTranslations } from '../Composables/useTranslations'
import { computed } from 'vue'
import { useSidebarState } from '../Composables/Sidebar/useSidebarState'
import { getFromGithub } from '../Backend/Get'
import { ref } from 'vue'

const user = ref(null)

getFromGithub('user').then((githubUser) => {
	user.value = {
		login: githubUser.login,
		avatarUrl: githubUser.avatar_url,
	}
})

const { t } = useTranslations()
const { isContentVisible, isAttachedRight } = useSidebarState()

const nativeBuildAvailable = computed(() => {
	return !import.meta.env.VITE_IS_TAURI_APP && !App.instance.mobile.is.value
})

defineProps({
	height: Number,
})

function openDownloadPage() {
	App.openUrl('https://bridge-core.app/guide/download/')
}
</script>

<style scoped>
ul {
	padding-left: 0;
}
div,
li {
	list-style-type: none;
}
span {
	margin-left: 4px;
}
p {
	margin-bottom: 0;
}
.clickable {
	cursor: pointer;
}
.pack-icon {
	height: 24px;
	image-rendering: pixelated;
}
.disabled {
	opacity: 0.2;
}
</style>
