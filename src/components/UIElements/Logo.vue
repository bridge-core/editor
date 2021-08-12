<template>
	<img
		v-if="isNightly"
		draggable="false"
		src="/@/_assets/nightly/logo.svg"
		alt="Logo of bridge. v2"
	/>
	<img v-else src="/@/_assets/logo.svg" alt="Logo of bridge. v2" />
</template>

<script>
import { isNightly } from '/@/utils/app/isNightly'

export default {
	setup() {
		return {
			isNightly: isNightly,
		}
	},
}
</script>
