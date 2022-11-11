<template>
	<img draggable="false" :src="logoPath" alt="Logo of bridge. v2" />
</template>

<script>
import { isNightly } from '/@/utils/app/isNightly'

export default {
	setup() {
		return {
			logoPath: isNightly
				? `/img/icons/nightly/favicon.svg`
				: `/img/icons/favicon.svg`,
		}
	},
}
</script>
