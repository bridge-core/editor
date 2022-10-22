<template>
	<div>
		<CommandBarWindow />

		<component
			v-for="(window, uuid) in windows"
			:key="uuid"
			:is="window.component"
			:currentWindow="window"
			:window="window"
		/>
	</div>
</template>

<script>
import { App } from '/@/App'
import CommandBarWindow from '/@/components/CommandBar/Window.vue'

export default {
	name: 'CollectedWindows',
	components: {
		CommandBarWindow,
	},

	data: () => ({
		windows: App.windowState.state,
	}),
}
</script>
