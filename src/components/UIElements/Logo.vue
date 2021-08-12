<template>
	<img
		draggable="false"
		:src="isNightly ? '/@/_assets/nightly/logo.svg' : '/@/_assets/logo.svg'"
		alt="Logo of bridge. v2"
	/>
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
