<template>
	<div>
		<component
			v-for="(window, uuid) in windows"
			:key="uuid"
			:is="window.component"
			:currentWindow="window"
		/>
	</div>
</template>

<script>
import { App } from '/@/App'

export default {
	name: 'CollectedWindows',

	data: () => ({
		windows: App.windowState.state,
	}),
}
</script>
