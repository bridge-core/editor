<template>
	<v-system-bar height="30px" color="toolbar">
		<span
			:class="{ 'window-title': !hasSidebar }"
			:style="{
				'padding-left': hasSidebar
					? `calc(${sidebarWidth} + 12px)`
					: undefined,
			}"
		>
			{{ windowTitle }}
		</span>

		<div style="position: absolute; top: 3px">
			<MacWindowControls
				v-if="!hasSidebar"
				:hasCloseButton="hasCloseButton"
				:hasMaximizeButton="hasMaximizeButton"
				:hasMinimizeButton="hasMinimizeButton"
				v-bind="$attrs"
			/>
		</div>
		<v-spacer />
		<DisplayAction
			v-for="action in actions"
			:key="action.id"
			:action="action"
		/>
		<slot />
	</v-system-bar>
</template>

<script>
import DisplayAction from './DisplayAction.vue'
import MacWindowControls from './Mac/WindowControls.vue'

export default {
	name: 'MacToolbar',

	components: {
		MacWindowControls,
		DisplayAction,
	},
	props: {
		windowTitle: String,
		hasSidebar: Boolean,
		actions: Array,
		sidebarWidth: {
			type: String,
			default: '25%',
		},
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
}
</script>

<style scoped>
.window-title {
	position: absolute;
	width: 100%;
	text-align: center;
}
</style>
