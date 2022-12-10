<template>
	<div
		:class="`pb-16 d-flex flex-column justify-center align-center ${containerPadding}`"
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

			<BridgeSheet @click="openDownloadPage" class="px-2 py-1 mt-4">
				<v-icon color="primary">mdi-download</v-icon>
				{{ t('general.downloadNativeApp') }}
			</BridgeSheet>
		</div>
	</div>
</template>

<script setup>
import Logo from '../UIElements/Logo.vue'
import WelcomeAlert from '../WelcomeAlert/Alert.vue'
import CommandBar from '../CommandBar/CommandBar.vue'
import BridgeSheet from '/@/components/UIElements/Sheet.vue'
import { App } from '/@/App'
import { useTranslations } from '../Composables/useTranslations'

const { t } = useTranslations()

defineProps({
	containerPadding: String,
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
