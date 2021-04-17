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
import { WindowState } from './WindowState'

export default {
	name: 'CollectedWindows',

	data: () => ({
		windows: WindowState.state,
	}),
}
</script>
