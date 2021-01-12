<template>
	<v-system-bar
		v-if="!hideToolbar"
		height="30px"
		color="toolbar"
		style="padding-right: 0px;"
	>
		<span>{{ windowTitle }}</span>
		<v-spacer></v-spacer>
		<v-toolbar-items class="px14-font">
			<slot name="toolbar" />

			<v-btn
				small
				icon
				@click.stop="$emit('toggleFullscreen')"
				v-if="hasMaximizeButton"
			>
				<v-icon small>mdi-plus</v-icon>
			</v-btn>
			<v-divider v-if="hasCloseButton" vertical />
			<v-btn
				small
				icon
				color="error"
				@click.stop="$emit('closeWindow')"
				v-if="hasCloseButton"
			>
				<v-icon :color="isDarkMode ? 'white' : 'grey darken-1'" small>
					mdi-close
				</v-icon>
			</v-btn>
		</v-toolbar-items>
	</v-system-bar>
</template>

<script>
export default {
	name: 'WindowsToolbar',
	props: {
		windowTitle: String,
		hideToolbar: Boolean,
		hasCloseButton: {
			type: Boolean,
			default: true,
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
