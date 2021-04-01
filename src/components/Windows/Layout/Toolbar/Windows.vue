<template>
	<v-system-bar
		height="30px"
		color="toolbar"
		:style="{
			'padding-right': '0px',
			'padding-left': hasSidebar
				? `calc(${sidebarWidth} + 12px)`
				: undefined,
		}"
	>
		<span>{{ windowTitle }}</span>
		<v-spacer></v-spacer>
		<v-toolbar-items class="px14-font">
			<DisplayAction
				v-for="action in actions"
				:key="action.id"
				:action="action"
			/>
			<slot />

			<v-btn
				small
				icon
				@click.stop="$emit('toggleFullscreen')"
				v-if="hasMaximizeButton"
			>
				<v-icon small>mdi-plus</v-icon>
			</v-btn>

			<v-btn
				small
				icon
				color="error"
				@click.stop="$emit('closeWindow')"
				v-if="hasCloseButton"
				class="mr-1"
			>
				<v-icon :color="isDarkMode ? 'white' : 'grey darken-1'" small>
					mdi-close
				</v-icon>
			</v-btn>
		</v-toolbar-items>
	</v-system-bar>
</template>

<script>
import DisplayAction from './DisplayAction.vue'

export default {
	name: 'WindowsToolbar',
	components: {
		DisplayAction,
	},
	props: {
		windowTitle: String,
		actions: Array,
		sidebarWidth: {
			type: String,
			default: '25%',
		},
		hasCloseButton: {
			type: Boolean,
			default: true,
		},
		hasMaximizeButton: {
			type: Boolean,
			default: true,
		},
		hasSidebar: Boolean,
	},
	computed: {
		isDarkMode() {
			return this.$vuetify.theme.dark
		},
	},
}
</script>
