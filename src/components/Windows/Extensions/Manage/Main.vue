<template>
	<BaseWindow
		v-if="shouldRender"
		windowTitle="windows.managePlugin.name"
		:isVisible="isVisible"
		:hasMaximizeButton="false"
		:isFullscreen="false"
		:percentageWidth="50"
		:percentageHeight="80"
		@closeWindow="onClose"
	>
		<template #default>
			<h1 class="mb-6 mt-2">{{ plugin.name }}</h1>
			<h2>by {{ plugin.author }} | v{{ plugin.version }}</h2>
			<div class="plugin-controls">
				<v-tooltip color="success" bottom v-if="plugin.active == true">
					<template v-slot:activator="{ on }">
						<v-icon
							v-on="on"
							@click.end="plugin.active = false"
							color="success"
							large
							>mdi-check</v-icon
						>
					</template>
					<span>Deactivate</span>
				</v-tooltip>
				<v-tooltip color="error" bottom v-if="plugin.active == false">
					<template v-slot:activator="{ on }">
						<v-icon
							v-on="on"
							@click.end="plugin.active = true"
							color="error"
							large
							>mdi-close</v-icon
						>
					</template>
					<span>Activate</span>
				</v-tooltip>
				<v-tooltip color="error" bottom>
					<template v-slot:activator="{ on }">
						<v-icon v-on="on" color="error" large class="mx-4"
							>mdi-delete</v-icon
						>
					</template>
					<span>Uninstall</span>
				</v-tooltip>
				<v-tooltip
					color="primary"
					bottom
					v-if="plugin.link != undefined"
				>
					<template v-slot:activator="{ on }">
						<v-icon
							v-on="on"
							@click.end="openLink"
							color="primary"
							large
							class="mx-3"
							>mdi-earth</v-icon
						>
					</template>
					<span>Link</span>
				</v-tooltip>
			</div>
			<v-divider class="my-4" />

			<p>{{ plugin.description }}</p>
		</template>
		<template #actions>
			<v-spacer />
			<v-btn color="primary" @click.end="done">
				{{ t('windows.managePlugin.done') }}
			</v-btn>
		</template>
	</BaseWindow>
</template>

<script>
import BaseWindow from '../../Layout/BaseWindow.vue'
import { TranslationMixin } from '@/utils/locales'

export default {
	name: 'ManagePlugin',
	mixins: [TranslationMixin],
	components: {
		BaseWindow,
	},
	data() {
		return this.currentWindow.getState()
	},
	props: ['currentWindow'],
	methods: {
		onClose() {
			this.currentWindow.close()
		},
		openLink() {
			window.open(this.plugin.link, '_blank')
		},
		done() {
			this.currentWindow.close()
		},
	},
}
</script>

<style scoped>
.plugin-controls {
	position: absolute;
	top: 15%;
	right: 13%;
}
</style>
