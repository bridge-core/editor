<template>
	<v-system-bar height="30px" color="toolbar">
		<span class="px14-font window-title">{{ windowTitle }}</span>

		<div style="position: absolute; top: 3px;">
			<div>
				<MacButton
					v-if="hasCloseButton"
					color="error"
					@click="$emit('closeWindow')"
				/>

				<MacButton
					v-if="hasCloseButton"
					color="warning"
					:disabled="!hasMinimizeButton"
					@click="$emit('minimizeWindow')"
				/>

				<MacButton
					v-if="hasCloseButton"
					color="success"
					:disabled="!hasMaximizeButton"
					@click="$emit('toggleFullscreen')"
				/>
			</div>

			<v-spacer />
			<slot name="toolbar" />
		</div>
	</v-system-bar>
</template>

<script>
import MacButton from './Mac/Button'

export default {
	name: 'MacToolbar',
	components: {
		MacButton,
	},
	props: {
		windowTitle: String,
		hasCloseButton: {
			type: Boolean,
			default: true,
		},
		hasMinimizeButton: {
			type: Boolean,
			default: false,
		},
		hasMaximizeButton: {
			type: Boolean,
			default: true,
		},
	},
	computed: {
		isDarkMode() {
			return this.$vuetify.theme.dark
		},
	},
}
</script>

<style scoped>
.window-title {
	position: absolute;
	width: 100%;
	text-align: center;
}
</style>
